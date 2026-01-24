// Stats 상세 팝업 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { STATS_DETAIL_ITEMS, StatsDetailItem } from '../../config/statsDetailTabConfig';

// Stats 상세 팝업 상태 인터페이스
export interface StatsDetailPopupState {
    popupOverlay: Phaser.GameObjects.Rectangle | null;
    popupContainer: Phaser.GameObjects.Container | null;
    closeButton: Phaser.GameObjects.Container | null;
    statCards: Phaser.GameObjects.Container[];
    scrollContainer: Phaser.GameObjects.Container | null;
    scrollArea: Phaser.GameObjects.Rectangle | null;
    scrollStartY: number;
    scrollStartContainerY: number;
    isScrolling: boolean;
    isOpen: boolean;
}

export const StatsDetailPopup = {
    // 팝업 표시
    show(
        scene: Phaser.Scene,
        state: StatsDetailPopupState
    ): void {
        if (state.isOpen) return;
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // 팝업 컨테이너 크기 계산
        const popupWidth = gameWidth * 0.7;
        const popupHeight = gameHeight * 0.7;
        const popupX = gameWidth / 2;
        const popupY = gameHeight / 2;
        
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
        
        // 오버레이 클릭 시 팝업 닫기 (팝업 외부만)
        overlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const clickX = pointer.x;
            const clickY = pointer.y;
            const popupLeft = popupX - popupWidth / 2;
            const popupRight = popupX + popupWidth / 2;
            const popupTop = popupY - popupHeight / 2;
            const popupBottom = popupY + popupHeight / 2;
            
            if (clickX < popupLeft || clickX > popupRight || clickY < popupTop || clickY > popupBottom) {
                StatsDetailPopup.hide(scene, state);
            }
        });
        
        state.popupOverlay = overlay;
        
        // 팝업 컨테이너
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
            font: `600 ${xFontSize} Arial`
        });
        xText.setOrigin(0.5);
        closeButtonContainer.add(xText);
        
        // 닫기 버튼 클릭 영역
        const closeClickArea = scene.add.rectangle(0, 0, closeButtonSize, closeButtonSize, 0x000000, 0);
        closeClickArea.setInteractive({ useHandCursor: true });
        closeClickArea.on('pointerdown', () => {
            StatsDetailPopup.hide(scene, state);
        });
        closeButtonContainer.add(closeClickArea);
        
        popupContainer.add(closeButtonContainer);
        state.closeButton = closeButtonContainer;
        
        // 타이틀
        const titleFontSize = Responsive.getFontSize(scene, 24);
        const titleText = scene.add.text(0, -popupHeight / 2 + 40, '스탯 상세', {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        popupContainer.add(titleText);
        
        // 스크롤 가능한 영역 설정
        const scrollAreaStartY = -popupHeight / 2 + 80;
        const scrollAreaHeight = popupHeight * 0.75;
        const scrollAreaWidth = popupWidth * 0.9;
        const scrollAreaX = 0; // popupContainer 기준 중앙
        
        // 카드 설정
        const cardWidth = scrollAreaWidth * 0.95;
        const cardHeight = scrollAreaHeight * 0.12;
        const cardRadius = 12;
        
        // 스크롤 영역 배경
        const scrollBackground = scene.add.graphics();
        scrollBackground.fillStyle(0x1a1a1a, 0.8);
        scrollBackground.fillRoundedRect(
            scrollAreaX - scrollAreaWidth / 2,
            scrollAreaStartY,
            scrollAreaWidth,
            popupHeight * 0.85,
            8
        );
        scrollBackground.setDepth(-1);
        popupContainer.add(scrollBackground);
        
        // 스크롤 컨테이너 생성
        const scrollContainer = scene.add.container(scrollAreaX, scrollAreaStartY);
        
        // Todo. 마스크 생성
        // const maskGraphics = scene.add.graphics();
        // maskGraphics.fillStyle(0x1a1a1a, 1);
        // maskGraphics.fillRect(
        //     scrollAreaX - scrollAreaWidth / 2,
        //     scrollAreaStartY,
        //     scrollAreaWidth,
        //     scrollAreaHeight
        // );
        // const mask = maskGraphics.createGeometryMask();
        // scrollContainer.setMask(mask);
        
        // popupContainer.add(maskGraphics);
        popupContainer.add(scrollContainer);
        state.scrollContainer = scrollContainer;
        
        // 카드 생성
        let currentCardY = cardHeight * 0.5;
        const startCardHeight = cardHeight * 0.5;
        state.statCards = [];
        
        STATS_DETAIL_ITEMS.forEach((item: StatsDetailItem) => {
            const cardContainer = StatsDetailPopup.createStatCard(
                scene,
                0,
                currentCardY,
                cardWidth,
                startCardHeight,
                cardRadius,
                item
            );
            
            scrollContainer.add(cardContainer);
            state.statCards.push(cardContainer);
            
            currentCardY += startCardHeight + startCardHeight * 0.3;
        });
        
        // 스크롤 영역 (클릭 가능한 영역)
        const scrollArea = scene.add.rectangle(
            scrollAreaX,
            scrollAreaStartY + scrollAreaHeight / 2,
            scrollAreaWidth,
            scrollAreaHeight,
            0x000000,
            0
        );
        scrollArea.setInteractive({ useHandCursor: true });
        scrollArea.setDepth(200);
        popupContainer.add(scrollArea);
        state.scrollArea = scrollArea;
        
        // 스크롤 컨테이너의 실제 높이 계산
        const totalCardsHeight = currentCardY;
        
        // 스크롤 기능 설정
        if (totalCardsHeight > scrollAreaHeight) {
            StatsDetailPopup.setupScroll(
                scene,
                state,
                scrollAreaHeight,
                scrollAreaStartY,
                totalCardsHeight
            );
        }
        
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
    
    // 스탯 카드 생성
    createStatCard(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        item: StatsDetailItem
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        
        // 카드 배경
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(0x2a2a3a, 0.95);
        cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        cardBg.lineStyle(2, 0x4a4a5a, 0.8);
        cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
        cardContainer.add(cardBg);
        
        // 이름 텍스트 (왼쪽)
        const nameFontSize = Responsive.getFontSize(scene, 16);
        const nameText = scene.add.text(-width / 2 + 20, 0, item.label, {
            fontSize: nameFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${nameFontSize} Arial`
        });
        nameText.setOrigin(0, 0.5);
        cardContainer.add(nameText);
        
        // 수치 텍스트 (오른쪽)
        const valueFontSize = Responsive.getFontSize(scene, 18);
        const valueText = scene.add.text(width / 2 - 20, 0, item.getDisplayValue(), {
            fontSize: valueFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${valueFontSize} Arial`
        });
        valueText.setOrigin(1, 0.5);
        cardContainer.add(valueText);
        
        return cardContainer;
    },
    
    // 스크롤 기능 설정
    setupScroll(
        scene: Phaser.Scene,
        state: StatsDetailPopupState,
        scrollAreaHeight: number,
        scrollAreaStartY: number,
        totalCardsHeight: number
    ): void {
        if (!state.scrollArea || !state.scrollContainer || !state.popupContainer) return;

        // 최소/최대 스크롤 위치 계산
        const minScrollY = scrollAreaStartY;
        const maxScrollY = scrollAreaStartY - (totalCardsHeight - scrollAreaHeight);
        
        state.isScrolling = false;
        state.scrollStartY = 0;
        state.scrollStartContainerY = scrollAreaStartY;

        // 스크롤 시작
        state.scrollArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            state.isScrolling = true;
            const popupWorldY = state.popupContainer!.y;
            state.scrollStartY = pointer.y - popupWorldY;
            state.scrollStartContainerY = state.scrollContainer!.y;
        });

        // 스크롤 중
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!state.isScrolling || !state.scrollContainer || !state.popupContainer) return;
            if (!pointer.isDown) {
                state.isScrolling = false;
                return;
            }

            const popupWorldY = state.popupContainer.y;
            const currentY = pointer.y - popupWorldY;
            const deltaY = currentY - state.scrollStartY;
            const newY = state.scrollStartContainerY + deltaY;
            
            const clampedY = Math.max(maxScrollY, Math.min(minScrollY, newY));
            state.scrollContainer.y = clampedY;
        });

        // 스크롤 종료
        scene.input.on('pointerup', () => {
            state.isScrolling = false;
        });
    },
    
    // 팝업 숨김
    hide(
        scene: Phaser.Scene,
        state: StatsDetailPopupState
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
        
        // 카드들 정리
        state.statCards.forEach(card => {
            if (card && card.active) {
                card.destroy();
            }
        });
        state.statCards = [];
        
        if (state.scrollContainer && state.scrollContainer.active) {
            state.scrollContainer.destroy();
            state.scrollContainer = null;
        }
        
        if (state.scrollArea && state.scrollArea.active) {
            state.scrollArea.destroy();
            state.scrollArea = null;
        }
        
        if (state.closeButton) {
            state.closeButton = null;
        }
        
        state.isOpen = false;
    }
};
