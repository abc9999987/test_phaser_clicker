// 저장 컨트롤러
import Phaser from 'phaser';
import { ApiClient, ApiError } from '../../../../api/ApiClient';
import { GameState } from '../../../../managers/GameState';
import { SaveData } from '../../../../managers/state/GameStateCore';
import { StorageKeys } from '../../../../config/StorageKeys';
import { SaveSuccessPopup } from './SaveSuccessPopup';

// 저장 API 응답 인터페이스
interface SaveResponse {
    success: boolean;
    message?: string;
    saveId?: string;
}

// 저장 API 요청 인터페이스
interface SaveRequest {
    gameData: SaveData;
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

export const SaveController = {
    // 저장 버튼 클릭 시 동작
    handleSave(scene: Phaser.Scene): void {
        SaveController.performSave(scene);
    },
    
    // 저장 API 호출
    async performSave(scene: Phaser.Scene): Promise<void> {
        try {
            // localStorage에서 직접 모든 게임 데이터 가져오기
            const savedDataString = localStorage.getItem(StorageKeys.GAME_SAVE);
            const saveTime = Date.now();
            
            let gameData: SaveData;
            
            if (savedDataString) {
                // localStorage에 저장된 데이터가 있으면 파싱
                try {
                    gameData = JSON.parse(savedDataString) as SaveData;
                    // saveTime은 현재 시간으로 업데이트
                    gameData.saveTime = saveTime;
                } catch (parseError) {
                    console.error('Failed to parse saved data, using current state:', parseError);
                    // 파싱 실패 시 현재 GameState에서 수집
                    gameData = SaveController.collectCurrentGameData();
                }
            } else {
                // localStorage에 데이터가 없으면 현재 GameState에서 수집
                gameData = SaveController.collectCurrentGameData();
            }
            
            const requestData: SaveRequest = {
                gameData: gameData
            };
            
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
            
            if (response.success) {
                console.log('Save successful:', response);
                // 저장 성공 팝업 표시
                SaveSuccessPopup.show(scene, saveSuccessPopupState, saveTime);
            } else {
                console.error('Save failed:', response.message);
                // TODO: 실패 메시지 표시
            }
        } catch (error) {
            console.error('Save error:', error);
            if (error instanceof ApiError) {
                // TODO: 에러 메시지 표시 (팝업 등)
                console.error(`API Error: ${error.message} (Status: ${error.status})`);
            } else {
                console.error('Unknown error:', error);
            }
        }
    },
    
    // 현재 GameState에서 모든 데이터 수집
    collectCurrentGameData(): SaveData {
        return {
            coins: GameState.coins,
            attackPower: GameState.attackPower,
            attackSpeed: GameState.attackSpeed,
            critChance: GameState.critChance,
            critDamage: GameState.critDamage,
            clickCount: GameState.clickCount,
            chapter: GameState.chapter,
            stage: GameState.stage,
            killsInCurrentStage: GameState.killsInCurrentStage,
            saveTime: Date.now(),
            sp: GameState.sp,
            learnedSkills: GameState.learnedSkills,
            spPurchaseCount: GameState.spPurchaseCount,
            skillAutoUse: GameState.skillAutoUse,
            dungeonLevels: GameState.dungeonLevels,
            skillLevels: GameState.skillLevels
        };
    }
};
