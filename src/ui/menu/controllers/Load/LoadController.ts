import { ApiClient, ApiError } from "../../../../api/ApiClient";
import { GameStateCore, SaveData } from "../../../../managers/state/GameStateCore";
import { ICommonResponse } from "../common/ICommonResponse";
import { LoginController } from "../Login/LoginController";

interface LoadRequest {
    uuid: string;
    sid: string;
}

// 로그인 API 응답 인터페이스
interface LoadResponse extends ICommonResponse {
    data?: {
        playData: SaveData;
        uuid: string;
        sid: string;
    };
}

// API 엔드포인트 URL (환경에 따라 변경 가능)
const LOAD_API_URL = '/load';

// 중복 요청 방지를 위한 플래그
let isLoadInProgress = false;

export const LoadController = {
    // 로그인 API 호출
    async load(scene: Phaser.Scene, uuid: string, sid: string, skipRestart: boolean = false): Promise<void> {
        // 이미 요청이 진행 중이면 무시
        if (isLoadInProgress) {
            console.log('Load request already in progress, ignoring duplicate request');
            return;
        }
        
        isLoadInProgress = true;
        
        try {
            const requestData: LoadRequest = {
                uuid,
                sid,
            };

            console.log('requestData: ', requestData);
            if (!requestData.sid || requestData.sid === '') {
                LoginController.handleLogin(scene, false, true);
                // skipRestart가 true면 Promise를 reject하여 GameScene에서 catch 처리
                if (skipRestart) {
                    throw new Error('sid is required');
                }
                return;
            }
            
            const response = await ApiClient.post<LoadResponse>(
                LOAD_API_URL,
                requestData,
                {
                    timeout: 30000, // 30초 타임아웃
                    scene: scene // 로딩 인디케이터 표시를 위한 scene 전달
                }
            );
            
            if (response.status === 200) {
                // 서버에서 받은 게임 데이터로 GameState 업데이트
                if (response.data?.playData) {
                    try {
                        if (response.data?.uuid) {
                            response.data.playData.uuid = response.data.uuid;
                        }

                        if (response.data?.sid) {
                            response.data.playData.sid = response.data.sid;
                        }

                        GameStateCore.updateFromLoginSaveData(response.data.playData);
                        // 로컬스토리지에 저장
                        GameStateCore.save();
                    } catch (updateError) {
                        console.error('Failed to update game state from server data:', updateError);
                        LoginController.handleLogin(scene, false, true);
                        return;
                    }
                }
                
                // skipRestart가 true면 씬 재시작하지 않음 (게임 시작 시 한 번만 실행하기 위함)
                if (!skipRestart) {
                    // 씬 재시작
                    if (scene.scene.key === 'GameScene') {
                        scene.scene.restart();
                    } else {
                        scene.scene.start('GameScene');
                    }
                }
            } else if (response.status === 401 && response.message === 'sessionRefreshFailed') {
                LoginController.handleLogin(scene, false, true);
                // skipRestart가 true면 Promise를 reject하여 GameScene에서 catch 처리
                if (skipRestart) {
                    throw new Error('sessionRefreshFailed');
                }
                return;
            } else {
                console.error('Login failed:', response.message);
                // TODO: 실패 메시지 표시
                // skipRestart가 true면 Promise를 reject하여 GameScene에서 catch 처리
                if (skipRestart) {
                    throw new Error(response.message || 'Load failed');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof ApiError) {
                // TODO: 에러 메시지 표시 (팝업 등)
                console.error(`API Error: ${error.message} (Status: ${error.status})`);
            } else {
                console.error('Unknown error:', error);
            }
            LoginController.handleLogin(scene, false, true);
            // 에러 발생 시에도 플래그 해제
            throw error; // 에러를 다시 throw하여 호출자가 처리할 수 있도록 함
        } finally {
            // 요청 완료 후 플래그 해제
            isLoadInProgress = false;
        }
    }
}