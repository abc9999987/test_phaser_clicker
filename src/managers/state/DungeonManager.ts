// 던전 관리
import { GameStateCore } from './GameStateCore';

export const DungeonManager = {
    // 던전 단계 가져오기
    getDungeonLevel(dungeonId: string): number {
        return GameStateCore.dungeonLevels[dungeonId] || 1; // 기본값 1
    },
    
    // 던전 단계 증가
    incrementDungeonLevel(dungeonId: string): void {
        if (!GameStateCore.dungeonLevels[dungeonId]) {
            GameStateCore.dungeonLevels[dungeonId] = 1;
        }
        GameStateCore.dungeonLevels[dungeonId]++;
        GameStateCore.save(); // 자동 저장
    }
};
