import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';
import { Effects } from '../utils/Effects';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { GameState } from '../managers/GameState';

// 캐릭터 생성 및 관리
export const Character = {
    char: null as Phaser.GameObjects.Image | null,
    
    // 캐릭터 생성
    create(scene: Phaser.Scene): Phaser.GameObjects.Image {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 캐릭터 생성 (위쪽 절반 영역에 배치)
        this.char = scene.add.image(gameWidth * 0.85, gameHeight * 0.33, 'char');
        this.char.setScale(0.1 * scale.uniform);
        this.char.setOrigin(0.5, 0.5);
        this.char.setInteractive({ useHandCursor: true });
        
        // 클릭 이벤트
        this.char.on('pointerdown', () => {
            this.onCharacterClick(scene);
        });
        
        return this.char;
    },
    
    // 캐릭터 클릭 핸들러
    onCharacterClick(scene: Phaser.Scene): void {
        if (!this.char) return;
        
        // 클릭 애니메이션
        Effects.playClickAnimation(scene, this.char);
        
        // enemy가 있으면 투사체 발사
        this.fireProjectile(scene);
    },
    
    // 투사체 발사
    fireProjectile(scene: Phaser.Scene, type: 'manual' | 'auto' = 'manual'): void {
        if (!this.char || !Enemy.enemy) return;
        
        // 발사 위치에 랜덤 오프셋 추가 (±10 픽셀 범위)
        const randomOffsetX = (Math.random() - 0.5) * 20; // -10 ~ +10
        const randomOffsetY = (Math.random() - 0.5) * 20; // -10 ~ +10
        
        const startX = this.char.x + randomOffsetX;
        const startY = this.char.y + randomOffsetY;
        
        // 적 위치에도 약간의 랜덤 오프셋 추가 (더 자연스러운 발사)
        const targetOffsetX = (Math.random() - 0.5) * 15; // -7.5 ~ +7.5
        const targetOffsetY = (Math.random() - 0.5) * 15; // -7.5 ~ +7.5
        
        const targetX = Enemy.enemy.x + targetOffsetX;
        const targetY = Enemy.enemy.y + targetOffsetY;
        
        const projectile = Projectile.create(
            scene, 
            startX, 
            startY, 
            targetX, 
            targetY,
            type
        );
        // 투사체 데미지를 현재 공격력으로 설정
        if (projectile) {
            projectile.damage = GameState.getAttackPowerValue();
        }
    },
    
    // 캐릭터 업데이트 (부드러운 움직임)
    update(scene: Phaser.Scene): void {
        if (this.char) {
            const baseY = scene.scale.height * 0.33; // 위쪽 절반 기준
            this.char.y = baseY - Math.sin(scene.time.now / 1000) * 5;
        }
    }
};
