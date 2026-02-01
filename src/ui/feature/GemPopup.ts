// 보옥 팝업 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { NumberFormatter } from '../../utils/NumberFormatter';
import { GemManager } from '../../managers/state/GemManager';

// 보옥 팝업 상태 인터페이스
export interface GemPopupState {
    popupOverlay: Phaser.GameObjects.Rectangle | null;
    popupContainer: Phaser.GameObjects.Container | null;
    closeButton: Phaser.GameObjects.Container | null;
    isOpen: boolean;
    gemImage: Phaser.GameObjects.Image | null;
    statCards: Phaser.GameObjects.Container[]; // 3개 스탯 카드
    upgradeButton: Phaser.GameObjects.Container | null;
    statTexts: Phaser.GameObjects.Text[]; // 스탯 값 텍스트 (업데이트용)
    upgradeButtonText: Phaser.GameObjects.Text | null; // 업그레이드 버튼 텍스트 (업데이트용)
    upgradeButtonBg: Phaser.GameObjects.Graphics | null; // 업그레이드 버튼 배경 (업데이트용)
    upgradeClickArea: Phaser.GameObjects.Rectangle | null; // 업그레이드 버튼 클릭 영역
}

export const GemPopup = {
    // 팝업 표시
    show(
        scene: Phaser.Scene,
        state: GemPopupState
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
            GemPopup.hide(scene, state);
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
            GemPopup.hide(scene, state);
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
        
        // 보옥 이미지 (중앙 상단)
        const gemImageY = -popupHeight / 2 + popupHeight * 0.2;
        let gemImage: Phaser.GameObjects.Image | null = null;
        if (scene.textures.exists('gem')) {
            const gemImageSize = Math.min(popupWidth * 0.8, popupHeight * 0.8);
            gemImage = scene.add.image(0, gemImageY, 'gem');
            gemImage.setDisplaySize(gemImageSize, gemImageSize);
            gemImage.setOrigin(0.5, 0.5);
            popupContainer.add(gemImage);
        }
        state.gemImage = gemImage;
        
        // 스탯 카드 영역 (중앙 하단) - 세로 배치
        const statAreaY = gemImageY * 1.4 + (gemImage ? gemImage.displayHeight / 2 : 0) + popupHeight * 0.15;
        const statCardWidth = popupWidth * 0.5; // 가로 배치보다 넓게
        const statCardHeight = popupHeight * 0.12; // 세로 배치를 위해 높이 조정
        const statCardSpacing = popupHeight * 0.03; // 세로 간격
        
        state.statCards = [];
        state.statTexts = [];
        
        // 스탯 카드 3개 생성 (세로 배치)
        const statLabels = ['공격력', '공격력 %', '치명타 데미지'];
        const statValues = [
            GemManager.getAttackPower(),
            GemManager.getAttackPowerPercent(),
            GemManager.getCritDamage()
        ];
        
        for (let i = 0; i < 3; i++) {
            const cardX = 0; // 중앙 정렬
            const cardY = statAreaY + i * (statCardHeight + statCardSpacing);
            const statCard = GemPopup.createStatCard(
                scene,
                cardX,
                cardY,
                statCardWidth,
                statCardHeight,
                statLabels[i],
                statValues[i],
                i === 1 || i === 2 // 공격력%와 치명타 데미지는 % 표시
            );
            popupContainer.add(statCard);
            state.statCards.push(statCard);
            
            // 스탯 값 텍스트 저장 (업데이트용)
            const statText = (statCard as any).statValueText as Phaser.GameObjects.Text;
            if (statText) {
                state.statTexts.push(statText);
            }
        }
        
        // 업그레이드 버튼 (하단)
        const upgradeButtonY = statAreaY * 1.4 + 3 * (statCardHeight + statCardSpacing) - statCardSpacing + popupHeight * 0.08;
        const upgradeButtonWidth = popupWidth * 0.4;
        const upgradeButtonHeight = popupHeight * 0.1;
        
        const upgradeButton = GemPopup.createUpgradeButton(
            scene,
            0,
            upgradeButtonY,
            upgradeButtonWidth,
            upgradeButtonHeight,
            state,
            () => {
                // 업그레이드 버튼 클릭
                if (GemManager.canUpgradeGem()) {
                    const success = GemManager.upgradeGem();
                    if (success) {
                        // 스탯 업데이트
                        GemPopup.updateStats(scene, state);
                        // 업그레이드 버튼 비용 업데이트
                        GemPopup.updateUpgradeButton(scene, state);
                    }
                }
            }
        );
        popupContainer.add(upgradeButton);
        state.upgradeButton = upgradeButton;
        
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
    hide(
        scene: Phaser.Scene,
        state: GemPopupState
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
        
        // 상태 초기화
        state.closeButton = null;
        state.gemImage = null;
        state.statCards = [];
        state.statTexts = [];
        state.upgradeButton = null;
        state.upgradeButtonText = null;
        state.upgradeButtonBg = null;
        state.upgradeClickArea = null;
        state.isOpen = false;
    },
    
    // 스탯 카드 생성
    createStatCard(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        label: string,
        value: number,
        isPercent: boolean = false
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        
        // 카드 배경
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(0x1a1a2a, 0.8);
        cardBg.fillRoundedRect(-width * 0.95, -height / 2, width * 1.9, height, 12);
        cardBg.lineStyle(2, 0x3a3a4a, 1);
        cardBg.strokeRoundedRect(-width * 0.95, -height / 2, width * 1.9, height, 12);
        cardContainer.add(cardBg);
        
        // 레이블 텍스트 (왼쪽)
        const labelFontSize = Responsive.getFontSize(scene, 16);
        const labelText = scene.add.text(-width * 0.35, 0, label, {
            fontSize: labelFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${labelFontSize} Arial`
        });
        labelText.setOrigin(0.5);
        cardContainer.add(labelText);
        
        // 값 텍스트 (오른쪽)
        const valueFontSize = Responsive.getFontSize(scene, 18);
        const valueText = scene.add.text(width * 0.35, 0, '', {
            fontSize: valueFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `bold ${valueFontSize} Arial`
        });
        valueText.setOrigin(0.5);
        
        // 값 포맷팅
        if (isPercent) {
            valueText.setText(`+${NumberFormatter.formatNumber(value)}%`);
        } else {
            valueText.setText(`+${NumberFormatter.formatNumber(value)}`);
        }
        
        cardContainer.add(valueText);
        
        // 스탯 값 텍스트 참조 저장 (업데이트용)
        (cardContainer as any).statValueText = valueText;
        
        return cardContainer;
    },
    
    // 업그레이드 버튼 생성
    createUpgradeButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        state: GemPopupState,
        onClick: () => void
    ): Phaser.GameObjects.Container {
        const buttonContainer = scene.add.container(x, y);
        
        const buttonRadius = 12;
        
        // 업그레이드 비용 가져오기
        const cost = GemManager.getCurrentUpgradeCost();
        const canUpgrade = GemManager.canUpgradeGem();
        
        // 버튼 배경
        const buttonBg = scene.add.graphics();
        const buttonColor = canUpgrade ? 0x4a4a5a : 0x333333; // 비활성화 시 더 어두운 색
        const buttonLineColor = canUpgrade ? 0x6a6a7a : 0x444444;
        buttonBg.fillStyle(buttonColor, 1);
        buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonBg.lineStyle(2, buttonLineColor, 1);
        buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonContainer.add(buttonBg);
        state.upgradeButtonBg = buttonBg;
        
        // 버튼 텍스트 (비용 포함)
        const buttonFontSize = Responsive.getFontSize(scene, 16);
        const buttonTextContent = `업그레이드 (${NumberFormatter.formatNumber(cost)} 젬)`;
        const buttonText = scene.add.text(0, 0, buttonTextContent, {
            fontSize: buttonFontSize,
            color: canUpgrade ? '#ffffff' : '#888888',
            fontFamily: 'Arial',
            font: `600 ${buttonFontSize} Arial`
        });
        buttonText.setOrigin(0.5);
        buttonContainer.add(buttonText);
        state.upgradeButtonText = buttonText;
        
        // 클릭 영역
        const clickArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        if (canUpgrade) {
            clickArea.setInteractive({ useHandCursor: true });
        }
        state.upgradeClickArea = clickArea;
        
        clickArea.on('pointerdown', () => {
            if (canUpgrade) {
                onClick();
            }
        });
        
        if (canUpgrade) {
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
        }
        
        buttonContainer.add(clickArea);
        
        return buttonContainer;
    },
    
    // 스탯 업데이트 (팝업이 열려있을 때 호출)
    updateStats(
        _scene: Phaser.Scene,
        state: GemPopupState
    ): void {
        if (!state.isOpen || state.statTexts.length !== 3) return;
        
        const statValues = [
            GemManager.getAttackPower(),
            GemManager.getAttackPowerPercent(),
            GemManager.getCritDamage()
        ];
        
        // 스탯 값 텍스트 업데이트
        state.statTexts.forEach((text, index) => {
            const isPercent = index === 1 || index === 2; // 공격력%와 치명타 데미지는 % 표시
            if (isPercent) {
                text.setText(`+${NumberFormatter.formatNumber(statValues[index])}%`);
            } else {
                text.setText(`+${NumberFormatter.formatNumber(statValues[index])}`);
            }
        });
    },
    
    // 업그레이드 버튼 업데이트 (비용 및 활성화 상태)
    updateUpgradeButton(
        _scene: Phaser.Scene,
        state: GemPopupState
    ): void {
        if (!state.isOpen || !state.upgradeButton || !state.upgradeButtonText || !state.upgradeButtonBg || !state.upgradeClickArea) return;
        
        const cost = GemManager.getCurrentUpgradeCost();
        const canUpgrade = GemManager.canUpgradeGem();
        const buttonWidth = state.upgradeButton.width || 200;
        const buttonHeight = state.upgradeButton.height || 50;
        const buttonRadius = 12;
        
        // 버튼 텍스트 업데이트
        const buttonTextContent = `업그레이드 (${NumberFormatter.formatNumber(cost)} 젬)`;
        state.upgradeButtonText.setText(buttonTextContent);
        state.upgradeButtonText.setColor(canUpgrade ? '#ffffff' : '#888888');
        
        // 버튼 배경 업데이트
        state.upgradeButtonBg.clear();
        const buttonColor = canUpgrade ? 0x4a4a5a : 0x333333;
        const buttonLineColor = canUpgrade ? 0x6a6a7a : 0x444444;
        state.upgradeButtonBg.fillStyle(buttonColor, 1);
        state.upgradeButtonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        state.upgradeButtonBg.lineStyle(2, buttonLineColor, 1);
        state.upgradeButtonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        
        // 클릭 영역 업데이트
        if (canUpgrade) {
            state.upgradeClickArea.setInteractive({ useHandCursor: true });
        } else {
            state.upgradeClickArea.removeInteractive();
        }
    }
};
