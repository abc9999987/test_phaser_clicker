import { BaseDungeonScene } from './BaseDungeonScene';
import { AssetLoader } from '../../managers/AssetLoader';
import { GameState } from '../../managers/GameState';
import { SkillManager } from '../../managers/SkillManager';
import { Projectile } from '../../game/Projectile';
import { Character } from '../../game/Character';
import { DungeonBoss } from '../../game/DungeonBoss';
import { UIManager } from '../../ui/UIManager';
import { DungeonConfigs } from '../../config/dungeonConfig';
import { Responsive } from '../../utils/Responsive';

// 골드 던전 씬
export class GoldDungeonScene extends BaseDungeonScene {
    autoFireTimer?: Phaser.Time.TimerEvent;
    dungeonTimer?: Phaser.Time.TimerEvent;
    dungeonTimerStartTime?: number;
    isFailed: boolean = false; // 실패 상태 플래그
    
    constructor() {
        super('GoldDungeonScene');
    }
    
    // 던전별 에셋 로드
    protected loadDungeonAssets(): void {
        // 기본 에셋 로드 (캐릭터, 무기 등)
        AssetLoader.preload(this);
    }
    
    // 던전별 초기화
    protected initializeDungeon(): void {
        const dungeonConfig = DungeonConfigs.find(d => d.id === 'gold_dungeon');
        if (!dungeonConfig) {
            console.error('골드 던전 설정을 찾을 수 없습니다.');
            return;
        }
        
        // 던전 설정 저장
        this.setDungeonConfig(dungeonConfig);
        
        // 저장된 게임 상태 로드
        GameState.load();
        
        // 던전 단계 가져오기
        const dungeonLevel = GameState.getDungeonLevel(dungeonConfig.id);
        
        // 이전 타이머 정리 (씬 재시작 시)
        if (this.dungeonTimer) {
            this.dungeonTimer.remove();
            this.dungeonTimer = undefined;
        }
        this.dungeonTimerStartTime = undefined;
        this.isFailed = false;
        
        // 투사체 풀 초기화 및 정리
        Projectile.clear(); // 기존 투사체 모두 제거
        Projectile.init(this);
        
        // 캐릭터 생성
        Character.create(this);
        
        // 던전 보스 생성
        DungeonBoss.create(this, dungeonConfig, dungeonLevel);
        
        // UI 생성 (Tab 제외)
        UIManager.createForDungeon(this, dungeonConfig.name, dungeonLevel);
        
        // 자동 발사 설정
        this.setupAutoFire();
        
        // 던전 타이머 시작 (timeLimit이 설정되어 있으면)
        // 씬이 시작된 직후에 타이머를 시작하므로 this.time.now는 0에 가까움
        this.startDungeonTimer();
        
        // UI 업데이트
        UIManager.update(this);
        
        // Character에서 DungeonBoss 접근할 수 있도록 씬에 참조 저장
        (this as any).DungeonBoss = DungeonBoss;
    }
    
