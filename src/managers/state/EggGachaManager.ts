// 알 뽑기 데이터 관리
import { GameStateCore } from './GameStateCore';

export const EggGachaManager = {
    // 특정 id의 수량 가져오기
    getEggGachaCount(id: number): number {
        return GameStateCore.eggGachaCounts[id] || 0;
    },
    
    // 특정 id의 수량 증가
    incrementEggGachaCount(id: number): void {
        if (!GameStateCore.eggGachaCounts[id]) {
            GameStateCore.eggGachaCounts[id] = 0;
        }
        GameStateCore.eggGachaCounts[id]++;
        GameStateCore.debouncedSave();
    },
    
    // 특정 id의 수량 설정
    setEggGachaCount(id: number, count: number): void {
        GameStateCore.eggGachaCounts[id] = count;
        GameStateCore.debouncedSave();
    },
    
    // 모든 알 뽑기 데이터 가져오기
    getAllEggGachaCounts(): Record<number, number> {
        return { ...GameStateCore.eggGachaCounts };
    }
};
