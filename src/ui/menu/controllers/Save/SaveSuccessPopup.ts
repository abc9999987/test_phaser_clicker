// 저장 성공 팝업
import Phaser from 'phaser';
import { Responsive } from '../../../../utils/Responsive';

// 저장 성공 팝업 상태
interface SaveSuccessPopupState {
    popupOverlay: Phaser.GameObjects.Rectangle | null;
    popupContainer: Phaser.GameObjects.Container | null;
    closeButton: Phaser.GameObjects.Container | null;
    isOpen: boolean;
}

// 날짜 포맷팅 함수 (YYYY-MM-DD HH:mm)
function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const SaveSuccessPopup = {
    // 저장 성공 팝업 표시
    show(
        scene: Phaser.Scene,
        state: SaveSuccessPopupState,
        saveTime: number
    ): void {
        if (state.isOpen) {
            return; // 이미 열려있으면 무시
        }
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // 오버레이 (반투명 배경)
        const overlay = scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x000000,
            0.7
        );
        overlay.setDepth(100);
        overlay.setInteractive();
        state.popupOverlay = overlay;
        
        // 팝업 컨테이너
        const popupContainer = scene.add.container(gameWidth / 2, gameHeight / 2);
        popupContainer.setDepth(101);
        state.popupContainer = popupContainer;
        
        // 팝업 배경
        const popupWidth = gameWidth * 0.6;
        const popupHeight = gameHeight * 0.3;
        const popupBg = scene.add.graphics();
        popupBg.fillStyle(0x2a2a2a, 1);
        popupBg.fillRoundedRect(
            -popupWidth / 2,
            -popupHeight / 2,
            popupWidth,
            popupHeight,
            15
        );
        popupBg.lineStyle(3, 0x4a9eff, 1);
        popupBg.strokeRoundedRect(
            -popupWidth / 2,
            -popupHeight / 2,
            popupWidth,
            popupHeight,
            15
        );
        popupContainer.add(popupBg);
        
        // 날짜 텍스트
        const dateText = formatDateTime(saveTime);
        const dateTextObj = scene.add.text(0, -popupHeight * 0.25, dateText, {
            fontSize: Responsive.getFontSize(scene, 20),
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        dateTextObj.setOrigin(0.5, 0.5);
        popupContainer.add(dateTextObj);
        
        // 메시지 텍스트
        const messageText = scene.add.text(0, 0, 'Data를 저장했습니다.', {
            fontSize: Responsive.getFontSize(scene, 24),
            color: '#4a9eff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        messageText.setOrigin(0.5, 0.5);
        popupContainer.add(messageText);
        
        // 닫기 버튼
        const closeButtonSize = popupWidth * 0.12;
        const closeButtonX = popupWidth / 2 - closeButtonSize * 0.6;
        const closeButtonY = -popupHeight / 2 + closeButtonSize * 0.6;
        
        const closeButtonContainer = scene.add.container(closeButtonX, closeButtonY);
        
        const closeButtonBg = scene.add.graphics();
        closeButtonBg.fillStyle(0x4a4a4a, 1);
        closeButtonBg.fillRoundedRect(
            -closeButtonSize / 2,
            -closeButtonSize / 2,
            closeButtonSize,
            closeButtonSize,
            5
        );
        closeButtonBg.lineStyle(2, 0xffffff, 1);
        closeButtonBg.strokeRoundedRect(
            -closeButtonSize / 2,
            -closeButtonSize / 2,
            closeButtonSize,
            closeButtonSize,
            5
        );
        closeButtonContainer.add(closeButtonBg);
        
        // X 아이콘
        const xLineWidth = closeButtonSize * 0.4;
        const xLine1 = scene.add.line(0, 0, -xLineWidth / 2, -xLineWidth / 2, xLineWidth / 2, xLineWidth / 2, 0xffffff, 1);
        xLine1.setLineWidth(3);
        closeButtonContainer.add(xLine1);
        
        const xLine2 = scene.add.line(0, 0, -xLineWidth / 2, xLineWidth / 2, xLineWidth / 2, -xLineWidth / 2, 0xffffff, 1);
        xLine2.setLineWidth(3);
        closeButtonContainer.add(xLine2);
        
        closeButtonContainer.setInteractive(
            new Phaser.Geom.Rectangle(-closeButtonSize / 2, -closeButtonSize / 2, closeButtonSize, closeButtonSize),
            Phaser.Geom.Rectangle.Contains
        );
        closeButtonContainer.on('pointerdown', () => {
            SaveSuccessPopup.hide(scene, state);
        });
        closeButtonContainer.on('pointerover', () => {
            closeButtonBg.clear();
            closeButtonBg.fillStyle(0x5a5a5a, 1);
            closeButtonBg.fillRoundedRect(
                -closeButtonSize / 2,
                -closeButtonSize / 2,
                closeButtonSize,
                closeButtonSize,
                5
            );
            closeButtonBg.lineStyle(2, 0xffffff, 1);
            closeButtonBg.strokeRoundedRect(
                -closeButtonSize / 2,
                -closeButtonSize / 2,
                closeButtonSize,
                closeButtonSize,
                5
            );
        });
        closeButtonContainer.on('pointerout', () => {
            closeButtonBg.clear();
            closeButtonBg.fillStyle(0x4a4a4a, 1);
            closeButtonBg.fillRoundedRect(
                -closeButtonSize / 2,
                -closeButtonSize / 2,
                closeButtonSize,
                closeButtonSize,
                5
            );
            closeButtonBg.lineStyle(2, 0xffffff, 1);
            closeButtonBg.strokeRoundedRect(
                -closeButtonSize / 2,
                -closeButtonSize / 2,
                closeButtonSize,
                closeButtonSize,
                5
            );
        });
        popupContainer.add(closeButtonContainer);
        state.closeButton = closeButtonContainer;
        
        // 페이드 인 애니메이션
        popupContainer.setAlpha(0);
        scene.tweens.add({
            targets: popupContainer,
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });
        
        state.isOpen = true;
    },
    
    // 저장 성공 팝업 숨기기
    hide(
        scene: Phaser.Scene,
        state: SaveSuccessPopupState
    ): void {
        if (!state.isOpen) {
            return;
        }
        
        // 페이드 아웃 애니메이션
        if (state.popupContainer) {
            scene.tweens.add({
                targets: state.popupContainer,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    if (state.popupOverlay) {
                        state.popupOverlay.destroy();
                        state.popupOverlay = null;
                    }
                    if (state.popupContainer) {
                        state.popupContainer.destroy();
                        state.popupContainer = null;
                    }
                    if (state.closeButton) {
                        state.closeButton = null;
                    }
                    state.isOpen = false;
                }
            });
        } else {
            if (state.popupOverlay) {
                state.popupOverlay.destroy();
                state.popupOverlay = null;
            }
            state.isOpen = false;
        }
    }
};
