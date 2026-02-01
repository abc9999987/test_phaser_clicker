// 게임 상태 핵심 데이터 및 저장/로드 관리
import { StorageKeys } from '../../config/StorageKeys';

export interface SaveData {
    uuid?: string | null;
    sid?: string | null;
    coins: number;
    rubies: number; // 루비 재화
    meat?: number;  // 고기 자원 (선택 저장, 없으면 0)
    gems?: number;  // 젬 재화 (기본값: 0)
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
    artifactLevels?: Record<number, number>; // 유물 레벨 (유물 ID -> 레벨)
    eggGachaCounts?: Record<number, number>; // 알 뽑기 수량 (알 뽑기 ID -> 수량)
    gemLevel?: number; // 보옥 레벨 (기본값: 0)
    skipBossStage?: boolean; // 보스 스테이지 스킵 여부
    // 유물 던전 일일 제한 (구조 변경 전 호환용)
    artifactDungeonLastResetDate?: string; // YYYY-MM-DD (한국 시간 기준)
    artifactDungeonUsedAttempts?: number; // 오늘 사용한 횟수 (0-5)
    artifactDungeonLastResetTimestamp?: number; // 마지막 리셋 시간 (한국 시간 기준)
    artifactDungeonSweepCount?: number; // 유물 던전 소탕 횟수 (누적)
    /**
     * 던전별 소탕 상태
     * key: dungeonId
     * value: {
     *   lastResetDate?: string;
     *   usedAttempts?: number;
     *   lastResetTimestamp?: number;
     *   sweepCount?: number;
     * }
     */
    dungeonSweepStates?: Record<string, {
        lastResetDate?: string | null;
        usedAttempts?: number;
        lastResetTimestamp?: number | null;
        sweepCount?: number;
    }>;
}

