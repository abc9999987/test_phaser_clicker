import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';
import { Effects } from '../utils/Effects';
import { GameState } from '../managers/GameState';
import { ProjectileType } from './Projectile';
import { UIManager } from '../ui/UIManager';
import { StatManager } from '../managers/state/StatManager';

// 적 관리
export const Enemy = {
    enemy: null as Phaser.GameObjects.Image | null,
    hp: 100,  // 적의 HP
    maxHp: 100,  // 최대 HP
    hpBar: null as Phaser.GameObjects.Graphics | null,
    isDefeated: false,  // 처치 상태 플래그 (중복 처치 방지)
    isBoss: false,  // 보스 여부
    pulseTween: null as Phaser.Tweens.Tween | null,  // 펄스 애니메이션 트윈
    
    // 적 생성
    create(scene: Phaser.Scene, baseX: number, baseY: number): Phaser.GameObjects.Image {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 위치를 비율로 변환 (모바일 세로 해상도 기준)
        const x = (baseX / 390) * gameWidth;
        const y = (baseY / 844) * gameHeight;
        
        // 보스 여부 확인
        this.isBoss = GameState.isBossStage();
        this.enemy = scene.add.image(x, y, this.isBoss ? 'stage_enemy_1_boss' : 'stage_enemy_1');
        
        // 보스면 크기 2배, 아니면 기본 크기
        const baseScale = 0.13 * scale.uniform;
        this.enemy.setScale(this.isBoss ? baseScale * 1.02 : baseScale);
        
        // 스테이지별 HP 설정
        this.maxHp = GameState.getEnemyHp();
        this.hp = this.maxHp;
        this.isDefeated = false;
        
        // HP 바 생성
        this.createHpBar(scene);
        
        // 펄스 애니메이션 시작
        this.startPulseAnimation(scene);
        
        return this.enemy;
    },
    
    // HP 바 생성
    createHpBar(scene: Phaser.Scene): void {
        if (!this.enemy) return;
        
        this.hpBar = scene.add.graphics();
        this.hpBar.setDepth(20); // 적 위에 표시
        this.updateHpBar();
    },
    
    // HP 바 업데이트
    updateHpBar(): void {
        if (!this.enemy || !this.hpBar) return;
        
        // 보스면 HP 바 크기 증가
        const barWidth = this.isBoss ? 120 : 80;
        const barHeight = this.isBoss ? 10 : 8;
        const x = this.enemy.x - barWidth / 2;
        const y = this.enemy.y - (this.enemy.height * this.enemy.scaleY) / 2 - 20;
        
        this.hpBar.clear();
        
        // 배경 (빨간색)
        this.hpBar.fillStyle(0xff0000, 0.5);
        this.hpBar.fillRect(x, y, barWidth, barHeight);
        
        // HP (보스면 주황색, 일반은 초록색)
        const hpPercent = Math.max(0, Math.min(1, this.hp / this.maxHp));
        this.hpBar.fillStyle(this.isBoss ? 0xff8800 : 0x00ff00, 1);
        this.hpBar.fillRect(x, y, barWidth * hpPercent, barHeight);
        
        // 테두리
        this.hpBar.lineStyle(2, 0xffffff, 1);
        this.hpBar.strokeRect(x, y, barWidth, barHeight);
    },
    
    // HP 바 위치 업데이트 (적이 움직일 때 호출)
    updateHpBarPosition(): void {
        this.updateHpBar();
    },
    
    // 투사체와의 충돌 감지
    checkCollision(projectile: ProjectileType): boolean {
        if (!this.enemy || !projectile || this.isDefeated) return false; // 처치된 상태면 충돌 무시
        
        // 간단한 원형 충돌 감지
        const dx = projectile.x - this.enemy.x;
        const dy = projectile.y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // enemy 반지름 (스케일 고려)
        const enemyRadius = (this.enemy.width * this.enemy.scaleX) / 2;
        // projectile 반지름 (이미지 크기 기준)
        const projectileRadius = (projectile.width * projectile.scaleX) / 2 || 10;
        
        return distance < (enemyRadius + projectileRadius);
    },
    
    // 적이 맞았을 때 처리 (투사체 기준)
    onHit(scene: Phaser.Scene, projectile: ProjectileType): void {
        if (!this.enemy || this.isDefeated) return; // 이미 처치된 상태면 무시

        // projectile.damage는 이미 치명타 계산이 완료된 값
        const damage = projectile.damage || GameState.getAttackPowerValue();
        const isCrit = projectile.isCrit || false;
        const isSuperCrit = projectile.isSuperCrit || false;
        this.applyDamage(scene, damage, false, isCrit, isSuperCrit); // isSkill=false, isCrit, isSuperCrit 전달
    },

    // 외부에서 직접 데미지를 줄 때 사용 (스킬 등)
    applyDamage(scene: Phaser.Scene, damage: number, isSkill: boolean = false, isCrit: boolean = false, isSuperCrit: boolean = false): void {
        if (!this.enemy || this.isDefeated) return;

        // HP 감소
        this.hp -= damage;

        // HP 바 업데이트
        this.updateHpBar();

        // HP가 0 이하가 되면 처치
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDefeated = true; // 처치 상태로 변경
            this.onDefeated(scene);
            return;
        }

        GameState.clickCount++;

        // 적이 맞았을 때 효과 (빨간색 깜빡임)
        // scene.tweens.add({
        //     targets: this.enemy,
        //     alpha: 0.5,
        //     duration: 100,
        //     yoyo: true,
        //     ease: 'Power2'
        // });

        // 데미지 파티클 효과 (기본 흰색, 치명타 빨간색, 슈퍼 치명타 금색, 스킬은 별도 처리)
        Effects.createDamageParticle(scene, this.enemy.x, this.enemy.y, damage, isSkill, isCrit, isSuperCrit);
    },
    
    // 적 처치 시 처리
    onDefeated(scene: Phaser.Scene): void {
        if (!this.enemy) return;
        
        // 보스 처치 여부 확인 (처치 전 상태)
        const wasBoss = this.isBoss;
        
        // 스테이지별 골드 지급 (적 체력과 동일) * 1.2
        const baseGoldReward = GameState.getEnemyGoldReward() * 1.2;
        // 유물 효과 적용 (코인 획득량 증가율)
        const goldRateMultiplier = 1 + (StatManager.getGoldRateValue() / 100);
        const goldReward = Math.floor(baseGoldReward * goldRateMultiplier);
        GameState.addCoins(goldReward);
        
        // 스테이지 진행 처리
        GameState.onEnemyDefeated();
        
        // 보스 처치 시 타이머 제거 (GameScene에서 처리)
        if (wasBoss && (scene as any).onBossDefeated) {
            (scene as any).onBossDefeated();
        }
        
        // UI 업데이트
        UIManager.update(scene);
        
        // 펄스 애니메이션 중지
        this.stopPulseAnimation();
        
        // 처치 효과
        scene.tweens.add({
            targets: this.enemy,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // 적 리스폰 (새로운 스테이지 체력으로)
                this.respawn(scene);
            }
        });
        
        // 코인 파티클 효과
        Effects.createDungeonRewardParticle(scene, this.enemy.x, this.enemy.y, goldReward, '', '#ffd700');
    },
    
    // 적 리스폰
    respawn(scene: Phaser.Scene): void {
        if (!this.enemy) return;
        
        // 보스 여부 확인
        this.isBoss = GameState.isBossStage();
        
        // 보스 여부에 따라 이미지 변경
        if (this.isBoss) {
            this.enemy.setTexture('stage_enemy_1_boss');
        } else {
            this.enemy.setTexture('stage_enemy_1');
        }
        
        // 스테이지별 새로운 HP 설정
        this.maxHp = GameState.getEnemyHp();
        this.hp = this.maxHp;
        this.isDefeated = false;

        // 적 복귀 애니메이션
        const scale = Responsive.getScale(scene);
        const baseScale = 0.13 * scale.uniform;
        const finalScale = this.isBoss ? baseScale * 1.02 : baseScale;
        
        this.enemy.setAlpha(0);
        this.enemy.setScale(0);
        scene.tweens.add({
            targets: this.enemy,
            alpha: 1,
            scaleX: finalScale,
            scaleY: finalScale,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 리스폰 애니메이션 완료 후 펄스 애니메이션 시작
                this.startPulseAnimation(scene);
            }
        });
        
        // HP 바 업데이트
        this.updateHpBar();
        
        // 보스 스테이지면 타이머 시작 (GameScene에서 처리)
        if (this.isBoss && (scene as any).startBossTimer) {
            (scene as any).startBossTimer();
        }
    },
    
    // 펄스 애니메이션 시작 (현재 크기 기준 1.05배까지 커졌다 작아지는 반복)
    startPulseAnimation(scene: Phaser.Scene): void {
        if (!this.enemy) return;
        
        // 기존 애니메이션 제거
        if (this.pulseTween) {
            this.pulseTween.destroy();
            this.pulseTween = null;
        }
        
        // 현재 스케일 저장
        const currentScaleX = this.enemy.scaleX;
        const currentScaleY = this.enemy.scaleY;
        
        // 펄스 애니메이션 (1.05배까지 커졌다 작아지는 반복)
        this.pulseTween = scene.tweens.add({
            targets: this.enemy,
            scaleX: currentScaleX * 1.05,
            scaleY: currentScaleY * 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    },
    
    // 펄스 애니메이션 중지
    stopPulseAnimation(): void {
        if (this.pulseTween) {
            this.pulseTween.destroy();
            this.pulseTween = null;
        }
    }
};
