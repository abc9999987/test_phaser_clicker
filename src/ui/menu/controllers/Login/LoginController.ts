// 로그인 컨트롤러
import Phaser from 'phaser';
import { LoginPopup, LoginPopupState } from './LoginPopup';
import { ApiClient, ApiError } from '../../../../api/ApiClient';
import { StorageKeys } from '../../../../config/StorageKeys';

// 로그인 API 응답 인터페이스
interface LoginResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: {
        id: string;
        name?: string;
    };
}

// 로그인 API 요청 인터페이스
interface LoginRequest {
    id: string;
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
const LOGIN_API_URL = 'https://api.example.com/auth/login'; // TODO: 실제 API URL로 변경

export const LoginController = {
    // 로그인 버튼 클릭 시 동작
    handleLogin(scene: Phaser.Scene): void {
        LoginPopup.showLoginPopup(
            scene,
            loginPopupState,
            async (id: string, password: string) => {
                // 로그인 API 호출
                await LoginController.performLogin(id, password);
            },
            () => {
                // 취소 처리
                console.log('Login cancelled');
            }
        );
    },
    
    // 로그인 API 호출
    async performLogin(id: string, password: string): Promise<void> {
        try {
            const requestData: LoginRequest = {
                id: id,
                password: password
            };
            
            const response = await ApiClient.post<LoginResponse>(
                LOGIN_API_URL,
                requestData,
                {
                    timeout: 10000 // 10초 타임아웃
                }
            );
            
            if (response.success) {
                console.log('Login successful:', response);
                // TODO: 토큰 저장 (localStorage 등)
                if (response.token) {
                    localStorage.setItem(StorageKeys.AUTH_TOKEN, response.token);
                }
                // TODO: 성공 처리 (UI 업데이트 등)
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
