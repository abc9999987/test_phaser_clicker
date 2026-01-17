// 로그인 컨트롤러
import Phaser from 'phaser';
import { LoginPopup, LoginPopupState } from './LoginPopup';
import { ApiClient, ApiError } from '../../../../api/ApiClient';
import { StorageKeys } from '../../../../config/StorageKeys';
import { SaveData } from '../../../../managers/state/GameStateCore';
import { GameStateCore } from '../../../../managers/state/GameStateCore';
import { LoginInputField } from './components/LoginInputField';
import { ICommonResponse } from '../common/ICommonResponse';

// 로그인 API 응답 인터페이스
interface LoginResponse extends ICommonResponse {
    data?: {
        playData: SaveData;
        uuid: string;
    };
    token?: string;
    user?: {
        id: string;
        name?: string;
    };
}

// 로그인 API 요청 인터페이스
interface LoginRequest {
    userId: string;
    password: string;
}

// 로그인 팝업 상태 (싱글톤)
const loginPopupState: LoginPopupState = {
    popupOverlay: null,
    popupContainer: null,
    isOpen: false,
    idInput: null,
    passwordInput: null
};

// API 엔드포인트 URL (환경에 따라 변경 가능)
const LOGIN_API_URL = '/login'; // TODO: 실제 API URL로 변경

export const LoginController = {
    // 로그인 버튼 클릭 시 동작
    handleLogin(scene: Phaser.Scene): void {
        LoginPopup.showLoginPopup(
            scene,
            loginPopupState,
            async (id: string, password: string) => {
                // 로그인 API 호출
                await LoginController.performLogin(scene, id, password);
            },
            () => {
                // 취소 처리
                console.log('Login cancelled');
            }
        );
    },
    
    // 로그인 API 호출
    async performLogin(scene: Phaser.Scene, id: string, password: string): Promise<void> {
        try {
            const requestData: LoginRequest = {
                userId: id,
                password: password
            };
            
            const response = await ApiClient.post<LoginResponse>(
                LOGIN_API_URL,
                requestData,
                {
                    timeout: 30000, // 30초 타임아웃
                    scene: scene // 로딩 인디케이터 표시를 위한 scene 전달
                }
            );
            
            if (response.status === 200) {
                // 토큰 저장
                if (response.token) {
                    localStorage.setItem(StorageKeys.AUTH_TOKEN, response.token);
                }
                
                // 서버에서 받은 게임 데이터로 GameState 업데이트
                if (response.data?.playData) {
                    try {
                        if (response.data?.uuid) {
                            response.data.playData.uuid = response.data.uuid;
                        }

                        GameStateCore.updateFromLoginSaveData(response.data.playData);
                        // 로컬스토리지에 저장
                        GameStateCore.save();
                    } catch (updateError) {
                        console.error('Failed to update game state from server data:', updateError);
                    }
                }
                
                // 로그인 팝업 닫기 (애니메이션 없이 즉시 닫기)
                LoginInputField.removeHTMLInput(loginPopupState.idInput);
                LoginInputField.removeHTMLInput(loginPopupState.passwordInput);
                
                if (loginPopupState.popupContainer) {
                    loginPopupState.popupContainer.destroy();
                    loginPopupState.popupContainer = null;
                }
                if (loginPopupState.popupOverlay) {
                    loginPopupState.popupOverlay.destroy();
                    loginPopupState.popupOverlay = null;
                }
                loginPopupState.idInput = null;
                loginPopupState.passwordInput = null;
                loginPopupState.isOpen = false;
                
                // 씬 재시작
                if (scene.scene.key === 'GameScene') {
                    scene.scene.restart();
                } else {
                    scene.scene.start('GameScene');
                }
            } else {
                console.error('Login failed:', response.message);
                // TODO: 실패 메시지 표시
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof ApiError) {
                // TODO: 에러 메시지 표시 (팝업 등)
                console.error(`API Error: ${error.message} (Status: ${error.status})`);
            } else {
                console.error('Unknown error:', error);
            }
        }
    }
};
