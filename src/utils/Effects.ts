import Phaser from 'phaser';
import { NumberFormatter } from './NumberFormatter';

// 효과 유틸리티
export const Effects = {
    // 애니메이션 추적을 위한 맵 (타겟별 애니메이션 참조 저장)
    activeAnimations: new Map<Phaser.GameObjects.GameObject, Phaser.Tweens.Tween>(),
    
    // 코인 파티클 효과 생성 (황금색, + 형식)
    createCoinParticle(scene: Phaser.Scene, x: number, y: number, amount: number = 1): void {
        // 소수점 제거하고 정수로 표시
        const displayAmount = Math.floor(amount);
        const coin = scene.add.text(x, y, `+${NumberFormatter.formatNumber(displayAmount)}`, {
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
    
    // 루비 파티클 효과 생성 (분홍색, + 형식)
    createRubyParticle(scene: Phaser.Scene, x: number, y: number, amount: number = 1): void {
        // 소수점 제거하고 정수로 표시
        const displayAmount = Math.floor(amount);
        const ruby = scene.add.text(x, y, `+${NumberFormatter.formatNumber(displayAmount)} 루비`, {
            font: 'bold 20px Arial',
            color: '#ff6b9d' // 분홍색
        });
        ruby.setOrigin(0.5);
        
        scene.tweens.add({
            targets: ruby,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => ruby.destroy()
        });
    },
    
    // 소탕 완료 팝업 표시
    showSweepCompletePopup(scene: Phaser.Scene, rubies: number): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // 팝업 배경 (반투명 검은색)
        const popupBg = scene.add.graphics();
        popupBg.fillStyle(0x000000, 0.8);
        popupBg.fillRoundedRect(centerX - 200, centerY - 80, 400, 160, 15);
        popupBg.lineStyle(3, 0x4169e1, 1);
        popupBg.strokeRoundedRect(centerX - 200, centerY - 80, 400, 160, 15);
        popupBg.setDepth(1000);
        
        // 제목 텍스트
        const titleText = scene.add.text(centerX, centerY - 40, '소탕 완료!', {
            font: 'bold 28px Arial',
            color: '#ffffff'
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(1001);
        
        // 보상 텍스트
        const rewardText = scene.add.text(
            centerX, 
            centerY + 20, 
            `루비 ${NumberFormatter.formatNumber(Math.floor(rubies))}개 획득`, 
            {
                font: 'bold 24px Arial',
                color: '#ff6b9d' // 분홍색
            }
        );
        rewardText.setOrigin(0.5);
        rewardText.setDepth(1001);
        
        // 페이드 아웃 애니메이션 (3초 후)
        scene.tweens.add({
            targets: [popupBg, titleText, rewardText],
            alpha: 0,
            duration: 500,
            delay: 1000,
            ease: 'Power2',
            onComplete: () => {
                popupBg.destroy();
                titleText.destroy();
                rewardText.destroy();
            }
        });
    },
    
    // 데미지 파티클 효과 생성
    createDamageParticle(scene: Phaser.Scene, x: number, y: number, damage: number, isSkill: boolean = false, isCrit: boolean = false): void {
        // 스킬 데미지는 더 크고 강조된 스타일
        // 치명타는 빨간색, 기본은 흰색
        let fontSize: number;
        let color: string;
        let strokeColor: string | undefined;
        let strokeThickness: number;
        
        if (isSkill) {
            // 스킬 데미지
            fontSize = 32;
            color = '#ff4444'; // 빨간색
            strokeColor = '#ffffff';
            strokeThickness = 3;
        } else if (isCrit) {
            // 치명타 데미지
            fontSize = 24;
            color = '#ff0000'; // 빨간색
            strokeColor = undefined;
            strokeThickness = 0;
        } else {
            // 기본 데미지
            fontSize = 20;
            color = '#ffffff'; // 흰색
            strokeColor = undefined;
            strokeThickness = 0;
        }
        
        const damageText = scene.add.text(x, y, `-${NumberFormatter.formatNumber(Math.floor(damage))}`, {
            font: `bold ${fontSize}px Arial`,
            color: color,
            stroke: strokeColor,
            strokeThickness: strokeThickness
        });
        damageText.setOrigin(0.5);
        
        // 스킬 데미지는 더 크게 위로 올라가고, 약간의 스케일 애니메이션 추가
        const targetY = y - (isSkill ? 70 : isCrit ? 60 : 50);
        const scale = isSkill ? 1.2 : isCrit ? 1.1 : 1.0;
        
        scene.tweens.add({
            targets: damageText,
            y: targetY,
            scaleX: scale,
            scaleY: scale,
            alpha: 0,
            duration: isSkill ? 1000 : isCrit ? 900 : 800,
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
