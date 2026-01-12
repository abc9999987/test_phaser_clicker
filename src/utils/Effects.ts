import Phaser from 'phaser';

// 효과 유틸리티
export const Effects = {
    // 애니메이션 추적을 위한 맵 (타겟별 애니메이션 참조 저장)
    activeAnimations: new Map<Phaser.GameObjects.GameObject, Phaser.Tweens.Tween>(),
    
    // 코인 파티클 효과 생성 (황금색, + 형식)
    createCoinParticle(scene: Phaser.Scene, x: number, y: number, amount: number = 1): void {
        const coin = scene.add.text(x, y, `+${amount}`, {
            font: 'bold 20px Arial',
            color: '#ffd700' // 황금색
        });
        coin.setOrigin(0.5);
        
        scene.tweens.add({
            targets: coin,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => coin.destroy()
        });
    },
    
    // 데미지 파티클 효과 생성 (빨간색, - 형식)
    createDamageParticle(scene: Phaser.Scene, x: number, y: number, damage: number): void {
        const damageText = scene.add.text(x, y, `-${damage}`, {
            font: 'bold 20px Arial',
            color: '#ff0000' // 빨간색
        });
        damageText.setOrigin(0.5);
        
        scene.tweens.add({
            targets: damageText,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    },
    
    // 클릭 애니메이션
    playClickAnimation(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
        // 기존 애니메이션이 있으면 중지
        if (this.activeAnimations.has(target)) {
            const existingTween = this.activeAnimations.get(target);
            if (existingTween) {
                existingTween.stop();
            }
            this.activeAnimations.delete(target);
            
            // 스케일을 원래 값으로 즉시 복원
            const originalScale = (target as Phaser.GameObjects.Image).scaleX || 0.5;
            (target as Phaser.GameObjects.Image).setScale(originalScale, originalScale);
        }
        
        // 원래 스케일 값 저장 (현재 스케일 사용, 없으면 0.5로 가정)
        const originalScale = (target as Phaser.GameObjects.Image).scaleX || 0.5;
        
        // 클릭 시 스케일 증가량
        const clickScale = originalScale * 1.1;
        
        // 새 애니메이션 생성
        const tween = scene.tweens.add({
            targets: target,
            scaleX: clickScale,
            scaleY: clickScale,
            duration: 100,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                // 애니메이션 완료 후 원래 스케일로 명시적으로 복원
                (target as Phaser.GameObjects.Image).setScale(originalScale, originalScale);
                this.activeAnimations.delete(target);
            },
            onStop: () => {
                // 애니메이션이 중지되면 원래 스케일로 복원
                (target as Phaser.GameObjects.Image).setScale(originalScale, originalScale);
                this.activeAnimations.delete(target);
            }
        });
        
        // 애니메이션 참조 저장
        if (tween) {
            this.activeAnimations.set(target, tween);
        }
    }
};
