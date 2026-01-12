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
    
    // 적 생성
    create(scene: Phaser.Scene, baseX: number, baseY: number): Phaser.GameObjects.Image {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 위치를 비율로 변환
        const x = (baseX / 800) * gameWidth;
        const y = (baseY / 600) * gameHeight;
        
        this.enemy = scene.add.image(x, y, 'enemy');
        this.enemy.setScale(1.5 * scale.min);
        return this.enemy;
    },
    
    // 투사체와의 충돌 감지
    checkCollision(projectile: Projectile): boolean {
        if (!this.enemy || !projectile) return false;
        
        // 간단한 원형 충돌 감지
        const dx = (projectile as any).x - this.enemy.x;
        const dy = (projectile as any).y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // enemy 반지름 (스케일 고려)
        const enemyRadius = (this.enemy.width * this.enemy.scaleX) / 2;
        // projectile 반지름
        const projectileRadius = (projectile as any).radius || 5;
        
        return distance < (enemyRadius + projectileRadius);
    },
    
    // 적이 맞았을 때 처리
    onHit(scene: Phaser.Scene, projectile: Projectile): void {
        if (!this.enemy) return;
        
        // 골드 지급
        const damage = projectile.damage || GameState.coinsPerClick;
        GameState.addCoins(damage);
        GameState.clickCount++;
        
        // UI 업데이트
        UIManager.update();
        
        // 적이 맞았을 때 효과 (빨간색 깜빡임)
        scene.tweens.add({
            targets: this.enemy,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
        
        // 코인 파티클 효과 (enemy 위치에서)
        Effects.createCoinParticle(scene, this.enemy.x, this.enemy.y, damage);
    }
};
