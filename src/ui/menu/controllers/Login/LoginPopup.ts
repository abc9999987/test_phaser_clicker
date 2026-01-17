// 로그인 팝업 UI
import Phaser from 'phaser';
import { LoginPopupComponents } from './components/LoginPopupComponents';
import { LoginInputField } from './components/LoginInputField';

// 로그인 팝업 상태 인터페이스
export interface LoginPopupState {
    popupOverlay: Phaser.GameObjects.Rectangle | null;
    popupContainer: Phaser.GameObjects.Container | null;
    isOpen: boolean;
    idInput: HTMLInputElement | null;
    passwordInput: HTMLInputElement | null;
}

export const LoginPopup = {
    // 로그인 팝업 표시
    showLoginPopup(
        scene: Phaser.Scene,
        state: LoginPopupState,
        onLogin: (id: string, password: string) => void,
        onCancel: () => void
    ): void {
        if (state.isOpen) return;
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // 오버레이 생성
        const overlay = LoginPopupComponents.createOverlay(scene, gameWidth, gameHeight);
        state.popupOverlay = overlay;
        
        // 팝업 컨테이너
        const popupWidth = gameWidth * 0.5;
        const popupHeight = gameHeight * 0.5;
        const popupX = gameWidth / 2;
        const popupY = gameHeight / 2;
        
        const popupContainer = scene.add.container(popupX, popupY);
        popupContainer.setDepth(120);
        
        // 팝업 배경
        const popupBg = LoginPopupComponents.createPopupBackground(scene, popupWidth, popupHeight);
        popupContainer.add(popupBg);
        
        // 닫기 버튼
        const closeButton = LoginPopupComponents.createCloseButton(
            scene,
            popupWidth,
            popupHeight,
            () => {
                LoginPopup.hideLoginPopup(scene, state, onCancel);
            }
        );
        popupContainer.add(closeButton);
        
        // 타이틀
        const titleText = LoginPopupComponents.createTitle(scene, popupHeight, '로그인');
        popupContainer.add(titleText);
        
        // 입력 필드 설정
        const inputWidth = popupWidth * 0.7;
        const inputHeight = popupHeight * 0.08;
        const inputSpacing = popupHeight * 0.05;
        const titleY = -popupHeight / 2 + popupHeight * 0.15;
        const idInputY = titleY + popupHeight * 0.15;
        
        // ID 입력 필드
        const idField = LoginPopupComponents.createInputField(
            scene,
            popupContainer,
            {
                type: 'text',
                placeholder: 'ID를 입력하세요',
                label: 'ID:'
            },
            popupX,
            popupY,
            idInputY,
            inputWidth,
            inputHeight,
            inputSpacing,
            gameWidth,
            gameHeight
        );
        state.idInput = idField.htmlInput;
        
        // Password 입력 필드
        const passwordInputY = idInputY + inputHeight + inputSpacing * 1.5;
        const passwordField = LoginPopupComponents.createInputField(
            scene,
            popupContainer,
            {
                type: 'password',
                placeholder: 'Password를 입력하세요',
                label: 'Password:'
            },
            popupX,
            popupY,
            passwordInputY,
            inputWidth,
            inputHeight,
            inputSpacing,
            gameWidth,
            gameHeight
        );
        state.passwordInput = passwordField.htmlInput;
        
        // 액션 버튼
        const buttonWidth = popupWidth * 0.25;
        const buttonHeight = popupHeight * 0.1;
        const buttonSpacing = popupWidth * 0.05;
        const buttonY = passwordInputY + inputHeight + inputSpacing * 1.5;
        
        const { loginButton, cancelButton } = LoginPopupComponents.createActionButtons(
            scene,
            buttonY,
            buttonWidth,
            buttonHeight,
            buttonSpacing,
            () => {
                const id = state.idInput?.value || '';
                const password = state.passwordInput?.value || '';
                LoginPopup.hideLoginPopup(scene, state, () => {});
                onLogin(id, password);
            },
            () => {
                LoginPopup.hideLoginPopup(scene, state, onCancel);
            }
        );
        popupContainer.add(loginButton);
        popupContainer.add(cancelButton);
        
        state.popupContainer = popupContainer;
        state.isOpen = true;
        
        // 애니메이션
        LoginPopupComponents.playShowAnimation(scene, popupContainer, overlay);
        
        // 포커스 설정
        setTimeout(() => {
            if (state.idInput) {
                state.idInput.focus();
            }
        }, 250);
    },
    
    // 로그인 팝업 숨김
    hideLoginPopup(
        scene: Phaser.Scene,
        state: LoginPopupState,
        onCancel: () => void
    ): void {
        if (!state.isOpen) return;
        
        // HTML Input 요소 제거
        LoginInputField.removeHTMLInput(state.idInput);
        LoginInputField.removeHTMLInput(state.passwordInput);
        state.idInput = null;
        state.passwordInput = null;
        
        // 애니메이션
        LoginPopupComponents.playHideAnimation(
            scene,
            state.popupContainer,
            state.popupOverlay,
            () => {
                state.popupContainer = null;
                state.popupOverlay = null;
                state.isOpen = false;
                onCancel();
            }
        );
    }
};
