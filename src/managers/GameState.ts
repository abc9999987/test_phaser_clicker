// 게임 상태 관리 (통합 매니저)
// 모든 서브 매니저를 통합하여 기존 인터페이스 유지

import { GameStateCore } from './state/GameStateCore';
import { CoinManager } from './state/CoinManager';
import { RubyManager } from './state/RubyManager';
import { StageManager } from './state/StageManager';
import { StatManager } from './state/StatManager';
import { SpManager } from './state/SpManager';
import { SkillStateManager } from './state/SkillStateManager';
import { BuffManager } from './state/BuffManager';
import { DungeonManager } from './state/DungeonManager';
import { ArtifactDungeonManager } from './state/ArtifactDungeonManager';
import { DungeonSweepManager } from './state/DungeonSweepManager';
import { EggGachaManager } from './state/EggGachaManager';
import { GemManager } from './state/GemManager';

// 기존 인터페이스 유지를 위한 통합 GameState
export const GameState = {
    // GameStateCore 속성들 직접 노출
    get coins() { return GameStateCore.coins; },
    set coins(value: number) { GameStateCore.coins = value; },
    get rubies() { return GameStateCore.rubies; },
    set rubies(value: number) { GameStateCore.rubies = value; },
    get meat() { return GameStateCore.meat; },
    set meat(value: number) { GameStateCore.meat = value; },
    get attackPower() { return GameStateCore.attackPower; },
    set attackPower(value: number) { GameStateCore.attackPower = value; },
    get attackSpeed() { return GameStateCore.attackSpeed; },
    set attackSpeed(value: number) { GameStateCore.attackSpeed = value; },
    get critChance() { return GameStateCore.critChance; },
    set critChance(value: number) { GameStateCore.critChance = value; },
    get critDamage() { return GameStateCore.critDamage; },
    set critDamage(value: number) { GameStateCore.critDamage = value; },
    get clickCount() { return GameStateCore.clickCount; },
    set clickCount(value: number) { GameStateCore.clickCount = value; },
    get chapter() { return GameStateCore.chapter; },
    set chapter(value: number) { GameStateCore.chapter = value; },
    get stage() { return GameStateCore.stage; },
    set stage(value: number) { GameStateCore.stage = value; },
    get killsInCurrentStage() { return GameStateCore.killsInCurrentStage; },
    set killsInCurrentStage(value: number) { GameStateCore.killsInCurrentStage = value; },
    get skipBossStage() { return GameStateCore.skipBossStage; },
    set skipBossStage(value: boolean) { GameStateCore.skipBossStage = value; },
    get sp() { return GameStateCore.sp; },
    set sp(value: number) { GameStateCore.sp = value; },
    get learnedSkills() { return GameStateCore.learnedSkills; },
    get spPurchaseCount() { return GameStateCore.spPurchaseCount; },
    get skillAutoUse() { return GameStateCore.skillAutoUse; },
    get activeBuffs() { return GameStateCore.activeBuffs; },
    get dungeonLevels() { return GameStateCore.dungeonLevels; },
    get skillLevels() { return GameStateCore.skillLevels; },
    
    // 저장/로드
    save: () => GameStateCore.save(),
    load: () => GameStateCore.load(),
    clear: () => GameStateCore.clear(),
    debouncedSave: () => GameStateCore.debouncedSave(),
    
    // 코인 관리
    addCoins: (amount: number) => CoinManager.addCoins(amount),
    spendCoins: (amount: number) => CoinManager.spendCoins(amount),
    
    // 루비 관리
    addRubies: (amount: number) => RubyManager.addRubies(amount),
    spendRubies: (amount: number) => RubyManager.spendRubies(amount),
    
    // 고기(meat) 관리
    getMeat: () => GameStateCore.meat,
    addMeat: (amount: number) => {
        if (amount <= 0) return;
        GameStateCore.meat += amount;
        GameStateCore.save();
    },
    
    // 스테이지 관리
    getStageString: () => StageManager.getStageString(),
    getTotalStageNumber: () => StageManager.getTotalStageNumber(),
    isBossStage: () => StageManager.isBossStage(),
    getEnemyHp: () => StageManager.getEnemyHp(),
    getEnemyGoldReward: () => StageManager.getEnemyGoldReward(),
    onEnemyDefeated: () => StageManager.onEnemyDefeated(),
    onBossTimerExpired: () => StageManager.onBossTimerExpired(),
    
    // 스탯 관리
    getAttackPowerValue: () => StatManager.getAttackPowerValue(),
    getBaseAttackPower: () => StatManager.getBaseAttackPower(),
    getAttackSpeedValue: () => StatManager.getAttackSpeedValue(),
    getCritChanceValue: () => StatManager.getCritChanceValue(),
    getCritDamageValue: () => StatManager.getCritDamageValue(),
    getGoldRateValue: () => StatManager.getGoldRateValue(),
    getAttackPowerUpgradeCost: () => StatManager.getAttackPowerUpgradeCost(),
    getAttackSpeedUpgradeCost: () => StatManager.getAttackSpeedUpgradeCost(),
    getCritChanceUpgradeCost: () => StatManager.getCritChanceUpgradeCost(),
    getCritDamageUpgradeCost: () => StatManager.getCritDamageUpgradeCost(),
    upgradeAttackPower: () => StatManager.upgradeAttackPower(),
    upgradeAttackSpeed: () => StatManager.upgradeAttackSpeed(),
    upgradeCritChance: () => StatManager.upgradeCritChance(),
    upgradeCritDamage: () => StatManager.upgradeCritDamage(),
    getClickUpgradeCost: () => StatManager.getClickUpgradeCost(),
    getAutoFireUpgradeCost: () => StatManager.getAutoFireUpgradeCost(),
    upgradeClick: () => StatManager.upgradeClick(),
    upgradeAutoFire: () => StatManager.upgradeAutoFire(),
    
    // SP 관리
    addSp: (amount: number) => SpManager.addSp(amount),
    spendSp: (amount: number) => SpManager.spendSp(amount),
    getSpPurchaseCost: () => SpManager.getSpPurchaseCost(),
    purchaseSp: () => SpManager.purchaseSp(),
    
    // 스킬 상태 관리
    isSkillLearned: (skillId: string) => SkillStateManager.isSkillLearned(skillId),
    learnSkill: (skillId: string) => SkillStateManager.learnSkill(skillId),
    getSkillLevel: (skillId: string) => SkillStateManager.getSkillLevel(skillId),
    upgradeSkill: (skillId: string) => SkillStateManager.upgradeSkill(skillId),
    getSkillPower: (skillId: string) => SkillStateManager.getSkillPower(skillId),
    toggleSkillAutoUse: (skillId: string) => SkillStateManager.toggleSkillAutoUse(skillId),
    isSkillAutoUse: (skillId: string) => SkillStateManager.isSkillAutoUse(skillId),
    
    // 버프 관리
    activateBuff: (skillId: string, startTime: number, duration: number, scene?: Phaser.Scene) => 
        BuffManager.activateBuff(skillId, startTime, duration, scene),
    isBuffActive: (skillId: string, currentTime: number) => BuffManager.isBuffActive(skillId, currentTime),
    removeBuff: (skillId: string) => BuffManager.removeBuff(skillId),
    getBuffMultiplier: (skillId: string, currentTime: number) => BuffManager.getBuffMultiplier(skillId, currentTime),
    getBuffRemainingDuration: (skillId: string, currentTime: number) => BuffManager.getBuffRemainingDuration(skillId, currentTime),
    hasPet: () => BuffManager.hasPet(),
    
    // 던전 관리
    getDungeonLevel: (dungeonId: string) => DungeonManager.getDungeonLevel(dungeonId),
    incrementDungeonLevel: (dungeonId: string) => DungeonManager.incrementDungeonLevel(dungeonId),
    
    // 유물 던전 관리
    getArtifactDungeonRemainingAttempts: () => ArtifactDungeonManager.getRemainingAttempts(),
    canEnterArtifactDungeon: () => ArtifactDungeonManager.canEnterArtifactDungeon(),
    canSweepArtifactDungeon: (dungeonLevel: number) => ArtifactDungeonManager.canSweepArtifactDungeon(dungeonLevel),
    useSweepAttempt: () => ArtifactDungeonManager.useSweepAttempt(),
    checkAndResetArtifactDungeonAttempts: () => ArtifactDungeonManager.checkAndResetDailyAttempts(),
    incrementArtifactDungeonSweepCount: () => ArtifactDungeonManager.incrementSweepCount(),
    getArtifactDungeonSweepCount: () => ArtifactDungeonManager.getSweepCount(),

    // 던전 공통 소탕 관리
    getDungeonRemainingSweepAttempts: (dungeonId: string, dailyLimit?: number) => 
        DungeonSweepManager.getRemainingAttempts(dungeonId, dailyLimit),
    canSweepDungeon: (dungeonId: string, dungeonLevel: number, minLevel: number = 2, dailyLimit?: number) => 
        DungeonSweepManager.canSweep(dungeonId, dungeonLevel, minLevel, dailyLimit),
    useDungeonSweepAttempt: (dungeonId: string, dailyLimit?: number) => 
        DungeonSweepManager.useSweepAttempt(dungeonId, dailyLimit),
    incrementDungeonSweepCount: (dungeonId: string) => 
        DungeonSweepManager.incrementSweepCount(dungeonId),
    getDungeonSweepCount: (dungeonId: string) => 
        DungeonSweepManager.getSweepCount(dungeonId),
    
    // 유물 레벨 관리
    getArtifactLevel: (artifactId: number) => GameStateCore.artifactLevels[artifactId] || 0,
    setArtifactLevel: (artifactId: number, level: number) => {
        GameStateCore.artifactLevels[artifactId] = level;
        GameStateCore.save();
    },
    incrementArtifactLevel: (artifactId: number) => {
        const currentLevel = GameStateCore.artifactLevels[artifactId] || 0;
        GameStateCore.artifactLevels[artifactId] = currentLevel + 1;
        GameStateCore.save();
    },
    
    // 알 뽑기 관리
    getEggGachaCount: (id: number) => EggGachaManager.getEggGachaCount(id),
    incrementEggGachaCount: (id: number) => EggGachaManager.incrementEggGachaCount(id),
    setEggGachaCount: (id: number, count: number) => EggGachaManager.setEggGachaCount(id, count),
    getAllEggGachaCounts: () => EggGachaManager.getAllEggGachaCounts(),
    
    // 보옥 관리
    getGemLevel: () => GemManager.getGemLevel(),
    setGemLevel: (level: number) => GemManager.setGemLevel(level),
    upgradeGem: () => GemManager.upgradeGem(),
    getGemAttackPower: () => GemManager.getAttackPower(),
    getGemAttackPowerPercent: () => GemManager.getAttackPowerPercent(),
    getGemCritDamage: () => GemManager.getCritDamage()
};
