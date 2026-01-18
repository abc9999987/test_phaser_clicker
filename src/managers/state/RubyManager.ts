// 루비 재화 관리
import { GameStateCore } from './GameStateCore';

export const RubyManager = {
    // 루비 추가
    addRubies(amount: number): void {
        GameStateCore.rubies += amount;
        // 자동 저장 (디바운싱 - 마지막 변경 후 1초 뒤에 저장)
        GameStateCore.debouncedSave();
    },
    
    // 루비 차감
    spendRubies(amount: number): boolean {
        if (GameStateCore.rubies >= amount) {
            GameStateCore.rubies -= amount;
            GameStateCore.save(); // 자동 저장
            return true;
        }
        return false;
    }
};
