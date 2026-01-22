// Feature 메뉴 버튼 및 팝업 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';

// Feature 버튼 설정 인터페이스
export interface FeatureButtonConfig {
    icon: string; // 아이콘 텍스트 또는 이모지
    label?: string; // 버튼 아래 표시할 텍스트 (예: "알 뽑기")
    onClick?: (scene: Phaser.Scene) => void;
    shouldShow?: () => boolean; // 버튼 표시 여부를 결정하는 함수 (없으면 항상 표시)
}

// Feature 메뉴 팝업 상태 인터페이스
export interface FeatureMenuPopupState {
    featureButton: Phaser.GameObjects.Container | null;
    popupPanel: Phaser.GameObjects.Container | null;
    isOpen: boolean;
    featureButtons: Phaser.GameObjects.Container[];
    buttonConfigs: FeatureButtonConfig[];
}

export const FeatureMenuPopup = {
    // Feature 버튼 생성 (우상단)
    createFeatureButton(
        scene: Phaser.Scene,
        state: FeatureMenuPopupState
    ): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const buttonSize = gameWidth * 0.08; // 작은 버튼 (조금 더 크게)
        const buttonX = gameWidth * 0.92; // 화면 안쪽으로 조정
        const buttonY = gameHeight * 0.04;
        
        // Feature 버튼 컨테이너
        const featureButtonContainer = scene.add.container(buttonX, buttonY);
        
        // 버튼 배경
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x4a4a4a, 0.9);
        buttonBg.fillRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
        buttonBg.lineStyle(2, 0xffffff, 1);
        buttonBg.strokeRoundedRect(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, 8);
        buttonBg.setDepth(200); // 높은 depth로 설정
        featureButtonContainer.add(buttonBg);
        
        // 햄버거 메뉴 아이콘 (3줄)
        const lineWidth = buttonSize * 0.4;
        const lineHeight = buttonSize * 0.08;
        const lineSpacing = buttonSize * 0.15;
        
        const line1 = scene.add.rectangle(0, -lineSpacing, lineWidth, lineHeight, 0xffffff, 1);
        const line2 = scene.add.rectangle(0, 0, lineWidth, lineHeight, 0xffffff, 1);
        const line3 = scene.add.rectangle(0, lineSpacing, lineWidth, lineHeight, 0xffffff, 1);
        
        line1.setDepth(201);
        line2.setDepth(201);
        line3.setDepth(201);
        featureButtonContainer.add([line1, line2, line3]);
        
        // 클릭 영역
        const clickArea = scene.add.rectangle(0, 0, buttonSize, buttonSize, 0x000000, 0);
        clickArea.setInteractive({ useHandCursor: true });
        clickArea.setDepth(202);
        
        clickArea.on('pointerdown', () => {
            if (state.isOpen) {
                FeatureMenuPopup.hidePanel(scene, state);
            } else {
                FeatureMenuPopup.showPanel(scene, state);
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
        
        featureButtonContainer.add(clickArea);
        featureButtonContainer.setDepth(200); // 높은 depth로 설정
        
        state.featureButton = featureButtonContainer;
    },
    
    // 패널 표시 (버튼 위치에서 슬라이드)
    showPanel(
        scene: Phaser.Scene,
        state: FeatureMenuPopupState
    ): void {
        if (state.isOpen) return;
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const buttonX = gameWidth * 0.92;
        const buttonY = gameHeight * 0.04;
        
        // 패널 크기 (MenuPopup보다 작게)
        const panelWidth = gameWidth * 0.6;
        const panelHeight = gameHeight * 0.3;
        
        // 패널 시작 위치 (버튼 위치)
        const startX = buttonX;
        const startY = buttonY;
        
        // 패널 최종 위치 (버튼 아래로 펼쳐짐)
        const endX = buttonX - panelWidth / 2;
        const endY = buttonY + panelHeight / 2 + buttonY * 0.5;
        
        // 패널 컨테이너
        const panelContainer = scene.add.container(startX, startY);
        panelContainer.setDepth(100);
        
        // 패널 배경 (불투명)
        const panelBg = scene.add.graphics();
        panelBg.fillStyle(0x2a2a3a, 0.95);
        panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panelBg.lineStyle(3, 0x4a4a5a, 1);
        panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panelContainer.add(panelBg);
        
        // 닫기 버튼
        const closeButtonSize = panelWidth * 0.08;
        const closeButtonX = panelWidth / 2 - closeButtonSize / 2 - 10;
        const closeButtonY = -panelHeight / 2 + closeButtonSize / 2 + 10;
        
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
            FeatureMenuPopup.hidePanel(scene, state);
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
        panelContainer.add(closeButtonContainer);
        
        // Feature 버튼 영역
        const buttonAreaStartY = -panelHeight / 2 + panelHeight * 0.15;
        const buttonSize = panelWidth * 0.15; // 작은 아이콘 버튼 크기
        const buttonSpacing = panelWidth * 0.05;
        const buttonsPerRow = 3; // 한 줄에 3개씩
        
        // 기존 버튼들 제거
        state.featureButtons.forEach(btn => btn.destroy());
        state.featureButtons = [];
        
        // 표시할 버튼들만 필터링
        const visibleConfigs = state.buttonConfigs.filter(config => {
            if (!config.shouldShow) {
                return true;
            }
            return config.shouldShow();
        });
        
        // 버튼 생성 (그리드 형태)
        visibleConfigs.forEach((config, index) => {
            const row = Math.floor(index / buttonsPerRow);
            const col = index % buttonsPerRow;
            
            const buttonX = -panelWidth / 2 + panelWidth * 0.15 + col * (buttonSize + buttonSpacing);
            const buttonY = buttonAreaStartY + row * (buttonSize + buttonSpacing);
            
            const button = FeatureMenuPopup.createFeatureIconButton(
                scene,
                buttonX,
                buttonY,
                buttonSize,
                config.icon,
                config.label,
                config.onClick
            );
            panelContainer.add(button);
            state.featureButtons.push(button);
        });
        
        state.popupPanel = panelContainer;
        state.isOpen = true;
        
        // 슬라이드 애니메이션: 버튼 위치에서 아래로 펼쳐짐
        panelContainer.setScale(0.1);
        panelContainer.setAlpha(0);
        
        scene.tweens.add({
            targets: panelContainer,
            x: endX,
            y: endY,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    },
    
    // 패널 숨김
    hidePanel(
        scene: Phaser.Scene,
        state: FeatureMenuPopupState
    ): void {
        if (!state.isOpen) return;
        
        const gameWidth = scene.scale.width;
        const buttonX = gameWidth * 0.92;
        const buttonY = scene.scale.height * 0.04;
        
        // 슬라이드 애니메이션: 버튼 위치로 다시 접힘
        if (state.popupPanel) {
            scene.tweens.add({
                targets: state.popupPanel,
                x: buttonX,
                y: buttonY,
                scaleX: 0.1,
                scaleY: 0.1,
                alpha: 0,
                duration: 250,
                ease: 'Back.easeIn',
                onComplete: () => {
                    if (state.popupPanel) {
                        state.popupPanel.destroy();
                        state.popupPanel = null;
                    }
                }
            });
        }
        
        state.isOpen = false;
    },
    
    // Feature 아이콘 버튼 생성 (패널 내부 작은 아이콘 버튼)
    createFeatureIconButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        size: number,
        icon: string,
        label?: string,
        onClick?: (scene: Phaser.Scene) => void
    ): Phaser.GameObjects.Container {
        const buttonContainer = scene.add.container(x, y);
        
        const buttonRadius = 8;
        
        // 라벨이 있으면 버튼 높이를 더 크게 조정
        const hasLabel = !!label;
        const buttonHeight = hasLabel ? size * 1.3 : size;
        const iconY = hasLabel ? -buttonHeight * 0.15 : 0;
        
        // 버튼 배경
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x4a4a5a, 1);
        buttonBg.fillRoundedRect(-size / 2, -buttonHeight / 2, size, buttonHeight, buttonRadius);
        buttonBg.lineStyle(2, 0x6a6a7a, 1);
        buttonBg.strokeRoundedRect(-size / 2, -buttonHeight / 2, size, buttonHeight, buttonRadius);
        buttonContainer.add(buttonBg);
        
        // 아이콘
        const iconFontSize = Responsive.getFontSize(scene, size * 0.5);
        const iconText = scene.add.text(0, iconY, icon, {
            fontSize: iconFontSize,
            fontFamily: 'Arial'
        });
        iconText.setOrigin(0.5);
        buttonContainer.add(iconText);
        
        // 라벨 텍스트 (아이콘 아래)
        if (label) {
            const labelFontSize = Responsive.getFontSize(scene, size * 0.2);
            const labelText = scene.add.text(0, iconY + size * 0.53, label, {
                fontSize: labelFontSize,
                color: '#ffffff',
                fontFamily: 'Arial',
                font: `400 ${labelFontSize} Arial`
            });
            labelText.setOrigin(0.5);
            buttonContainer.add(labelText);
        }
        
        // 클릭 영역
        const clickArea = scene.add.rectangle(0, 0, size, buttonHeight, 0x000000, 0);
        clickArea.setInteractive({ useHandCursor: true });
        
        clickArea.on('pointerdown', () => {
            if (onClick) {
                onClick(scene);
            }
        });
        
        clickArea.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x5a5a6a, 1);
            buttonBg.fillRoundedRect(-size / 2, -buttonHeight / 2, size, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x7a7a8a, 1);
            buttonBg.strokeRoundedRect(-size / 2, -buttonHeight / 2, size, buttonHeight, buttonRadius);
        });
        
        clickArea.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x4a4a5a, 1);
            buttonBg.fillRoundedRect(-size / 2, -buttonHeight / 2, size, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x6a6a7a, 1);
            buttonBg.strokeRoundedRect(-size / 2, -buttonHeight / 2, size, buttonHeight, buttonRadius);
        });
        
        buttonContainer.add(clickArea);
        
        return buttonContainer;
    },
    
    // Feature 버튼 추가
    addFeatureButton(
        state: FeatureMenuPopupState,
        config: FeatureButtonConfig
    ): void {
        state.buttonConfigs.push(config);
    }
};
