import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';
import { Effects } from '../utils/Effects';
import { GameState } from '../managers/GameState';
import { Projectile } from './Projectile';
import { UIManager } from '../ui/UIManager';

// 투사체 타입 (Projectile에서 정의된 것과 동일)
interface Projectile extends Phaser.GameObjects.Arc {
    velocityX: number;
    velocityY: number;
    damage: number;
    projectileType: 'manual' | 'auto';
    isProjectile: boolean;
}

// 적 관리
export const Enemy = {
    enemy: null as Phaser.GameObjects.Image | null,
    hp: 100,  // 적의 HP
    maxHp: 100,  // 최대 HP
    hpBar: null as Phaser.GameObjects.Graphics | null,
    isDefeated: false,  // 처치 상태 플래그 (중복 처치 방지)
    isBoss: false,  // 보스 여부
    
    // 적 생성
    create(scene: Phaser.Scene, baseX: number, baseY: number): Phaser.GameObjects.Image {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 위치를 비율로 변환 (모바일 세로 해상도 기준)
        const x = (baseX / 390) * gameWidth;
        const y = (baseY / 844) * gameHeight;
        
        this.enemy = scene.add.image(x, y, 'enemy');
        
        // 보스 여부 확인
        this.isBoss = GameState.isBossStage();
        
        // 보스면 크기 2배, 아니면 기본 크기
        const baseScale = 0.75 * scale.uniform;
        this.enemy.setScale(this.isBoss ? baseScale * 2 : baseScale);
        
        // 보스면 색상 변경 (빨간색 틴트)
        if (this.isBoss) {
            this.enemy.setTint(0xff4444);
        }
        
        // 스테이지별 HP 설정
        this.maxHp = GameState.getEnemyHp();
        this.hp = this.maxHp;
        this.isDefeated = false;
        
        // HP 바 생성
        this.createHpBar(scene);
        
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
    checkCollision(projectile: Projectile): boolean {
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
    
    // 적이 맞았을 때 처리
    onHit(scene: Phaser.Scene, projectile: Projectile): void {
        if (!this.enemy || this.isDefeated) return; // 이미 처치된 상태면 무시
        
        // 공격력만큼 HP 감소
        const damage = projectile.damage || GameState.attackPower;
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
        scene.tweens.add({
            targets: this.enemy,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
        
        // 데미지 파티클 효과 (빨간색, - 형식)
        Effects.createDamageParticle(scene, this.enemy.x, this.enemy.y, damage);
    },
    
    // 적 처치 시 처리
    onDefeated(scene: Phaser.Scene): void {
        if (!this.enemy) return;
        
        // 보스 처치 여부 확인 (처치 전 상태)
        const wasBoss = this.isBoss;
        
        // 스테이지별 골드 지급 (적 체력과 동일) * 1.2
        const goldReward = GameState.getEnemyGoldReward() * 1.2;
        GameState.addCoins(goldReward);
        
        // 스테이지 진행 처리
        GameState.onEnemyDefeated();
        
        // 보스 처치 시 타이머 제거 (GameScene에서 처리)
        if (wasBoss && (scene as any).onBossDefeated) {
            (scene as any).onBossDefeated();
        }
        
        // UI 업데이트
        UIManager.update(scene);
        
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
        Effects.createCoinParticle(scene, this.enemy.x, this.enemy.y, goldReward);
    },
    
    // 적 리스폰
    respawn(scene: Phaser.Scene): void {
        if (!this.enemy) return;
        
        // 보스 여부 확인
        this.isBoss = GameState.isBossStage();
        
        // 스테이지별 새로운 HP 설정
        this.maxHp = GameState.getEnemyHp();
        this.hp = this.maxHp;
        this.isDefeated = false;
        
        // 보스면 색상 변경, 아니면 원래 색상
        if (this.isBoss) {
            this.enemy.setTint(0xff4444);
        } else {
            this.enemy.clearTint();
        }
        
        // 적 복귀 애니메이션
        const scale = Responsive.getScale(scene);
        const baseScale = 0.75 * scale.uniform;
        const finalScale = this.isBoss ? baseScale * 2 : baseScale;
        
        this.enemy.setAlpha(0);
        this.enemy.setScale(0);
        scene.tweens.add({
            targets: this.enemy,
            alpha: 1,
            scaleX: finalScale,
            scaleY: finalScale,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // HP 바 업데이트
        this.updateHpBar();
        
        // 보스 스테이지면 타이머 시작 (GameScene에서 처리)
        if (this.isBoss && (scene as any).startBossTimer) {
            (scene as any).startBossTimer();
        }
    }
};
