// 회원가입 컨트롤러
import Phaser from 'phaser';
import { SignUpPopup, SignUpPopupState } from './SignUpPopup';
import { ApiClient, ApiError } from '../../../../api/ApiClient';
import { LoginInputField } from '../Login/components/LoginInputField';
import { GameStateCore, SaveData } from '../../../../managers/state/GameStateCore';

// 회원가입 API 응답 인터페이스
interface SignUpResponse {
    status?: number;
    message?: string;
    data?: {
        uuid: string;
    };
}

// 회원가입 API 요청 인터페이스
interface SignUpRequest {
    uuid: string | null;
    userId: string;
    password: string;
    playData: SaveData;
}

// 회원가입 팝업 상태 (싱글톤)
const signUpPopupState: SignUpPopupState = {
    popupOverlay: null,
    popupContainer: null,
    isOpen: false,
    idInput: null,
    passwordInput: null
};

// API 엔드포인트 URL (환경에 따라 변경 가능)
const SIGNUP_API_URL = '/signup'; // TODO: 실제 API URL로 변경

export const SignUpController = {
    // 회원가입 버튼 클릭 시 동작
    handleSignUp(scene: Phaser.Scene): void {
        SignUpPopup.showSignUpPopup(
            scene,
            signUpPopupState,
            async (id: string, password: string) => {
                // 회원가입 API 호출
                await SignUpController.performSignUp(scene, id, password);
            },
            () => {
                // 취소 처리
                console.log('SignUp cancelled');
            }
        );
    },
    
    // 회원가입 API 호출
    async performSignUp(scene: Phaser.Scene, id: string, password: string): Promise<void> {
        try {
            const requestData: SignUpRequest = {
                uuid: GameStateCore.uuid ?? null,
                userId: id,
                password: password,
                playData: GameStateCore.getSaveData(),
            };
            
            const response = await ApiClient.post<SignUpResponse>(
                SIGNUP_API_URL,
                requestData,
                {
                    timeout: 30000, // 30초 타임아웃
                    scene: scene // 로딩 인디케이터 표시를 위한 scene 전달
                }
            );
            
            if (response.status === 200) {
                // 회원가입 성공시 uuid를 저장시킴
                if (response.data?.uuid) {
                    GameStateCore.uuid = response.data.uuid;
                    GameStateCore.save();
                }
                // 팝업 닫기
                LoginInputField.removeHTMLInput(signUpPopupState.idInput);
                LoginInputField.removeHTMLInput(signUpPopupState.passwordInput);
                
                if (signUpPopupState.popupContainer) {
                    signUpPopupState.popupContainer.destroy();
                    signUpPopupState.popupContainer = null;
                }
                if (signUpPopupState.popupOverlay) {
                    signUpPopupState.popupOverlay.destroy();
                    signUpPopupState.popupOverlay = null;
                }
                signUpPopupState.idInput = null;
                signUpPopupState.passwordInput = null;
                signUpPopupState.isOpen = false;
                
                // TODO: 성공 메시지 표시
            } else {
                console.error('SignUp failed:', response.message);
                // TODO: 실패 메시지 표시
            }
        } catch (error) {
            console.error('SignUp error:', error);
            if (error instanceof ApiError) {
                // TODO: 에러 메시지 표시 (팝업 등)
                console.error(`API Error: ${error.message} (Status: ${error.status})`);
            } else {
                console.error('Unknown error:', error);
            }
        }
    }
};
