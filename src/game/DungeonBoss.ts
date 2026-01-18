import Phaser from 'phaser';
import { Effects } from '../utils/Effects';
import { GameState } from '../managers/GameState';
import { ProjectileType } from './Projectile';
import { UIManager } from '../ui/UIManager';
import { DungeonConfig } from '../config/dungeonConfig';
import { DungeonBossReward } from './boss/DungeonBossReward';
import { DungeonBossRenderer } from './boss/DungeonBossRenderer';

// 던전 보스 관리
export const DungeonBoss = {
    boss: null as Phaser.GameObjects.Image | Phaser.GameObjects.Sprite | null,
    hp: 100,
    maxHp: 100,
    hpBar: null as Phaser.GameObjects.Graphics | null,
    isDefeated: false,
    dungeonConfig: null as DungeonConfig | null,
    dungeonLevel: 1,
    
    // 던전 보스 생성
    create(scene: Phaser.Scene, dungeonConfig: DungeonConfig, dungeonLevel: number): Phaser.GameObjects.Image | Phaser.GameObjects.Sprite {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // 던전 설정 저장
        this.dungeonConfig = dungeonConfig;
        this.dungeonLevel = dungeonLevel;
        
        // 보스 생성 (렌더러 사용)
        this.boss = DungeonBossRenderer.createBoss(scene, dungeonConfig, gameWidth, gameHeight);
        
        // 던전 단계에 따른 HP 설정
        if (dungeonConfig.getBossHp) {
            this.maxHp = dungeonConfig.getBossHp(dungeonLevel);
        } else {
            // 기본 계산: baseHp * (1.5 ^ (level - 1))
            this.maxHp = Math.floor(dungeonConfig.bossBaseHp * Math.pow(1.5, dungeonLevel - 1));
        }
        this.hp = this.maxHp;
        this.isDefeated = false;
        
        // HP 바 생성
        this.createHpBar(scene);
        
        return this.boss;
    },
    
    // HP 바 생성
    createHpBar(scene: Phaser.Scene): void {
        if (!this.boss) return;
        
        this.hpBar = scene.add.graphics();
        this.hpBar.setDepth(20); // 보스 위에 표시
        this.updateHpBar();
    },
    
    // HP 바 업데이트
    updateHpBar(): void {
        if (!this.boss || !this.hpBar) return;
        
        // 보스 HP 바 크기
        const barWidth = 120;
        const barHeight = 10;
        const x = this.boss.x - barWidth / 2;
        const y = this.boss.y - (this.boss.height * this.boss.scaleY) / 2 - 20;
        
        this.hpBar.clear();
        
        // 배경 (빨간색)
        this.hpBar.fillStyle(0xff0000, 0.5);
        this.hpBar.fillRect(x, y, barWidth, barHeight);
        
        // HP (주황색)
        const hpPercent = Math.max(0, Math.min(1, this.hp / this.maxHp));
        this.hpBar.fillStyle(0xff8800, 1);
        this.hpBar.fillRect(x, y, barWidth * hpPercent, barHeight);
        
        // 테두리
        this.hpBar.lineStyle(2, 0xffffff, 1);
        this.hpBar.strokeRect(x, y, barWidth, barHeight);
    },
    
    // HP 바 위치 업데이트
    updateHpBarPosition(): void {
        this.updateHpBar();
    },
    
    // 투사체와의 충돌 감지
    checkCollision(projectile: ProjectileType): boolean {
        if (!this.boss || !projectile || this.isDefeated) return false;
        
        // 간단한 원형 충돌 감지
        const dx = projectile.x - this.boss.x;
        const dy = projectile.y - this.boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // boss 반지름 (스케일 고려)
        const bossRadius = (this.boss.width * this.boss.scaleX) / 2;
        // projectile 반지름
        const projectileRadius = (projectile.width * projectile.scaleX) / 2 || 10;
        
        return distance < (bossRadius + projectileRadius);
    },
    
    // 보스가 맞았을 때 처리
    onHit(scene: Phaser.Scene, projectile: ProjectileType): void {
        if (!this.boss || this.isDefeated) return;

        const damage = projectile.damage || GameState.getAttackPowerValue();
        const isCrit = projectile.isCrit || false;
        const isSuperCrit = projectile.isSuperCrit || false;
        this.applyDamage(scene, damage, false, isCrit, isSuperCrit);
    },
    
    // 외부에서 직접 데미지를 줄 때 사용 (스킬 등)
    applyDamage(scene: Phaser.Scene, damage: number, isSkill: boolean = false, isCrit: boolean = false, isSuperCrit: boolean = false): void {
        if (!this.boss || this.isDefeated) return;

        // HP 감소
        this.hp -= damage;

        // HP 바 업데이트
        this.updateHpBar();

        // HP가 0 이하가 되면 처치
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDefeated = true;
            this.onDefeated(scene);
            return;
        }

        // 보스가 맞았을 때 효과 (빨간색 깜빡임)
        // scene.tweens.add({
        //     targets: this.boss,
        //     alpha: 0.5,
        //     duration: 100,
        //     yoyo: true,
        //     ease: 'Power2'
        // });

        // 데미지 파티클 효과
        Effects.createDamageParticle(scene, this.boss.x, this.boss.y, damage, isSkill, isCrit, isSuperCrit);
    },
    
    // 보스 처치 시 처리
    onDefeated(scene: Phaser.Scene): void {
        if (!this.boss || !this.dungeonConfig) return;
        
        // 던전 단계 증가
        GameState.incrementDungeonLevel(this.dungeonConfig.id);
        
        // 보상 처리 (보상 핸들러 사용 - 내부에서 저장 처리)
        const bossX = this.boss.x;
        const bossY = this.boss.y;
        DungeonBossReward.giveReward(scene, this.dungeonConfig, this.dungeonLevel, bossX, bossY);
        
        // 던전 단계 증가도 저장 (보상과 함께 한 번에 저장하지만, 보상이 없을 수도 있으므로)
        GameState.save();
        
        // UI 업데이트
        UIManager.update(scene);
        
        // 처치 효과 (페이드 아웃 및 스케일 다운)
        if (this.boss) {
            scene.tweens.add({
                targets: this.boss,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 900,
                ease: 'Power2',
                onComplete: () => {
                    // 보스 제거
                    if (this.hpBar) {
                        this.hpBar.destroy();
                        this.hpBar = null;
                    }
                    
                    if (this.boss) {
                        this.boss.destroy();
                        this.boss = null;
                    }
                    
                    // 씬에 보스 처치 이벤트 전달 (씬에서 게임 씬으로 복귀 처리)
                    if ((scene as any).onBossDefeated) {
                        (scene as any).onBossDefeated();
                    }
                }
            });
        } else {
            // 보스가 이미 없으면 바로 이벤트 전달
            if ((scene as any).onBossDefeated) {
                (scene as any).onBossDefeated();
            }
        }
    },
    
    // 보스 리스폰 (던전에서는 사용하지 않을 수도 있음)
    respawn(_scene: Phaser.Scene): void {
        // 던전 보스는 처치 후 게임 씬으로 복귀하므로 리스폰 불필요
    }
};
