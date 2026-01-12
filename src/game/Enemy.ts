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
    
    // 적 생성
    create(scene: Phaser.Scene, baseX: number, baseY: number): Phaser.GameObjects.Image {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 위치를 비율로 변환 (모바일 세로 해상도 기준)
        const x = (baseX / 390) * gameWidth;
        const y = (baseY / 844) * gameHeight;
        
        this.enemy = scene.add.image(x, y, 'enemy');
        this.enemy.setScale(1.5 * scale.uniform);
        
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
        
        const barWidth = 80;
        const barHeight = 8;
        const x = this.enemy.x - barWidth / 2;
        const y = this.enemy.y - (this.enemy.height * this.enemy.scaleY) / 2 - 20;
        
        this.hpBar.clear();
        
        // 배경 (빨간색)
        this.hpBar.fillStyle(0xff0000, 0.5);
        this.hpBar.fillRect(x, y, barWidth, barHeight);
        
        // HP (초록색)
        const hpPercent = Math.max(0, Math.min(1, this.hp / this.maxHp));
        this.hpBar.fillStyle(0x00ff00, 1);
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
        
        // 스테이지별 골드 지급 (적 체력과 동일)
        const goldReward = GameState.getEnemyGoldReward();
        GameState.addCoins(goldReward);
        
        // 스테이지 진행 처리
        GameState.onEnemyDefeated();
        
        // UI 업데이트
        UIManager.update();
        
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
        
        // 스테이지별 새로운 HP 설정
        this.maxHp = GameState.getEnemyHp();
        this.hp = this.maxHp;
        this.isDefeated = false;
        
        // 적 복귀 애니메이션
        this.enemy.setAlpha(0);
        this.enemy.setScale(0);
        scene.tweens.add({
            targets: this.enemy,
            alpha: 1,
            scaleX: 1.5 * Responsive.getScale(scene).uniform,
            scaleY: 1.5 * Responsive.getScale(scene).uniform,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // HP 바 업데이트
        this.updateHpBar();
    }
};
