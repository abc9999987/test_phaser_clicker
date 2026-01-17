// 게임 상태 핵심 데이터 및 저장/로드 관리
import { StorageKeys } from '../../config/StorageKeys';

export interface SaveData {
    coins: number;
    attackPower: number;
    attackSpeed: number;
    critChance: number; // 치명타 확률 (%)
    critDamage: number;
    clickCount: number;
    chapter: number;
    stage: number;
    killsInCurrentStage: number;
    saveTime: number;
    sp: number;
    learnedSkills: string[];
    spPurchaseCount: number;
    skillAutoUse?: Record<string, boolean>; // 스킬 자동 사용 상태
    dungeonLevels?: Record<string, number>; // 던전 단계 (던전 ID -> 단계)
    skillLevels?: Record<string, number>; // 스킬 레벨 (스킬 ID -> 레벨)
}

// 게임 상태 핵심 데이터
export const GameStateCore = {
    // 기본 상태 변수들
    coins: 0,
    attackPower: 1,  // 공격력
    attackSpeed: 0,  // 공격 속도 (초당 발사 횟수)
    critChance: 0,  // 치명타 확률 (%)
    critDamage: 0,  // 치명타 데미지 (%)
    clickCount: 0,
    chapter: 1,  // 챕터 (1, 2, 3, ...)
    stage: 1,  // 스테이지 (1-20)
    killsInCurrentStage: 0,  // 현재 스테이지에서 처치한 적 수
    sp: 0,  // Skill Point
    learnedSkills: [] as string[],  // 습득한 스킬 ID 목록
    spPurchaseCount: 0,  // SP 구매 횟수 (최대 10)
    skillAutoUse: {} as Record<string, boolean>,  // 스킬 자동 사용 상태 (skillId -> boolean)
    activeBuffs: {} as Record<string, { startTime: number; endTime: number }>,  // 활성 버프 (skillId -> { startTime, endTime })
    dungeonLevels: {} as Record<string, number>,  // 던전 단계 (던전 ID -> 단계)
    skillLevels: {} as Record<string, number>,  // 스킬 레벨 (스킬 ID -> 레벨)
    saveTimer: null as number | null,
    
    // 게임 상태 저장
    save(): void {
        try {
            const saveData: SaveData = {
                coins: this.coins,
                attackPower: this.attackPower,
                attackSpeed: this.attackSpeed,
                critChance: this.critChance,
                critDamage: this.critDamage,
                clickCount: this.clickCount,
                chapter: this.chapter,
                stage: this.stage,
                killsInCurrentStage: this.killsInCurrentStage,
                saveTime: Date.now(),
                sp: this.sp,
                learnedSkills: this.learnedSkills,
                spPurchaseCount: this.spPurchaseCount,
                skillAutoUse: this.skillAutoUse,
                dungeonLevels: this.dungeonLevels,
                skillLevels: this.skillLevels
            };
            localStorage.setItem(StorageKeys.GAME_SAVE, JSON.stringify(saveData));
            console.log('Game state saved');
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    },
    
    // 게임 상태 로드
    load(): boolean {
        try {
            const savedData = localStorage.getItem(StorageKeys.GAME_SAVE);
            if (savedData) {
                const data: SaveData = JSON.parse(savedData);
                this.coins = data.coins || 0;
                this.attackPower = data.attackPower || 1;
                this.attackSpeed = data.attackSpeed || 0;
                this.critChance = data.critChance || 0;
                this.critDamage = data.critDamage || 0;
                this.clickCount = data.clickCount || 0;
                this.chapter = data.chapter || 1;
                this.stage = data.stage || 1;
                this.killsInCurrentStage = data.killsInCurrentStage || 0;
                this.sp = data.sp || 0;
                this.learnedSkills = data.learnedSkills || [];
                this.spPurchaseCount = data.spPurchaseCount || 0;
                this.skillAutoUse = data.skillAutoUse || {};
                this.dungeonLevels = data.dungeonLevels || {};
                this.skillLevels = data.skillLevels || {};
                console.log('Game state loaded');
                return true;
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
        return false;
    },
    
    // 저장 데이터 삭제 (초기화)
    clear(): void {
        try {
            localStorage.removeItem(StorageKeys.GAME_SAVE);
            console.log('Game state cleared');
        } catch (error) {
            console.error('Failed to clear game state:', error);
        }
    },
    
    // 디바운싱된 저장 (너무 자주 저장하지 않도록)
    debouncedSave(): void {
        if (this.saveTimer !== null) {
            clearTimeout(this.saveTimer);
        }
        this.saveTimer = window.setTimeout(() => {
            this.save();
        }, 1000); // 1초 후 저장
    },
    
    // SaveData로부터 게임 상태 업데이트 (로그인 시 서버 데이터 동기화)
    updateFromSaveData(saveData: SaveData): void {
        try {
            this.coins = saveData.coins ?? 0;
            this.attackPower = saveData.attackPower ?? 1;
            this.attackSpeed = saveData.attackSpeed ?? 0;
            this.critChance = saveData.critChance ?? 0;
            this.critDamage = saveData.critDamage ?? 0;
            this.clickCount = saveData.clickCount ?? 0;
            this.chapter = saveData.chapter ?? 1;
            this.stage = saveData.stage ?? 1;
            this.killsInCurrentStage = saveData.killsInCurrentStage ?? 0;
            this.sp = saveData.sp ?? 0;
            this.learnedSkills = saveData.learnedSkills ?? [];
            this.spPurchaseCount = saveData.spPurchaseCount ?? 0;
            this.skillAutoUse = saveData.skillAutoUse ?? {};
            this.dungeonLevels = saveData.dungeonLevels ?? {};
            this.skillLevels = saveData.skillLevels ?? {};
            console.log('Game state updated from server data');
        } catch (error) {
            console.error('Failed to update game state from save data:', error);
        }
    }
};
