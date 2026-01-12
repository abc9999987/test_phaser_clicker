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
        
        // 캐릭터 생성 (preload에서 이미 로드됨, 반응형)
        this.char = scene.add.image(gameWidth * 0.75, gameHeight * 0.67, 'char');
        this.char.setScale(0.12 * scale.min, 0.12 * scale.min);
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
        
        const projectile = Projectile.create(
            scene, 
            this.char.x, 
            this.char.y, 
            Enemy.enemy.x, 
            Enemy.enemy.y,
            type
        );
        // 투사체 데미지를 현재 클릭 강화 수준으로 설정
        if (projectile) {
            projectile.damage = GameState.coinsPerClick;
        }
    },
    
    // 캐릭터 업데이트 (부드러운 움직임)
    update(scene: Phaser.Scene): void {
        if (this.char) {
            const baseY = scene.scale.height * 0.67;
            this.char.y = baseY + Math.sin(scene.time.now / 1000) * 5;
        }
    }
};
