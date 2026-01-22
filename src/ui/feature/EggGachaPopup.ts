// 알 뽑기 팝업 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
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
    infoText: Phaser.GameObjects.Text | null;
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
        
        popupContainer.add(drawPanel);
        state.drawPanel = drawPanel;
        
        // 하단 정보 영역
        const infoAreaY = panelY + panelHeight / 2 + popupHeight * 0.08;
        const infoFontSize = Responsive.getFontSize(scene, 16);
        const infoText = scene.add.text(0, infoAreaY, `뽑기 : 고기 ${NumberFormatter.formatNumber(EGG_GACHA_MEAT_COST)}개`, {
            fontSize: infoFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `400 ${infoFontSize} Arial`
        });
        infoText.setOrigin(0.5);
        popupContainer.add(infoText);
        state.infoText = infoText;
        
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
        
        if (state.infoText) {
            state.infoText = null;
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
    }
};
