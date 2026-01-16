import Phaser from 'phaser';
import { AssetLoader } from '../managers/AssetLoader';
import { GameState } from '../managers/GameState';
import { SkillManager } from '../managers/SkillManager';
import { Projectile } from '../game/Projectile';
import { Background } from '../game/Background';
import { Character } from '../game/Character';
import { Enemy } from '../game/Enemy';
import { UIManager } from '../ui/UIManager';

// 메인 게임 씬
export class GameScene extends Phaser.Scene {
    autoSaveTimer?: Phaser.Time.TimerEvent;
    autoFireTimer?: Phaser.Time.TimerEvent;
    bossTimer?: Phaser.Time.TimerEvent;
    bossTimerStartTime?: number;
    
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init(data?: { selectDungeonTab?: boolean }): void {
        // 던전 씬에서 돌아왔는지 확인
        if (data?.selectDungeonTab) {
            // 던전 탭 인덱스는 3 (Stats=0, Upgrade=1, Skill=2, 던전=3, Lock=4)
            (this as any).shouldSelectDungeonTab = true;
        }
    }
    
    // 스킬 사용 (UIManager에서 호출)
    useSkill(skillId: string): void {
        const used = SkillManager.tryUseSkill(this, skillId);
        if (used) {
            // 스킬 사용 후 UI 업데이트
            UIManager.update(this);
        }
    }
    
    // 스킬 습득 (UIManager에서 호출)
    learnSkill(skillId: string): void {
        const learned = SkillManager.tryLearnSkill(skillId);
        if (learned) {
            // 스킬 습득 후 UI 업데이트 및 사용 버튼 생성
            // 스킬 탭을 다시 생성하여 습득 상태 반영
            const gameWidth = this.scale.width;
            const gameHeight = this.scale.height;
            const halfHeight = gameHeight * 0.5;
            const uiAreaHeight = gameHeight * 0.5;
            const uiAreaStartY = halfHeight;
            UIManager.createSkillTab(this, gameWidth, gameHeight, halfHeight, uiAreaHeight, uiAreaStartY, 2);
            UIManager.update(this);
            UIManager.createSkillUseButtons(this);
        }
    }
    
    preload(): void {
        // 에셋 로드
        AssetLoader.preload(this);
    }
    
    create(): void {
        // 저장된 게임 상태 로드
        GameState.load();
        
        // Phaser가 자동으로 preload 완료 후 create 호출하므로 바로 초기화
        this.initializeGame();
    }
    
    initializeGame(): void {
        // 이전 타이머들 정리 (씬 재시작 시)
        if (this.bossTimer) {
            this.bossTimer.remove();
            this.bossTimer = undefined;
        }
        this.bossTimerStartTime = undefined;
        
        if (this.autoFireTimer) {
            this.autoFireTimer.remove();
            this.autoFireTimer = undefined;
        }
        
        // 투사체 풀 초기화
        Projectile.init(this);
        
        // 배경 생성
        Background.create(this);
        
        // 캐릭터 생성
        Character.create(this);
        
        // 적 생성 (위쪽 절반 영역에 배치)
        const enemyX = this.scale.width * 0.15;
        const enemyY = this.scale.height * 0.33;
        Enemy.create(this, enemyX, enemyY);
        
        // UI 생성
        UIManager.create(this);
        
        // 자동 발사 타이머 설정 (로드된 상태 반영)
        this.setupAutoFire();
        
        // 보스 타이머 시작 (보스 스테이지인 경우)
        this.updateBossTimer();
        
        // UI 업데이트 (로드된 상태 반영)
        UIManager.update(this);
        
        // 던전 씬에서 돌아왔다면 던전 탭 선택
        if ((this as any).shouldSelectDungeonTab) {
            UIManager.switchTab(3); // 던전 탭 인덱스는 3
            (this as any).shouldSelectDungeonTab = false;
        }
        
        // 주기적 자동 저장 시작
        this.startAutoSave();
    }
    
    // 주기적 자동 저장 시작
    startAutoSave(): void {
        this.autoSaveTimer = this.time.addEvent({
            delay: 10000, // 10초마다
            callback: () => {
                GameState.save();
            },
            loop: true
        });
    }
    
    // 자동 발사 설정
    setupAutoFire(): void {
        // 기존 타이머가 있으면 제거
        if (this.autoFireTimer) {
            this.autoFireTimer.remove();
        }
        
        // 공격 속도가 활성화되어 있으면 타이머 시작
        if (GameState.attackSpeed > 0) {
            const fireInterval = 1000 / GameState.attackSpeed; // 초당 N회 = 1000ms / N
            
            this.autoFireTimer = this.time.addEvent({
                delay: fireInterval,
                callback: () => {
                    Character.fireProjectile(this, 'auto');
                },
                loop: true
            });
        }
    }
    
