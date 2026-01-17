// 메뉴 버튼 및 팝업 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';

// 팝업 버튼 설정 인터페이스
export interface PopupButtonConfig {
    text: string;
    onClick?: (scene: Phaser.Scene) => void;
}

// 메뉴 팝업 상태 인터페이스
export interface MenuPopupState {
    menuButton: Phaser.GameObjects.Container | null;
    popupOverlay: Phaser.GameObjects.Rectangle | null;
    popupContainer: Phaser.GameObjects.Container | null;
    closeButton: Phaser.GameObjects.Container | null;
    isOpen: boolean;
    popupButtons: Phaser.GameObjects.Container[];
    buttonConfigs: PopupButtonConfig[];
}

export const MenuPopup = {
    // 메뉴 버튼 생성 (왼쪽 상단)
    createMenuButton(
        scene: Phaser.Scene,
        state: MenuPopupState
    ): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const buttonSize = gameWidth * 0.1;
        const buttonX = gameWidth * 0.075;
        const buttonY = gameHeight * 0.032;
        
        // 메뉴 버튼 컨테이너
        const menuButtonContainer = scene.add.container(buttonX, buttonY);
        
        // 버튼 배경
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x4a4a4a, 0.9);
        buttonBg.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
        buttonBg.lineStyle(2, 0xffffff, 1);
        buttonBg.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
        buttonBg.setDepth(20);
        menuButtonContainer.add(buttonBg);
        
        // 햄버거 메뉴 아이콘 (3줄)
        const lineWidth = buttonSize * 0.4;
        const lineHeight = buttonSize * 0.08;
        const lineSpacing = buttonSize * 0.15;
        
        const line1 = scene.add.rectangle(0, -lineSpacing, lineWidth, lineHeight, 0xffffff, 1);
        const line2 = scene.add.rectangle(0, 0, lineWidth, lineHeight, 0xffffff, 1);
        const line3 = scene.add.rectangle(0, lineSpacing, lineWidth, lineHeight, 0xffffff, 1);
        
        line1.setDepth(21);
        line2.setDepth(21);
        line3.setDepth(21);
        menuButtonContainer.add([line1, line2, line3]);
        
        // 클릭 영역
        const clickArea = scene.add.rectangle(0, 0, buttonSize, buttonSize, 0x000000, 0);
        clickArea.setInteractive({ useHandCursor: true });
        clickArea.setDepth(22);
        
        clickArea.on('pointerdown', () => {
            if (state.isOpen) {
                MenuPopup.hidePopup(scene, state);
            } else {
                MenuPopup.showPopup(scene, state);
            }
        });
        
        clickArea.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x5a5a5a, 0.9);
            buttonBg.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
            buttonBg.lineStyle(2, 0xffff00, 1);
            buttonBg.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
        });
        
        clickArea.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x4a4a4a, 0.9);
            buttonBg.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
            buttonBg.lineStyle(2, 0xffffff, 1);
            buttonBg.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
        });
        
        menuButtonContainer.add(clickArea);
        menuButtonContainer.setDepth(20);
        
        state.menuButton = menuButtonContainer;
    },
    
    // 팝업 표시
    showPopup(
        scene: Phaser.Scene,
        state: MenuPopupState
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
            MenuPopup.hidePopup(scene, state);
        });
        
        state.popupOverlay = overlay;
        
        // 팝업 컨테이너
        const popupWidth = gameWidth * 0.6;
        const popupHeight = gameHeight * 0.7;
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
            MenuPopup.hidePopup(scene, state);
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
        
        // 버튼 영역
        const buttonAreaY = -popupHeight / 2 + popupHeight * 0.15;
        const buttonWidth = popupWidth * 0.8;
        const buttonHeight = popupHeight * 0.1;
        const buttonSpacing = popupHeight * 0.05;
        
        // 기존 버튼들 제거
        state.popupButtons.forEach(btn => btn.destroy());
        state.popupButtons = [];
        
        // 버튼 생성
        state.buttonConfigs.forEach((config, index) => {
            const buttonY = buttonAreaY + index * (buttonHeight + buttonSpacing);
            const button = MenuPopup.createPopupButton(
                scene,
                0,
                buttonY,
                buttonWidth,
                buttonHeight,
                config.text,
                config.onClick
            );
            popupContainer.add(button);
            state.popupButtons.push(button);
        });
        
        state.popupContainer = popupContainer;
        state.isOpen = true;
        
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
    hidePopup(
        scene: Phaser.Scene,
        state: MenuPopupState
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
        
        state.isOpen = false;
    },
    
    // 팝업 내부 버튼 생성
    createPopupButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        onClick?: (scene: Phaser.Scene) => void
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
        const buttonFontSize = Responsive.getFontSize(scene, 18);
        const buttonText = scene.add.text(0, 0, text, {
            fontSize: buttonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${buttonFontSize} Arial`
        });
        buttonText.setOrigin(0.5);
        buttonContainer.add(buttonText);
        
        // 클릭 영역
        const clickArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        clickArea.setInteractive({ useHandCursor: true });
        
        clickArea.on('pointerdown', () => {
            if (onClick) {
                onClick(scene);
            }
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
    
    // 팝업 버튼 추가
    addPopupButton(
        state: MenuPopupState,
        config: PopupButtonConfig
    ): void {
        state.buttonConfigs.push(config);
        
        // 팝업이 열려있으면 다시 그리기
        // (이 경우 scene이 필요하므로 외부에서 처리하도록 함)
    }
};
