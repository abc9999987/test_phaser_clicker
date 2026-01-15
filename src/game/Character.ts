import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';
import { Effects } from '../utils/Effects';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';

// 캐릭터 생성 및 관리
export const Character = {
    char: null as Phaser.GameObjects.Image | null,
    buffEffect: null as Phaser.GameObjects.Image | null,
    buffEffectAnimation: null as Phaser.Time.TimerEvent | null,
    
    // 캐릭터 생성
    create(scene: Phaser.Scene): Phaser.GameObjects.Image {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 캐릭터 생성 (위쪽 절반 영역에 배치)
        this.char = scene.add.image(gameWidth * 0.85, gameHeight * 0.33, 'char');
        this.char.setScale(0.1 * scale.uniform);
        this.char.setOrigin(0.5, 0.5);
        this.char.setDepth(1); // 캐릭터 depth 설정 (이펙트보다 위에 표시)
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
        
        // 투사체 생성 (치명타 계산은 Projectile.create() 내부에서 처리됨)
        Projectile.create(
            scene, 
            startX, 
            startY, 
            targetX, 
            targetY,
            type
        );
    },
    
    // 캐릭터 업데이트 (부드러운 움직임)
    update(scene: Phaser.Scene): void {
        if (this.char) {
            const baseY = scene.scale.height * 0.33; // 위쪽 절반 기준
            this.char.y = baseY - Math.sin(scene.time.now / 1000) * 5;
            
            // 버프 이펙트가 있으면 캐릭터와 함께 움직임
            if (this.buffEffect) {
                this.buffEffect.x = this.char.x;
                this.buffEffect.y = this.char.y;
            }
        }
    },
    
    // 버프 이펙트 표시
    showBuffEffect(scene: Phaser.Scene): void {
        if (!this.char || this.buffEffect) return; // 이미 표시 중이면 무시
        
        const scale = Responsive.getScale(scene);
        this.buffEffect = scene.add.image(this.char.x, this.char.y, 'buff_1_effect_1');
        this.buffEffect.setScale(0.15 * scale.uniform);
        this.buffEffect.setOrigin(0.5, 0.5);
        this.buffEffect.setDepth(0); // 캐릭터 뒤에 표시 (캐릭터는 depth 1)
        
        // 애니메이션 프레임 배열
        const frames = ['buff_1_effect_1', 'buff_1_effect_2', 'buff_1_effect_3'];
        let currentFrameIndex = 0;
        
        // 프레임 변경 애니메이션 (0.15초마다 프레임 변경)
        this.buffEffectAnimation = scene.time.addEvent({
            delay: 150, // 0.15초마다
            callback: () => {
                if (this.buffEffect) {
                    currentFrameIndex = (currentFrameIndex + 1) % frames.length;
                    this.buffEffect.setTexture(frames[currentFrameIndex]);
                }
            },
            loop: true
        });
    },
    
    // 버프 이펙트 숨김
    hideBuffEffect(): void {
        // 애니메이션 정지
        if (this.buffEffectAnimation) {
            this.buffEffectAnimation.remove();
            this.buffEffectAnimation = null;
        }
        
        // 이펙트 이미지 제거
        if (this.buffEffect) {
            this.buffEffect.destroy();
            this.buffEffect = null;
        }
    }
};