    update(_time: number, delta: number): void {
        // 캐릭터 업데이트
        Character.update(this);
        
        // 투사체 업데이트
        Projectile.update(this, delta);
        
        // HP 바 위치 업데이트
        if (Enemy.enemy && Enemy.hpBar) {
            Enemy.updateHpBarPosition();
        }
        
        // 보스 타이머 관리
        this.updateBossTimer();
        
        // UI 업데이트 (타이머 표시용)
        UIManager.update(this);
        
        // 버프 만료 체크 및 쿨타임 적용 (자동 스킬 사용 체크보다 먼저 실행)
        this.checkBuffExpiration();
        
        // 자동 스킬 사용 체크
        this.checkAutoSkillUse();
        
        // 투사체와 enemy 충돌 감지
        // 배열을 복사하여 순회 (제거 시 인덱스 문제 방지)
        const projectilesToCheck = [...Projectile.active];
        for (let i = 0; i < projectilesToCheck.length; i++) {
            const projectile = projectilesToCheck[i];
            // 이미 제거된 투사체는 건너뛰기
            if (!projectile || !projectile.active) continue;
            
            if (Enemy.checkCollision(projectile)) {
                Enemy.onHit(this, projectile);
                Projectile.remove(projectile);
            }
        }
    }
    
    // 자동 스킬 사용 체크
    checkAutoSkillUse(): void {
        const learnedSkills = GameState.learnedSkills;
        for (const skillId of learnedSkills) {
            // 자동 사용이 켜져 있고, 쿨타임이 끝났으면 자동으로 사용
            if (GameState.isSkillAutoUse(skillId)) {
                const now = this.time.now;
                if (SkillManager.canUseSkill(skillId, now)) {
                    // 적이 있으면 스킬 사용
                    if (Enemy.enemy) {
                        SkillManager.tryUseSkill(this, skillId);
                    }
                }
            }
        }
    }
    
    // 버프 만료 체크 및 쿨타임 적용
    checkBuffExpiration(): void {
        const now = this.time.now;
        const activeBuffs = GameState.activeBuffs;
        
        for (const skillId in activeBuffs) {
            const buff = activeBuffs[skillId];
            // 버프가 만료되었는지 확인
            if (now >= buff.endTime) {
                // 버프 제거
                GameState.removeBuff(skillId);
                
                // 버프 만료 후 쿨타임 적용
                SkillManager.lastUsedAt[skillId] = now;
                console.log(`버프 만료: ${skillId}, 쿨타임 시작`);
            }
        }
    }
    
    // 보스 타이머 시작
    startBossTimer(): void {
        // 기존 타이머가 있으면 제거
        if (this.bossTimer) {
            this.bossTimer.remove();
        }
        
        // 보스 스테이지일 때만 타이머 시작
        if (GameState.isBossStage()) {
            this.bossTimerStartTime = this.time.now;
            this.bossTimer = this.time.addEvent({
                delay: 15000, // 15초
                callback: () => {
                    this.onBossTimerExpired();
                },
                loop: false
            });
        }
    }
    
    // 보스 타이머 업데이트 (UI 업데이트용)
    updateBossTimer(): void {
        // 보스 스테이지가 아니면 타이머 제거
        if (!GameState.isBossStage()) {
            if (this.bossTimer) {
                this.bossTimer.remove();
                this.bossTimer = undefined;
                this.bossTimerStartTime = undefined;
            }
            return;
        }
        
        // 보스 스테이지인데 타이머가 없으면 시작
        if (!this.bossTimer && this.bossTimerStartTime === undefined) {
            this.startBossTimer();
        }
    }
    
    // 보스 타이머 만료 시 처리
    onBossTimerExpired(): void {
        GameState.onBossTimerExpired();
        // 보스가 아니면 그냥 리스폰
        if (Enemy.enemy) {
            Enemy.respawn(this);
        }
        
        // UI 업데이트
        UIManager.update(this);
        
        // 타이머 제거
        if (this.bossTimer) {
            this.bossTimer.remove();
            this.bossTimer = undefined;
            this.bossTimerStartTime = undefined;
        }
    }
    
    // 보스 처치 시 호출 (Enemy에서 호출)
    onBossDefeated(): void {
        // 타이머 제거
        if (this.bossTimer) {
            this.bossTimer.remove();
            this.bossTimer = undefined;
            this.bossTimerStartTime = undefined;
        }
        
        // 다음 적이 보스면 타이머 시작 (스테이지가 올라갔을 수도 있음)
        if (GameState.isBossStage()) {
            this.startBossTimer();
        }
    }
}