    // 자동 발사 설정
    setupAutoFire(): void {
        // 기존 타이머가 있으면 제거
        if (this.autoFireTimer) {
            this.autoFireTimer.remove();
        }
        
        // 공격 속도가 활성화되어 있으면 타이머 시작
        if (GameState.attackSpeed > 0) {
            const fireInterval = 1000 / GameState.attackSpeed;
            
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
        // 실패 상태면 업데이트 중단 (단, 투사체는 계속 업데이트하여 정리)
        if (this.isFailed) {
            // 실패 상태에서도 투사체는 업데이트하여 정리 (velocity 0인 투사체 제거)
            Projectile.update(this, delta);
            return;
        }
        
        // 캐릭터 업데이트
        Character.update(this);
        
        // 투사체 업데이트
        Projectile.update(this, delta);
        
        // HP 바 위치 업데이트
        if (DungeonBoss.boss && DungeonBoss.hpBar) {
            DungeonBoss.updateHpBarPosition();
        }
        
        // UI 업데이트
        UIManager.update(this);
        
        // 버프 만료 체크
        this.checkBuffExpiration();
        
        // 자동 스킬 사용 체크
        this.checkAutoSkillUse();
        
        // 투사체와 보스 충돌 감지
        const projectilesToCheck = [...Projectile.active];
        for (let i = 0; i < projectilesToCheck.length; i++) {
            const projectile = projectilesToCheck[i];
            if (!projectile || !projectile.active) continue;
            
            if (DungeonBoss.checkCollision(projectile)) {
                DungeonBoss.onHit(this, projectile);
                Projectile.remove(projectile);
            }
        }
    }
    
    // 자동 스킬 사용 체크
    checkAutoSkillUse(): void {
        const learnedSkills = GameState.learnedSkills;
        for (const skillId of learnedSkills) {
            if (GameState.isSkillAutoUse(skillId)) {
                const now = this.time.now;
                if (SkillManager.canUseSkill(skillId, now) && DungeonBoss.boss) {
                    SkillManager.tryUseSkill(this, skillId);
                }
            }
        }
    }
    
    // 버프 만료 체크
    checkBuffExpiration(): void {
        const now = this.time.now;
        const activeBuffs = GameState.activeBuffs;
        
        for (const skillId in activeBuffs) {
            const buff = activeBuffs[skillId];
            if (now >= buff.endTime) {
                GameState.removeBuff(skillId);
                SkillManager.lastUsedAt[skillId] = now;
            }
        }
    }
    
    // 던전 타이머 시작
    startDungeonTimer(): void {
        const dungeonConfig = this.getDungeonConfig();
        if (!dungeonConfig || !dungeonConfig.timeLimit) {
            // 타이머가 설정되지 않았으면 시작하지 않음
            return;
        }
        
        // 기존 타이머가 있으면 제거
        if (this.dungeonTimer) {
            this.dungeonTimer.remove();
            this.dungeonTimer = undefined;
        }
        
        // 타이머 시작 시간 저장 (씬이 시작된 직후이므로 this.time.now는 0에 가까움)
        // 하지만 씬이 완전히 초기화된 후에 호출되므로 약간의 지연이 있을 수 있음
        // 따라서 씬이 시작된 시점을 기준으로 하기 위해 this.time.now 사용
        this.dungeonTimerStartTime = this.time.now;
        
        // 타이머 시작
        this.dungeonTimer = this.time.addEvent({
            delay: dungeonConfig.timeLimit * 1000, // 밀리초로 변환
            callback: () => {
                this.onTimerExpired();
            },
            loop: false
        });
    }
    
    // 타이머 만료 시 처리
    onTimerExpired(): void {
        // 이미 실패 처리되었거나 보스가 처치되었으면 무시
        if (this.isFailed || DungeonBoss.isDefeated) {
            return;
        }
        
        this.isFailed = true;
        
        // 타이머 제거
        if (this.dungeonTimer) {
            this.dungeonTimer.remove();
            this.dungeonTimer = undefined;
        }
        this.dungeonTimerStartTime = undefined;
        
        // 모든 투사체 제거 (오브젝트 풀링이므로 원위치로)
        // velocity도 0으로 설정되어야 함
        Projectile.clear();
        
        // 실패 메시지 표시
        this.showFailureMessage();
    }
    
    // 실패 메시지 표시
    showFailureMessage(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        
        // "실패!" 텍스트 생성
        const failFontSize = Responsive.getFontSize(this, 64);
        const failText = this.add.text(gameWidth / 2, gameHeight / 2, '실패!', {
            fontSize: failFontSize,
            color: '#ff0000',
            fontFamily: 'Arial',
            font: `bold ${failFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 6
        });
        failText.setOrigin(0.5);
        failText.setDepth(100); // 다른 요소 위에 표시
        
        // Fade out 애니메이션
        this.tweens.add({
            targets: failText,
            alpha: 0,
            duration: 2000, // 2초 동안 페이드 아웃
            ease: 'Power2',
            onComplete: () => {
                failText.destroy();
                // 메인 씬으로 복귀 (던전 탭 선택)
                this.scene.start('GameScene', { selectDungeonTab: true });
            }
        });
    }
    
    // 보스 처치 시 호출 (DungeonBoss에서 호출)
    onBossDefeated(): void {
        // 타이머 제거
        if (this.dungeonTimer) {
            this.dungeonTimer.remove();
            this.dungeonTimer = undefined;
            this.dungeonTimerStartTime = undefined;
        }
        
        // 게임 씬으로 복귀 (던전 탭 선택)
        this.scene.start('GameScene', { selectDungeonTab: true });
    }
    
    // 스킬 사용 (UIManager에서 호출)
    useSkill(skillId: string): void {
        const used = SkillManager.tryUseSkill(this, skillId);
        if (used) {
            UIManager.update(this);
        }
    }
    
    // 스킬 습득 (던전에서는 사용하지 않지만 호환성을 위해)
    learnSkill(_skillId: string): void {
        // 던전에서는 스킬 습득 불가
    }
}
