// SP 관리
import { GameStateCore } from './GameStateCore';
import { CoinManager } from './CoinManager';

export const SpManager = {
    // SP 추가
    addSp(amount: number): void {
        GameStateCore.sp += amount;
        GameStateCore.debouncedSave();
    },
    
    // SP 차감
    spendSp(amount: number): boolean {
        if (GameStateCore.sp >= amount) {
            GameStateCore.sp -= amount;
            GameStateCore.save();
            return true;
        }
        return false;
    },
    
    // SP 구매 비용 계산 (초기 10만원, 10배씩 증가)
    getSpPurchaseCost(): number {
        return Math.floor(100000 * Math.pow(10, GameStateCore.spPurchaseCount));
    },
    
    // SP 구매 (최대 10개까지만)
    purchaseSp(): boolean {
        // 최대 10개까지만 구매 가능
        if (GameStateCore.spPurchaseCount >= 10) {
            return false;
        }
        
        const cost = this.getSpPurchaseCost();
        if (CoinManager.spendCoins(cost)) {
            GameStateCore.spPurchaseCount++;
            GameStateCore.sp++;
            GameStateCore.save();
            return true;
        }
        return false;
    }
};