// 게임 상태 핵심 데이터
export const GameStateCore = {
    // 기본 상태 변수들
    coins: 0,
    rubies: 0,  // 루비 재화 (기본값 0)
    meat: 0,    // 고기 자원 (기본값 0)
    gems: 0,    // 젬 재화 (기본값 0)
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
    artifactLevels: {} as Record<number, number>,  // 유물 레벨 (유물 ID -> 레벨)
    eggGachaCounts: {} as Record<number, number>,  // 알 뽑기 수량 (알 뽑기 ID -> 수량)
    gemLevel: 0,  // 보옥 레벨 (기본값: 0)
    skipBossStage: false,  // 보스 스테이지 스킵 여부 (기본값: false)
    // 유물 던전 일일 제한 (구 구조, 마이그레이션용)
    artifactDungeonLastResetDate: null as string | null,  // YYYY-MM-DD (한국 시간 기준)
    artifactDungeonUsedAttempts: 0,  // 오늘 사용한 횟수 (0-5)
    artifactDungeonLastResetTimestamp: null as number | null,  // 마지막 리셋 시간 (한국 시간 기준)
    artifactDungeonSweepCount: 0,  // 유물 던전 소탕 횟수 (누적)
    // 던전별 소탕 상태
    dungeonSweepStates: {} as Record<string, {
        lastResetDate?: string | null;
        usedAttempts?: number;
        lastResetTimestamp?: number | null;
        sweepCount?: number;
    }>,
    saveTimer: null as number | null,
    uuid: null as string | null,
    sid: null as string | null,
    
    // 현재 게임 상태를 SaveData 객체로 반환 (저장하지 않음)
    getSaveData(): SaveData {
        return {
            coins: this.coins,
            rubies: this.rubies,
            meat: this.meat,
            gems: this.gems,
            attackPower: this.attackPower,
            attackSpeed: this.attackSpeed,
            critChance: this.critChance,
            critDamage: this.critDamage,
            clickCount: this.clickCount,
            chapter: this.chapter,
            stage: this.stage,
            killsInCurrentStage: this.killsInCurrentStage,
            sp: this.sp,
            learnedSkills: this.learnedSkills,
            spPurchaseCount: this.spPurchaseCount,
            skillAutoUse: this.skillAutoUse,
            dungeonLevels: this.dungeonLevels,
            skillLevels: this.skillLevels,
            artifactLevels: this.artifactLevels,
            artifactDungeonLastResetDate: this.artifactDungeonLastResetDate || undefined,
            artifactDungeonUsedAttempts: this.artifactDungeonUsedAttempts,
            artifactDungeonLastResetTimestamp: this.artifactDungeonLastResetTimestamp || undefined,
            artifactDungeonSweepCount: this.artifactDungeonSweepCount,
            dungeonSweepStates: this.dungeonSweepStates,
            eggGachaCounts: this.eggGachaCounts,
            gemLevel: this.gemLevel,
            skipBossStage: this.skipBossStage,
            saveTime: Date.now(),
            sid: this.sid,
        };
    },
    
    // 게임 상태 저장
    save(): void {
        try {
            const saveData = this.getSaveData();
            saveData.uuid = this.uuid; // uuid는 별도로 보내기 때문에 여기에 넣음
            saveData.sid = this.sid; // sid는 별도로 보내기 때문에 여기에 넣음
            localStorage.setItem(StorageKeys.GAME_SAVE, JSON.stringify(saveData));
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
                this.rubies = data.rubies || 0;
                this.meat = data.meat || 0;
                this.gems = data.gems || 0;
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
                this.artifactLevels = data.artifactLevels || {};
                this.artifactDungeonLastResetDate = data.artifactDungeonLastResetDate || null;
                this.artifactDungeonUsedAttempts = data.artifactDungeonUsedAttempts || 0;
                this.artifactDungeonLastResetTimestamp = data.artifactDungeonLastResetTimestamp || null;
                this.artifactDungeonSweepCount = data.artifactDungeonSweepCount || 0;
                this.dungeonSweepStates = data.dungeonSweepStates || {};
                this.eggGachaCounts = data.eggGachaCounts || {};
                this.gemLevel = data.gemLevel || 0;
                this.skipBossStage = data.skipBossStage || false;
                this.uuid = data.uuid || null;
                this.sid = data.sid || null;
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
    // 없는 값은 제거되므로 꼭 Login으로 받은 Data에 대해서만 사용해야 함.
    updateFromLoginSaveData(saveData: any): void {
        try {
            this.coins = saveData.coins ?? 0;
            this.rubies = saveData.rubies ?? 0;
            this.meat = saveData.meat ?? this.meat ?? 0;
            this.gems = saveData.gems ?? this.gems ?? 0;
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
            this.artifactLevels = saveData.artifactLevels ?? {};
            this.artifactDungeonLastResetDate = saveData.artifactDungeonLastResetDate ?? null;
            this.artifactDungeonUsedAttempts = saveData.artifactDungeonUsedAttempts ?? 0;
            this.artifactDungeonLastResetTimestamp = saveData.artifactDungeonLastResetTimestamp ?? null;
            this.artifactDungeonSweepCount = saveData.artifactDungeonSweepCount ?? 0;
            this.dungeonSweepStates = saveData.dungeonSweepStates ?? this.dungeonSweepStates ?? {};
            this.eggGachaCounts = saveData.eggGachaCounts ?? this.eggGachaCounts ?? {};
            this.gemLevel = saveData.gemLevel ?? this.gemLevel ?? 0;
            this.skipBossStage = saveData.skipBossStage ?? this.skipBossStage ?? false;
            this.uuid = saveData.uuid ?? null;
            this.sid = saveData.sid ?? null;
            console.log('Game state updated from server data');
        } catch (error) {
            console.error('Failed to update game state from save data:', error);
        }
    },

    updateSid(sid: string): void {
        this.sid = sid;
        this.save();
    },

    updateUuid(uuid: string): void {
        this.uuid = uuid;
        this.save();
    }
};
