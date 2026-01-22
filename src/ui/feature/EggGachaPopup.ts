// 알 뽑기 팝업 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { NumberFormatter } from '../../utils/NumberFormatter';

// 알 뽑기 고기 비용 상수
export const EGG_GACHA_MEAT_COST = 100;

// 알 뽑기 팝업 상태 인터페이스
export interface EggGachaPopupState {
    popupOverlay: Phaser.GameObjects.Rectangle | null;
    popupContainer: Phaser.GameObjects.Container | null;
    closeButton: Phaser.GameObjects.Container | null;
    tabButtons: Phaser.GameObjects.Container[];
    activeTab: 'draw' | 'list';
    isOpen: boolean;
    drawPanel: Phaser.GameObjects.Container | null;
    drawButton: Phaser.GameObjects.Container | null;
    eggImage: Phaser.GameObjects.Image | null;
    glowEffect: Phaser.GameObjects.Graphics | null;
}

export const EggGachaPopup = {
    // 팝업 표시
    show(
        scene: Phaser.Scene,
        state: EggGachaPopupState
    ): void {
        if (state.isOpen) return;
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // 오버레이 (배경 어둡게)
        const overlay = scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x000000,
            0.7
        );
        overlay.setDepth(90);
        overlay.setInteractive({ useHandCursor: false });
        
        // 오버레이 클릭 시 팝업 닫기
        overlay.on('pointerdown', () => {
            EggGachaPopup.hide(scene, state);
        });
        
        state.popupOverlay = overlay;
        
        // 팝업 컨테이너
        const popupWidth = gameWidth * 0.6;
        const popupHeight = gameHeight * 0.5;
        const popupX = gameWidth / 2;
        const popupY = gameHeight / 2;
        
        const popupContainer = scene.add.container(popupX, popupY);
        popupContainer.setDepth(100);
        
        // 팝업 배경
        const popupBg = scene.add.graphics();
        popupBg.fillStyle(0x2a2a3a, 0.95);
        popupBg.fillRoundedRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 16);
        popupBg.lineStyle(3, 0x4a4a5a, 1);
        popupBg.strokeRoundedRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 16);
        popupContainer.add(popupBg);
        
        // 닫기 버튼
        const closeButtonSize = popupWidth * 0.08;
        const closeButtonX = popupWidth / 2 - closeButtonSize / 2 - 10;
        const closeButtonY = -popupHeight / 2 + closeButtonSize / 2 + 10;
        
        const closeButtonContainer = scene.add.container(closeButtonX, closeButtonY);
        
        const closeButtonBg = scene.add.graphics();
        closeButtonBg.fillStyle(0x555555, 1);
        closeButtonBg.fillRoundedRect(-closeButtonSize / 2, -closeButtonSize / 2, closeButtonSize, closeButtonSize, 6);
        closeButtonBg.lineStyle(2, 0xffffff, 1);
        closeButtonBg.strokeRoundedRect(-closeButtonSize / 2, -closeButtonSize / 2, closeButtonSize, closeButtonSize, 6);
        closeButtonContainer.add(closeButtonBg);
        
        // X 아이콘
        const xFontSize = Responsive.getFontSize(scene, 20);
        const xText = scene.add.text(0, 0, '×', {
            fontSize: xFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `bold ${xFontSize} Arial`
        });
        xText.setOrigin(0.5);
        closeButtonContainer.add(xText);
        
        const closeClickArea = scene.add.rectangle(0, 0, closeButtonSize, closeButtonSize, 0x000000, 0);
        closeClickArea.setInteractive({ useHandCursor: true });
        
        closeClickArea.on('pointerdown', () => {
            EggGachaPopup.hide(scene, state);
        });
        
        closeClickArea.on('pointerover', () => {
            closeButtonBg.clear();
            closeButtonBg.fillStyle(0xff4444, 1);
            closeButtonBg.fillRoundedRect(-closeButtonSize / 2, -closeButtonSize / 2, closeButtonSize, closeButtonSize, 6);
            closeButtonBg.lineStyle(2, 0xff6666, 1);
            closeButtonBg.strokeRoundedRect(-closeButtonSize / 2, -closeButtonSize / 2, closeButtonSize, closeButtonSize, 6);
        });
        
        closeClickArea.on('pointerout', () => {
            closeButtonBg.clear();
            closeButtonBg.fillStyle(0x555555, 1);
            closeButtonBg.fillRoundedRect(-closeButtonSize / 2, -closeButtonSize / 2, closeButtonSize, closeButtonSize, 6);
            closeButtonBg.lineStyle(2, 0xffffff, 1);
            closeButtonBg.strokeRoundedRect(-closeButtonSize / 2, -closeButtonSize / 2, closeButtonSize, closeButtonSize, 6);
        });
        
        closeButtonContainer.add(closeClickArea);
        popupContainer.add(closeButtonContainer);
        
        state.closeButton = closeButtonContainer;
        
        // 탭 버튼 영역 (상단)
        const tabAreaY = -popupHeight / 2 + popupHeight * 0.12;
        const tabWidth = popupWidth * 0.35;
        const tabHeight = popupHeight * 0.08;
        const tabSpacing = popupWidth * 0.05;
        
        // "뽑기" 탭 버튼 (활성화)
        const drawTabX = -popupWidth / 2 + tabWidth / 2 + tabSpacing;
        const drawTab = EggGachaPopup.createTabButton(
            scene,
            drawTabX,
            tabAreaY,
            tabWidth,
            tabHeight,
            '뽑기',
            true,
            () => {
                // 탭 전환 (현재는 뽑기만 활성화)
            }
        );
        popupContainer.add(drawTab);
        state.tabButtons.push(drawTab);
        
        // "리스트" 탭 버튼 (비활성화)
        const listTabX = drawTabX + tabWidth + tabSpacing;
        const listTab = EggGachaPopup.createTabButton(
            scene,
            listTabX,
            tabAreaY,
            tabWidth,
            tabHeight,
            '리스트',
            false,
            () => {
                // 추후 구현
            }
        );
        popupContainer.add(listTab);
        state.tabButtons.push(listTab);
        
        // 중앙 패널 영역 (뽑기 결과 표시용)
        const panelY = tabAreaY + tabHeight / 2 + popupHeight * 0.27;
        const panelWidth = popupWidth * 0.9;
        const panelHeight = popupHeight * 0.45;
        
        const drawPanel = scene.add.container(0, panelY);
        
        // 패널 배경
        const panelBg = scene.add.graphics();
        panelBg.fillStyle(0x1a1a2a, 0.8);
        panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 12);
        panelBg.lineStyle(2, 0x3a3a4a, 1);
        panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 12);
        drawPanel.add(panelBg);
        
        // egg_1.png 이미지 추가 (패널 중앙)
        let eggImage: Phaser.GameObjects.Image | null = null;
        if (scene.textures.exists('egg_1')) {
            const eggImageSize = Math.min(panelWidth * 0.6, panelHeight * 0.6);
            eggImage = scene.add.image(0, 0, 'egg_1');
            eggImage.setDisplaySize(eggImageSize, eggImageSize);
            eggImage.scaleX = 0.5;
            eggImage.scaleY = 0.5;
            drawPanel.add(eggImage);
            
            // 빛나는 효과용 글로우 그래픽 (초기에는 숨김)
            const glowEffect = scene.add.graphics();
            glowEffect.setVisible(false);
            drawPanel.add(glowEffect);
            state.glowEffect = glowEffect;
        }
        
        state.eggImage = eggImage;
        popupContainer.add(drawPanel);
        state.drawPanel = drawPanel;
        
        // 하단 뽑기 버튼 영역
        const buttonAreaY = panelY + panelHeight / 2 + popupHeight * 0.08;
        const buttonWidth = popupWidth * 0.5;
        const buttonHeight = popupHeight * 0.1;
        
        const drawButton = EggGachaPopup.createDrawButton(
            scene,
            0,
            buttonAreaY,
            buttonWidth,
            buttonHeight,
            EGG_GACHA_MEAT_COST,
            () => {
                // 뽑기 기능 (추후 구현)
                console.log('알 뽑기 실행');
                // 빛나는 연출 시작
                EggGachaPopup.playGlowAnimation(scene, state);
            }
        );
        popupContainer.add(drawButton);
        state.drawButton = drawButton;
        
        state.popupContainer = popupContainer;
        state.isOpen = true;
        state.activeTab = 'draw';
        
        // 애니메이션: 페이드 인 + 스케일
        popupContainer.setAlpha(0);
        popupContainer.setScale(0.8);
        
        scene.tweens.add({
            targets: popupContainer,
            alpha: 1,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        overlay.setAlpha(0);
        scene.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 200
        });
    },
    
    // 팝업 숨김
    hide(
        scene: Phaser.Scene,
        state: EggGachaPopupState
    ): void {
        if (!state.isOpen) return;
        
        // 애니메이션: 페이드 아웃 + 스케일
        if (state.popupContainer) {
            scene.tweens.add({
                targets: state.popupContainer,
                alpha: 0,
                scale: 0.8,
                duration: 150,
                ease: 'Back.easeIn',
                onComplete: () => {
                    if (state.popupContainer) {
                        state.popupContainer.destroy();
                        state.popupContainer = null;
                    }
                }
            });
        }
        
        if (state.popupOverlay) {
            scene.tweens.add({
                targets: state.popupOverlay,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    if (state.popupOverlay) {
                        state.popupOverlay.destroy();
                        state.popupOverlay = null;
                    }
                }
            });
        }
        
        if (state.closeButton) {
            state.closeButton = null;
        }
        
        if (state.drawPanel) {
            state.drawPanel = null;
        }
        
        if (state.drawButton) {
            state.drawButton = null;
        }
        
        if (state.eggImage) {
            state.eggImage = null;
        }
        
        if (state.glowEffect) {
            state.glowEffect = null;
        }
        
        state.tabButtons = [];
        state.isOpen = false;
    },
    
    // 탭 버튼 생성
    createTabButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        isActive: boolean,
        onClick: () => void
    ): Phaser.GameObjects.Container {
        const tabContainer = scene.add.container(x, y);
        
        const tabRadius = 8;
        
        // 탭 배경
        const tabBg = scene.add.graphics();
        const bgColor = isActive ? 0x4a4a5a : 0x3a3a4a;
        tabBg.fillStyle(bgColor, 1);
        tabBg.fillRoundedRect(-width / 2, -height / 2, width, height, tabRadius);
        
        // 활성화된 탭은 빨간 테두리
        const borderColor = isActive ? 0xff4444 : 0x5a5a6a;
        tabBg.lineStyle(2, borderColor, 1);
        tabBg.strokeRoundedRect(-width / 2, -height / 2, width, height, tabRadius);
        tabContainer.add(tabBg);
        
        // 탭 텍스트
        const tabFontSize = Responsive.getFontSize(scene, 18);
        const tabText = scene.add.text(0, 0, text, {
            fontSize: tabFontSize,
            color: isActive ? '#ffffff' : '#aaaaaa',
            fontFamily: 'Arial',
            font: `600 ${tabFontSize} Arial`
        });
        tabText.setOrigin(0.5);
        tabContainer.add(tabText);
        
        // 클릭 영역 (활성화된 탭만 클릭 가능)
        if (isActive) {
            const clickArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
            clickArea.setInteractive({ useHandCursor: true });
            
            clickArea.on('pointerdown', () => {
                onClick();
            });
            
            tabContainer.add(clickArea);
        }
        
        return tabContainer;
    },
    
    // 뽑기 버튼 생성
    createDrawButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        meatCost: number,
        onClick: () => void
    ): Phaser.GameObjects.Container {
        const buttonContainer = scene.add.container(x, y);
        
        const buttonRadius = 12;
        
        // 버튼 배경
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x4a4a5a, 1);
        buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonBg.lineStyle(2, 0x6a6a7a, 1);
        buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonContainer.add(buttonBg);
        
        // 버튼 텍스트
        const buttonFontSize = Responsive.getFontSize(scene, 14);
        const buttonText = scene.add.text(0, 0, `뽑기 : 고기 ${NumberFormatter.formatNumber(meatCost)}개`, {
            fontSize: buttonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `400 ${buttonFontSize} Arial`
        });
        buttonText.setOrigin(0.5);
        buttonContainer.add(buttonText);
        
        // 클릭 영역
        const clickArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        clickArea.setInteractive({ useHandCursor: true });
        
        clickArea.on('pointerdown', () => {
            onClick();
        });
        
        clickArea.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x5a5a6a, 1);
            buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
            buttonBg.lineStyle(2, 0x7a7a8a, 1);
            buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        });
        
        clickArea.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x4a4a5a, 1);
            buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
            buttonBg.lineStyle(2, 0x6a6a7a, 1);
            buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        });
        
        buttonContainer.add(clickArea);
        
        return buttonContainer;
    },
    
    // 빛나는 연출 애니메이션
    playGlowAnimation(
        scene: Phaser.Scene,
        state: EggGachaPopupState
    ): void {
        if (!state.eggImage || !state.glowEffect) return;
        
        const eggImage = state.eggImage;
        const glowEffect = state.glowEffect;
        
        // 기존 애니메이션 정지
        scene.tweens.killTweensOf(eggImage);
        scene.tweens.killTweensOf(glowEffect);
        
        // 글로우 효과 표시
        glowEffect.setVisible(true);
        
        // 애니메이션 반복 횟수
        const repeatCount = 1;
        let currentRepeat = 0;
        
        const animateGlow = () => {
            if (currentRepeat >= repeatCount) {
                // 애니메이션 종료
                glowEffect.setVisible(false);
                glowEffect.clear();
                // 원래 상태로 명시적으로 복원
                eggImage.scaleX = 0.5;
                eggImage.scaleY = 0.5;
                eggImage.setAlpha(1);
                eggImage.clearTint();
                return;
            }
            
            currentRepeat++;
            
            // 1. 스케일 + 알파 + 틴트 애니메이션 (펄스 효과)
            // 초기 상태로 명시적으로 설정
            const baseScale = 0.6;
            eggImage.scaleX = baseScale;
            eggImage.scaleY = baseScale;
            eggImage.setAlpha(1);
            eggImage.clearTint();
            
            // 펄스 애니메이션 (스케일을 살짝만 키움)
            const maxScale = baseScale * 1.05; // 0.6 기준으로 5% 증가 = 0.63
            scene.tweens.add({
                targets: eggImage,
                scaleX: maxScale,
                scaleY: maxScale,
                alpha: 0.95,
                duration: 300,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: 1,
                onUpdate: () => {
                    // 글로우 효과 업데이트 (더 부드러운 그라데이션)
                    glowEffect.clear();
                    const currentScale = eggImage.scaleX;
                    const scaleProgress = (currentScale - baseScale) / (maxScale - baseScale);
                    const currentGlowSize = eggImage.displayWidth * 1.4;
                    
                    // 부드러운 그라데이션 효과를 위한 여러 원 그리기 (더 많이)
                    const glowLayers = 8;
                    for (let i = 0; i < glowLayers; i++) {
                        const progress = i / glowLayers;
                        const radius = (currentGlowSize / 2) * (0.3 + progress * 0.7);
                        const alpha = scaleProgress * 0.4 * (1 - progress * 0.8);
                        
                        // 노란색에서 흰색으로 그라데이션
                        const colorMix = progress;
                        const r = Math.floor(255 * (1 - colorMix * 0.3));
                        const g = Math.floor(255 * (1 - colorMix * 0.1));
                        const b = Math.floor(200 * (1 - colorMix * 0.5));
                        const color = (r << 16) | (g << 8) | b;
                        
                        glowEffect.fillStyle(color, alpha);
                        glowEffect.fillCircle(0, 0, radius);
                    }
                },
                onComplete: () => {
                    // 다음 반복 또는 종료
                    if (currentRepeat < repeatCount) {
                        scene.time.delayedCall(100, animateGlow);
                    } else {
                        glowEffect.setVisible(false);
                        glowEffect.clear();
                        // 원래 상태로 명시적으로 복원
                        eggImage.scaleX = 0.5;
                        eggImage.scaleY = 0.5;
                        eggImage.setAlpha(1);
                        eggImage.clearTint();
                    }
                }
            });
            
            // 틴트 효과 (노란색으로 빛나는 효과)
            scene.tweens.add({
                targets: eggImage,
                tint: 0xffff00,
                duration: 200,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: 1
            });
        };
        
        // 애니메이션 시작
        animateGlow();
    }
};
