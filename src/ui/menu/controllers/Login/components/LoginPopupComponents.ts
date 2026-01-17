// 로그인 팝업 UI 컴포넌트 생성
import Phaser from 'phaser';
import { Responsive } from '../../../../../utils/Responsive';
import { LoginInputField, InputFieldConfig } from './LoginInputField';

export const LoginPopupComponents = {
    // 오버레이 생성
    createOverlay(
        scene: Phaser.Scene,
        gameWidth: number,
        gameHeight: number
    ): Phaser.GameObjects.Rectangle {
        const overlay = scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x000000,
            0.8
        );
        overlay.setDepth(110);
        overlay.setInteractive({ useHandCursor: false });
        return overlay;
    },
    
    // 팝업 배경 생성
    createPopupBackground(
        scene: Phaser.Scene,
        popupWidth: number,
        popupHeight: number
    ): Phaser.GameObjects.Graphics {
        const popupBg = scene.add.graphics();
        popupBg.fillStyle(0x2a2a3a, 0.95);
        popupBg.fillRoundedRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 16);
        popupBg.lineStyle(3, 0x4a4a5a, 1);
        popupBg.strokeRoundedRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 16);
        return popupBg;
    },
    
    // 닫기 버튼 생성
    createCloseButton(
        scene: Phaser.Scene,
        popupWidth: number,
        popupHeight: number,
        onClose: () => void
    ): Phaser.GameObjects.Container {
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
            onClose();
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
        
        return closeButtonContainer;
    },
    
    // 타이틀 생성
    createTitle(
        scene: Phaser.Scene,
        popupHeight: number,
        title: string
    ): Phaser.GameObjects.Text {
        const titleFontSize = Responsive.getFontSize(scene, 24);
        const titleY = -popupHeight / 2 + popupHeight * 0.15;
        const titleText = scene.add.text(0, titleY, title, {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `bold ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        return titleText;
    },
    
    // 입력 필드 생성 (ID/Password 공통)
    createInputField(
        scene: Phaser.Scene,
        container: Phaser.GameObjects.Container,
        config: InputFieldConfig,
        popupX: number,
        popupY: number,
        inputY: number,
        inputWidth: number,
        inputHeight: number,
        inputSpacing: number,
        gameWidth: number,
        gameHeight: number
    ): { htmlInput: HTMLInputElement; label: Phaser.GameObjects.Text; bg: Phaser.GameObjects.Graphics } {
        // 라벨
        const labelY = inputY - inputHeight / 2 - inputSpacing * 0.3;
        const label = LoginInputField.createInputLabel(
            scene,
            -inputWidth / 2,
            labelY,
            config.label
        );
        container.add(label);
        
        // 배경
        const bg = LoginInputField.createInputBackground(
            scene,
            0,
            inputY,
            inputWidth,
            inputHeight
        );
        container.add(bg);
        
        // HTML Input
        const htmlInput = LoginInputField.createHTMLInput(
            scene,
            config,
            popupX,
            popupY,
            inputY,
            inputWidth,
            inputHeight,
            gameWidth,
            gameHeight
        );
        
        return { htmlInput, label, bg };
    },
    
    // 액션 버튼 생성 (로그인/취소)
    createActionButtons(
        scene: Phaser.Scene,
        buttonY: number,
        buttonWidth: number,
        buttonHeight: number,
        buttonSpacing: number,
        onLogin: () => void,
        onCancel: () => void
    ): { loginButton: Phaser.GameObjects.Container; cancelButton: Phaser.GameObjects.Container } {
        const loginButton = this.createButton(
            scene,
            -buttonWidth / 2 - buttonSpacing / 2,
            buttonY,
            buttonWidth,
            buttonHeight,
            '로그인',
            0x50c878,
            onLogin
        );
        
        const cancelButton = this.createButton(
            scene,
            buttonWidth / 2 + buttonSpacing / 2,
            buttonY,
            buttonWidth,
            buttonHeight,
            '취소',
            0x555555,
            onCancel
        );
        
        return { loginButton, cancelButton };
    },
    
    // 버튼 생성 (공통)
    createButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        text: string,
        bgColor: number,
        onClick: () => void
    ): Phaser.GameObjects.Container {
        const buttonContainer = scene.add.container(x, y);
        
        const buttonRadius = 12;
        
        // 버튼 배경
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(bgColor, 1);
        buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonBg.lineStyle(2, bgColor === 0x50c878 ? 0x6ad888 : 0x666666, 1);
        buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonContainer.add(buttonBg);
        
        // 버튼 텍스트
        const buttonFontSize = Responsive.getFontSize(scene, 16);
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
            onClick();
        });
        
        clickArea.on('pointerover', () => {
            buttonBg.clear();
            const hoverColor = bgColor === 0x50c878 ? 0x60d888 : 0x666666;
            buttonBg.fillStyle(hoverColor, 1);
            buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
            buttonBg.lineStyle(2, bgColor === 0x50c878 ? 0x7ae898 : 0x777777, 1);
            buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        });
        
        clickArea.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(bgColor, 1);
            buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
            buttonBg.lineStyle(2, bgColor === 0x50c878 ? 0x6ad888 : 0x666666, 1);
            buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        });
        
        buttonContainer.add(clickArea);
        
        return buttonContainer;
    },
    
    // 표시 애니메이션
    playShowAnimation(
        scene: Phaser.Scene,
        popupContainer: Phaser.GameObjects.Container,
        overlay: Phaser.GameObjects.Rectangle
    ): void {
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
            alpha: 0.8,
            duration: 200
        });
    },
    
    // 숨김 애니메이션
    playHideAnimation(
        scene: Phaser.Scene,
        popupContainer: Phaser.GameObjects.Container | null,
        overlay: Phaser.GameObjects.Rectangle | null,
        onComplete: () => void
    ): void {
        let completedCount = 0;
        const checkComplete = () => {
            completedCount++;
            if (completedCount === 2) {
                onComplete();
            }
        };
        
        if (popupContainer) {
            scene.tweens.add({
                targets: popupContainer,
                alpha: 0,
                scale: 0.8,
                duration: 150,
                ease: 'Back.easeIn',
                onComplete: () => {
                    if (popupContainer) {
                        popupContainer.destroy();
                    }
                    checkComplete();
                }
            });
        } else {
            checkComplete();
        }
        
        if (overlay) {
            scene.tweens.add({
                targets: overlay,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    if (overlay) {
                        overlay.destroy();
                    }
                    checkComplete();
                }
            });
        } else {
            checkComplete();
        }
    }
};
