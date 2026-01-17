// 코인 관리
import { GameStateCore } from './GameStateCore';

export const CoinManager = {
    // 코인 추가
    addCoins(amount: number): void {
        GameStateCore.coins += amount;
        // 자동 저장 (디바운싱 - 마지막 변경 후 1초 뒤에 저장)
        GameStateCore.debouncedSave();
    },
    
    // 코인 차감
    spendCoins(amount: number): boolean {
        if (GameStateCore.coins >= amount) {
            GameStateCore.coins -= amount;
            GameStateCore.save(); // 자동 저장
            return true;
        }
        return false;
    }
};
