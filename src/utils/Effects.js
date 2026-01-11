// 효과 유틸리티
const Effects = {
    // 애니메이션 추적을 위한 맵 (타겟별 애니메이션 참조 저장)
    activeAnimations: new Map(),
    
    // 코인 파티클 효과 생성
    createCoinParticle(scene, x, y, amount = 1) {
        const coin = scene.add.text(x, y, `+${amount}`, {
            fontSize: '20px',
            fill: '#ffd700',
            fontFamily: 'Arial',
            fontWeight: 'bold'
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
    
    // 클릭 애니메이션
    playClickAnimation(scene, target) {
        // 기존 애니메이션이 있으면 중지
        if (this.activeAnimations.has(target)) {
            const existingTween = this.activeAnimations.get(target);
            existingTween.stop();
            this.activeAnimations.delete(target);
            
            // 스케일을 원래 값으로 즉시 복원
            const originalScale = target.scaleX || 0.5;
            target.setScale(originalScale, originalScale);
        }
        
        // 원래 스케일 값 저장 (현재 스케일 사용, 없으면 0.5로 가정)
        const originalScale = target.scaleX || 0.5;
        
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
                target.setScale(originalScale, originalScale);
                this.activeAnimations.delete(target);
            },
            onStop: () => {
                // 애니메이션이 중지되면 원래 스케일로 복원
                target.setScale(originalScale, originalScale);
                this.activeAnimations.delete(target);
            }
        });
        
        // 애니메이션 참조 저장
        this.activeAnimations.set(target, tween);
    }
};
