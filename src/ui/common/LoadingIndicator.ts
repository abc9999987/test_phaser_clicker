// 로딩 인디케이터 컴포넌트
import Phaser from 'phaser';

// 로딩 인디케이터 상태
export interface LoadingIndicatorState {
    overlay: Phaser.GameObjects.Rectangle | null;
    spinnerContainer: Phaser.GameObjects.Container | null;
    spinnerGraphics: Phaser.GameObjects.Graphics | null;
    spinnerTween: Phaser.Tweens.Tween | null;
    isVisible: boolean;
}

export const LoadingIndicator = {
    // 로딩 인디케이터 표시
    show(
        scene: Phaser.Scene,
        state: LoadingIndicatorState
    ): void {
        if (state.isVisible) {
            return; // 이미 표시 중이면 무시
        }
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // 오버레이 (반투명 배경, 클릭 차단)
        const overlay = scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x000000,
            0.6
        );
        overlay.setDepth(200);
        overlay.setInteractive({ useHandCursor: false });
        // 클릭 이벤트를 막기 위해 빈 핸들러 추가
        overlay.on('pointerdown', () => {});
        state.overlay = overlay;
        
        // 스피너 컨테이너
        const spinnerContainer = scene.add.container(gameWidth / 2, gameHeight / 2);
        spinnerContainer.setDepth(201);
        state.spinnerContainer = spinnerContainer;
        
        // 스피너 배경 원
        const spinnerRadius = gameWidth * 0.08;
        const spinnerBg = scene.add.graphics();
        spinnerBg.fillStyle(0x2a2a2a, 1);
        spinnerBg.fillCircle(0, 0, spinnerRadius);
        spinnerBg.lineStyle(3, 0x4a9eff, 1);
        spinnerBg.strokeCircle(0, 0, spinnerRadius);
        spinnerContainer.add(spinnerBg);
        
        // 스피너 그래픽 (회전하는 원호)
        const spinnerGraphics = scene.add.graphics();
        state.spinnerGraphics = spinnerGraphics;
        spinnerContainer.add(spinnerGraphics);
        
        // 회전 애니메이션
        const angleTarget = { angle: 0 };
        const spinnerTween = scene.tweens.add({
            targets: angleTarget,
            angle: 360,
            duration: 1000,
            repeat: -1,
            ease: 'Linear',
            onUpdate: function() {
                const currentAngle = angleTarget.angle;
                spinnerGraphics.clear();
                spinnerGraphics.lineStyle(4, 0x4a9eff, 1);
                
                // 원호 그리기 (270도부터 시작하여 270도 그리기)
                const startAngle = Phaser.Math.DegToRad(currentAngle - 90);
                const endAngle = Phaser.Math.DegToRad(currentAngle + 180 - 90);
                
                spinnerGraphics.beginPath();
                spinnerGraphics.arc(0, 0, spinnerRadius * 0.7, startAngle, endAngle, false);
                spinnerGraphics.strokePath();
            }
        });
        state.spinnerTween = spinnerTween;
        
        // "로딩 중..." 텍스트
        const loadingText = scene.add.text(0, spinnerRadius + 30, '로딩 중...', {
            fontSize: Math.floor(gameWidth * 0.04),
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        loadingText.setOrigin(0.5, 0.5);
        spinnerContainer.add(loadingText);
        
        // 페이드 인 애니메이션
        spinnerContainer.setAlpha(0);
        scene.tweens.add({
            targets: spinnerContainer,
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });
        
        state.isVisible = true;
    },
    
    // 로딩 인디케이터 숨기기
    hide(
        scene: Phaser.Scene,
        state: LoadingIndicatorState
    ): void {
        if (!state.isVisible) {
            return;
        }
        
        // 페이드 아웃 애니메이션
        if (state.spinnerContainer) {
            scene.tweens.add({
                targets: state.spinnerContainer,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    // 애니메이션 정리
                    if (state.spinnerTween) {
                        state.spinnerTween.stop();
                        state.spinnerTween = null;
                    }
                    
                    // 객체 제거
                    if (state.overlay) {
                        state.overlay.destroy();
                        state.overlay = null;
                    }
                    if (state.spinnerContainer) {
                        state.spinnerContainer.destroy();
                        state.spinnerContainer = null;
                    }
                    if (state.spinnerGraphics) {
                        state.spinnerGraphics.destroy();
                        state.spinnerGraphics = null;
                    }
                    
                    state.isVisible = false;
                }
            });
        } else {
            // 컨테이너가 없으면 즉시 정리
            if (state.spinnerTween) {
                state.spinnerTween.stop();
                state.spinnerTween = null;
            }
            if (state.overlay) {
                state.overlay.destroy();
                state.overlay = null;
            }
            if (state.spinnerGraphics) {
                state.spinnerGraphics.destroy();
                state.spinnerGraphics = null;
            }
            state.isVisible = false;
        }
    }
};
