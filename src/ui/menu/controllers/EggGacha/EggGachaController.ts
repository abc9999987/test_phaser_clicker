// 알 뽑기 컨트롤러
import Phaser from 'phaser';
import { ApiClient, ApiError } from '../../../../api/ApiClient';
import { GameStateCore } from '../../../../managers/state/GameStateCore';
import { GameState } from '../../../../managers/GameState';
import { SaveController } from '../Save/SaveController';
import { ICommonResponse } from '../common/ICommonResponse';
import { LoginController } from '../Login/LoginController';

// 알 뽑기 API 요청 인터페이스
interface EggGachaRequest {
    uuid: string | null;
}

// 알 뽑기 API 응답 인터페이스
interface EggGachaResponse extends ICommonResponse {
    data?: { id: number }[];
}

// API 엔드포인트 URL
const EGG_GACHA_API_URL = '/egg_gacha';

// 중복 요청 방지를 위한 플래그
let isEggGachaInProgress = false;

export const EggGachaController = {
    // 알 뽑기 실행
    async performEggGacha(
        scene: Phaser.Scene,
        meatCost: number
    ): Promise<{ id: number }[]> {
        // 이미 요청이 진행 중이면 무시
        if (isEggGachaInProgress) {
            console.log('Egg gacha request already in progress, ignoring duplicate request');
            throw new Error('알 뽑기가 이미 진행 중입니다.');
        }
        
        isEggGachaInProgress = true;
        
        // 트랜잭션: 실패 시 고기 복구를 위한 원래 값 저장
        const originalMeat = GameState.meat;
        
        try {
            // 1. 고기 잔액 확인
            if (GameState.meat < meatCost) {
                throw new Error(`고기가 부족합니다. (필요: ${meatCost}, 보유: ${GameState.meat})`);
            }
            
            // 2. 고기 차감
            GameState.meat -= meatCost;
            
            // 3. 로컬스토리지 저장
            GameState.save();
            
            // 4. 서버 저장 (팝업 표시 없이)
            try {
                await SaveController.performSave(scene, false);
            } catch (saveError) {
                // 저장 실패 시 고기 복구
                GameState.meat = originalMeat;
                GameState.save();
                console.error('Failed to save before egg gacha:', saveError);
                throw new Error('저장에 실패했습니다. 다시 시도해주세요.');
            }
            
            // 5. 서버 뽑기 요청
            const uuid = GameStateCore.uuid;
            if (!uuid) {
                // uuid가 없으면 고기 복구
                GameState.meat = originalMeat;
                GameState.save();
                throw new Error('로그인이 필요합니다.');
            }
            
            const requestData: EggGachaRequest = {
                uuid: uuid
            };
            
            const response = await ApiClient.post<EggGachaResponse>(
                EGG_GACHA_API_URL,
                requestData,
                {
                    timeout: 30000, // 30초 타임아웃
                    scene: scene // 로딩 인디케이터 표시를 위한 scene 전달
                }
            );
            
            if (response.status === 200 && response.data) {
                // 성공: 보상 반환
                isEggGachaInProgress = false;
                return response.data;
            } else if (response.status === 401 && response.message === 'sessionRefreshFailed') {
                // 세션 만료: 고기 복구
                GameState.meat = originalMeat;
                GameState.save();
                // 로그인 팝업 표시 (에러는 던지지 않음 - 팝업이 표시되므로)
                LoginController.handleLogin(scene, false, true);
                // 세션 만료를 나타내는 특별한 에러 타입으로 throw (호출자가 alert를 표시하지 않도록)
                const sessionError = new Error('SESSION_EXPIRED');
                (sessionError as any).isSessionExpired = true;
                throw sessionError;
            } else {
                throw new Error(response.message || '알 뽑기에 실패했습니다.');
            }
        } catch (error) {
            console.error('Egg gacha error:', error);
            // 에러를 다시 throw하여 호출자가 처리할 수 있도록 함
            if (error instanceof ApiError) {
                // ApiError는 네트워크 에러일 수 있으므로 사용자 친화적인 메시지로 변환
                throw new Error(error.message || '서버 통신 중 오류가 발생했습니다.');
            } else if (error instanceof Error) {
                throw error;
            }
            throw new Error('알 수 없는 오류가 발생했습니다.');
        } finally {
            // 요청 완료 후 플래그 해제
            isEggGachaInProgress = false;
        }
    }
};
