// 알 뽑기 팝업 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { NumberFormatter } from '../../utils/NumberFormatter';
import { GameState } from '../../managers/GameState';

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
    // 카드 오픈 관련
    cardOverlay: Phaser.GameObjects.Rectangle | null; // 마스킹 오버레이
    cardContainer: Phaser.GameObjects.Container | null; // 카드 컨테이너
    cards: Phaser.GameObjects.Container[]; // 카드 배열
    rewards: { id: number }[]; // 결정된 보상 배열
    openedCards: boolean[]; // 카드 오픈 여부
    isCardOpening: boolean; // 카드 오픈 중인지
    confirmButton: Phaser.GameObjects.Container | null; // 확인 버튼
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
                // 뽑기 기능
                // 빛나는 연출 시작
                EggGachaPopup.playGlowAnimation(scene, state);
                
                // 보상 결정 (테스트용 하드코딩)
                const rewards = [{ id: 1 }, { id: 2 }, { id: 3 }];
                
                // 카드 오픈 UI 표시
                EggGachaPopup.showCardOpeningUI(scene, state, rewards);
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
    },
    
    // 보상 결정 (테스트용 하드코딩, 추후 서버에서 받아올 예정)
    determineRewards(): { id: number }[] {
        // 테스트용: id 1, 2, 3 고정
        return [{ id: 1 }, { id: 2 }, { id: 3 }];
    },
    
    // 카드 오픈 UI 표시
    showCardOpeningUI(
        scene: Phaser.Scene,
        state: EggGachaPopupState,
        rewards: { id: number }[]
    ): void {
        if (state.isCardOpening) return;
        
        state.isCardOpening = true;
        state.rewards = rewards;
        state.openedCards = new Array(rewards.length).fill(false);
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // 마스킹 오버레이 (불투명한 회색, 클릭 불가)
        const overlay = scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x808080,
            0.9
        );
        overlay.setDepth(500);
        overlay.setInteractive({ useHandCursor: false });
        state.cardOverlay = overlay;
        
        // 카드 컨테이너
        const cardContainer = scene.add.container(gameWidth / 2, gameHeight / 2);
        cardContainer.setDepth(501);
        state.cardContainer = cardContainer;
        
        // 카드 배치 계산 (여백-카드-여백-카드-여백-카드-여백)
        const cardCount = 3;
        const marginRatio = 0.1; // 좌우 여백 10%
        const availableWidth = gameWidth * (1 - marginRatio * 2); // 사용 가능한 너비
        const cardSpacing = availableWidth / (cardCount * 2 - 1); // 카드 간 간격
        const cardWidth = cardSpacing; // 카드 너비 = 간격
        const cardHeight = cardWidth * 1.4; // 카드 높이 (비율 유지)
        
        const startX = -availableWidth / 2 + cardWidth / 2;
        
        // 카드 생성
        rewards.forEach((reward, index) => {
            const cardX = startX + index * (cardWidth + cardSpacing);
            const card = EggGachaPopup.createCard(
                scene,
                cardX,
                0,
                cardWidth,
                cardHeight,
                reward.id,
                index,
                () => {
                    EggGachaPopup.openCard(scene, card, reward.id, index, state);
                }
            );
            cardContainer.add(card);
            state.cards.push(card);
        });
        
        // 확인 버튼 (초기에는 숨김)
        const confirmButtonWidth = gameWidth * 0.3;
        const confirmButtonHeight = gameHeight * 0.08;
        const confirmButtonY = gameHeight * 0.35;
        
        const confirmButton = EggGachaPopup.createConfirmButton(
            scene,
            0,
            confirmButtonY,
            confirmButtonWidth,
            confirmButtonHeight,
            () => {
                EggGachaPopup.hideCardOpeningUI(scene, state);
            }
        );
        confirmButton.setVisible(false);
        cardContainer.add(confirmButton);
        state.confirmButton = confirmButton;
    },
    
    // 카드 생성
    createCard(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        cardId: number,
        index: number,
        onClick: () => void
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        
        // 카드 배경 (card_back)
        const cardBack = scene.add.image(0, 0, 'card_back');
        cardBack.setDisplaySize(width, height);
        cardBack.setOrigin(0.5);
        cardContainer.add(cardBack);
        
        // 카드 앞면 (card_front_{id}) - 초기에는 숨김
        const cardFrontKey = `card_front_${cardId}`;
        let cardFront: Phaser.GameObjects.Image | null = null;
        if (scene.textures.exists(cardFrontKey)) {
            cardFront = scene.add.image(0, 0, cardFrontKey);
            cardFront.setDisplaySize(width, height);
            cardFront.setOrigin(0.5);
            cardFront.setVisible(false);
            cardContainer.add(cardFront);
        }
        
        // 클릭 영역
        const clickArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        clickArea.setInteractive({ useHandCursor: true });
        
        clickArea.on('pointerdown', () => {
            onClick();
        });
        
        cardContainer.add(clickArea);
        
        // 카드 데이터 저장 (나중에 접근하기 위해)
        (cardContainer as any).cardBack = cardBack;
        (cardContainer as any).cardFront = cardFront;
        (cardContainer as any).cardId = cardId;
        (cardContainer as any).index = index;
        
        return cardContainer;
    },
    
    // 카드 오픈 애니메이션
    openCard(
        scene: Phaser.Scene,
        card: Phaser.GameObjects.Container,
        _cardId: number,
        index: number,
        state: EggGachaPopupState
    ): void {
        // 이미 열린 카드는 무시
        if (state.openedCards[index]) return;
        
        state.openedCards[index] = true;
        
        const cardBack = (card as any).cardBack;
        const cardFront = (card as any).cardFront;
        
        // 카드 스케일 애니메이션 (살짝 커졌다가 작아지기)
        scene.tweens.add({
            targets: card,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 150,
            ease: 'Sine.easeOut',
            onUpdate: () => {
                // 중간 지점에서 카드 뒤집기
                if (card.scaleX >= 1.1 && cardBack && cardBack.visible) {
                    cardBack.setVisible(false);
                    if (cardFront) {
                        cardFront.setVisible(true);
                    }
                }
            },
            onComplete: () => {
                // 다시 원래 크기로
                scene.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: 'Sine.easeIn'
                });
            }
        });
        
        // 모든 카드가 열렸는지 확인
        const allOpened = state.openedCards.every(opened => opened);
        if (allOpened && state.confirmButton) {
            // 확인 버튼 표시
            state.confirmButton.setVisible(true);
        }
    },
    
    // 확인 버튼 생성
    createConfirmButton(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        onClick: () => void
    ): Phaser.GameObjects.Container {
        const buttonContainer = scene.add.container(x, y);
        
        const buttonRadius = 12;
        
        // 버튼 배경
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x50c878, 1);
        buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonBg.lineStyle(2, 0x6ad888, 1);
        buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        buttonContainer.add(buttonBg);
        
        // 버튼 텍스트
        const buttonFontSize = Responsive.getFontSize(scene, 18);
        const buttonText = scene.add.text(0, 0, '확인', {
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
            buttonBg.fillStyle(0x60d888, 1);
            buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
            buttonBg.lineStyle(2, 0x7ae898, 1);
            buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        });
        
        clickArea.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x50c878, 1);
            buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
            buttonBg.lineStyle(2, 0x6ad888, 1);
            buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, buttonRadius);
        });
        
        buttonContainer.add(clickArea);
        
        return buttonContainer;
    },
    
    // 카드 오픈 UI 닫기
    hideCardOpeningUI(
        scene: Phaser.Scene,
        state: EggGachaPopupState
    ): void {
        // 보상 지급
        if (state.rewards && state.rewards.length > 0) {
            state.rewards.forEach(reward => {
                GameState.incrementEggGachaCount(reward.id);
            });
        }
        
        // 애니메이션으로 페이드 아웃
        if (state.cardOverlay) {
            scene.tweens.add({
                targets: state.cardOverlay,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    if (state.cardOverlay) {
                        state.cardOverlay.destroy();
                        state.cardOverlay = null;
                    }
                }
            });
        }
        
        if (state.cardContainer) {
            scene.tweens.add({
                targets: state.cardContainer,
                alpha: 0,
                scale: 0.8,
                duration: 200,
                onComplete: () => {
                    if (state.cardContainer) {
                        state.cardContainer.destroy();
                        state.cardContainer = null;
                    }
                }
            });
        }
        
        // 상태 초기화
        state.cards = [];
        state.rewards = [];
        state.openedCards = [];
        state.isCardOpening = false;
        if (state.confirmButton) {
            state.confirmButton = null;
        }
    }
};
