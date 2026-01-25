// 저장 컨트롤러
import Phaser from 'phaser';
import { ApiClient, ApiError } from '../../../../api/ApiClient';
import { GameStateCore, SaveData } from '../../../../managers/state/GameStateCore';
import { StorageKeys } from '../../../../config/StorageKeys';
import { SaveSuccessPopup } from './SaveSuccessPopup';
import { ICommonResponse } from '../common/ICommonResponse';
import { LoginController } from '../Login/LoginController';

// 저장 API 응답 인터페이스
interface SaveResponse extends ICommonResponse {
    
}

// 저장 API 요청 인터페이스
interface SaveRequest {
    uuid: string | null;
    sid: string | null;
    playData: SaveData;
    forceSave?: boolean;
}

// API 엔드포인트 URL (환경에 따라 변경 가능)
const SAVE_API_URL = '/save'; // TODO: 실제 API URL로 변경

// 저장 성공 팝업 상태 (싱글톤)
const saveSuccessPopupState = {
    popupOverlay: null as Phaser.GameObjects.Rectangle | null,
    popupContainer: null as Phaser.GameObjects.Container | null,
    closeButton: null as Phaser.GameObjects.Container | null,
    isOpen: false
};

// 중복 요청 방지를 위한 플래그
let isSaveInProgress = false;

export const SaveController = {
    // 저장 버튼 클릭 시 동작
    handleSave(scene: Phaser.Scene): void {
        SaveController.performSave(scene);
    },
    
    // 저장 API 호출
    async performSave(scene: Phaser.Scene, showSuccessPopup: boolean = true): Promise<void> {
        // 이미 요청이 진행 중이면 무시
        if (isSaveInProgress) {
            console.log('Save request already in progress, ignoring duplicate request');
            return;
        }
        
        isSaveInProgress = true;
        
        try {
            // GameStateCore에서 현재 게임 상태 데이터 가져오기
            const playData = GameStateCore.getSaveData();
            const saveTime = playData.saveTime;
            
            const requestData: SaveRequest = {
                uuid: GameStateCore.uuid ?? null,
                sid: GameStateCore.sid ?? null,
                playData
            };

            if (!requestData.sid) {
                LoginController.handleLogin(scene, false, true);
                return;
            }
            
            // 토큰이 있으면 헤더에 추가
            const token = localStorage.getItem(StorageKeys.AUTH_TOKEN);
            const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
            
            const response = await ApiClient.post<SaveResponse>(
                SAVE_API_URL,
                requestData,
                {
                    timeout: 10000, // 10초 타임아웃
                    headers: headers,
                    scene: scene // 로딩 인디케이터 표시를 위한 scene 전달
                }
            );
            
            if (response.status === 200) {
                // 저장 성공 팝업 표시
                if (showSuccessPopup) {
                    SaveSuccessPopup.show(scene, saveSuccessPopupState, saveTime, 'Data를 저장했습니다.');
                }
            } else if (response.status === 401 && response.message === 'sessionRefreshFailed') {
                LoginController.handleLogin(scene, false, true);
                return;
            } else {
                console.error('Save failed:', requestData.uuid, response.message);
                SaveSuccessPopup.show(scene, saveSuccessPopupState, saveTime, 'Data를 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('Save error:', error);
            if (error instanceof ApiError) {
                // TODO: 에러 메시지 표시 (팝업 등)
                console.error(`API Error: ${error.message} (Status: ${error.status})`);
            } else {
                console.error('Unknown error:', error);
            }
        } finally {
            // 요청 완료 후 플래그 해제
            isSaveInProgress = false;
        }
    }
};
