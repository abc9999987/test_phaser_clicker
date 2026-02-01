// 보옥 데이터 관리
import { GameStateCore } from './GameStateCore';
import { GemConfig } from '../../config/gemConfig';

export const GemManager = {
    // 보옥 레벨 가져오기
    getGemLevel(): number {
        return GameStateCore.gemLevel || 0;
    },
    
    // 보옥 레벨 설정
    setGemLevel(level: number): void {
        GameStateCore.gemLevel = level;
        GameStateCore.debouncedSave();
    },
    
    // 업그레이드 비용 계산 (레벨당 3배씩 증가)
    getUpgradeCost(level: number): number {
        return GemConfig.upgradeCost.initialCost * Math.pow(GemConfig.upgradeCost.multiplier, level);
    },
    
    // 현재 레벨의 업그레이드 비용 가져오기
    getCurrentUpgradeCost(): number {
        const currentLevel = this.getGemLevel();
        return this.getUpgradeCost(currentLevel);
    },
    
    // 업그레이드 가능 여부 확인
    canUpgradeGem(): boolean {
        const cost = this.getCurrentUpgradeCost();
        const currentGems = this.getGems();
        return currentGems >= cost;
    },
    
    // 보옥 레벨 증가 (비용 차감 포함)
    upgradeGem(): boolean {
        const cost = this.getCurrentUpgradeCost();
        if (!this.subtractGems(cost)) {
            return false; // 젬이 부족함
        }
        GameStateCore.gemLevel = (GameStateCore.gemLevel || 0) + 1;
        GameStateCore.debouncedSave();
        return true; // 성공
    },
    
    // 현재 보옥 스탯 가져오기 (레벨에 따른 계산: 레벨당 3배씩 증가)
    getAttackPower(): number {
        const level = this.getGemLevel();
        if (level === 0) return 0;
        // 공식: initialValue × 3^(level - 1)
        return GemConfig.upgradeIncrements.attackPower * Math.pow(3, level - 1);
    },
    
    getAttackPowerPercent(): number {
        const level = this.getGemLevel();
        if (level === 0) return 0;
        // 공식: initialValue × 3^(level - 1)
        return GemConfig.upgradeIncrements.attackPowerPercent * Math.pow(3, level - 1);
    },
    
    getCritDamage(): number {
        const level = this.getGemLevel();
        if (level === 0) return 0;
        // 공식: initialValue × 3^(level - 1)
        return GemConfig.upgradeIncrements.critDamage * Math.pow(3, level - 1);
    },
    
    // 다음 레벨 업그레이드 시 증가할 스탯 미리보기 (레벨당 3배씩 증가)
    getNextLevelAttackPower(): number {
        const currentLevel = this.getGemLevel();
        const nextLevel = currentLevel + 1;
        if (nextLevel === 0) return 0;
        // 공식: initialValue × 3^(nextLevel - 1)
        return GemConfig.upgradeIncrements.attackPower * Math.pow(3, nextLevel - 1);
    },
    
    getNextLevelAttackPowerPercent(): number {
        const currentLevel = this.getGemLevel();
        const nextLevel = currentLevel + 1;
        if (nextLevel === 0) return 0;
        // 공식: initialValue × 3^(nextLevel - 1)
        return GemConfig.upgradeIncrements.attackPowerPercent * Math.pow(3, nextLevel - 1);
    },
    
    getNextLevelCritDamage(): number {
        const currentLevel = this.getGemLevel();
        const nextLevel = currentLevel + 1;
        if (nextLevel === 0) return 0;
        // 공식: initialValue × 3^(nextLevel - 1)
        return GemConfig.upgradeIncrements.critDamage * Math.pow(3, nextLevel - 1);
    },
    
    // 젬 재화 관리
    getGems(): number {
        return GameStateCore.gems || 0;
    },
    
    setGems(amount: number): void {
        GameStateCore.gems = amount;
        GameStateCore.debouncedSave();
    },
    
    addGems(amount: number): void {
        GameStateCore.gems = (GameStateCore.gems || 0) + amount;
        GameStateCore.debouncedSave();
    },
    
    subtractGems(amount: number): boolean {
        const currentGems = GameStateCore.gems || 0;
        if (currentGems < amount) {
            return false; // 젬이 부족함
        }
        GameStateCore.gems = currentGems - amount;
        GameStateCore.debouncedSave();
        return true; // 성공
    }
};
