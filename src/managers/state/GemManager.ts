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
    
    // 보옥 레벨 증가
    upgradeGem(): void {
        GameStateCore.gemLevel = (GameStateCore.gemLevel || 0) + 1;
        GameStateCore.debouncedSave();
    },
    
    // 현재 보옥 스탯 가져오기 (레벨에 따른 계산)
    getAttackPower(): number {
        const level = this.getGemLevel();
        return GemConfig.initialStats.attackPower + (level * GemConfig.upgradeIncrements.attackPower);
    },
    
    getAttackPowerPercent(): number {
        const level = this.getGemLevel();
        return GemConfig.initialStats.attackPowerPercent + (level * GemConfig.upgradeIncrements.attackPowerPercent);
    },
    
    getCritDamage(): number {
        const level = this.getGemLevel();
        return GemConfig.initialStats.critDamage + (level * GemConfig.upgradeIncrements.critDamage);
    },
    
    // 다음 레벨 업그레이드 시 증가할 스탯 미리보기
    getNextLevelAttackPower(): number {
        const currentLevel = this.getGemLevel();
        return GemConfig.initialStats.attackPower + ((currentLevel + 1) * GemConfig.upgradeIncrements.attackPower);
    },
    
    getNextLevelAttackPowerPercent(): number {
        const currentLevel = this.getGemLevel();
        return GemConfig.initialStats.attackPowerPercent + ((currentLevel + 1) * GemConfig.upgradeIncrements.attackPowerPercent);
    },
    
    getNextLevelCritDamage(): number {
        const currentLevel = this.getGemLevel();
        return GemConfig.initialStats.critDamage + ((currentLevel + 1) * GemConfig.upgradeIncrements.critDamage);
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
