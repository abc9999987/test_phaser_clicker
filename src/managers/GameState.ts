// 게임 상태 관리
import { Character } from '../game/Character';
import { SkillConfigs } from '../config/gameConfig';

interface SaveData {
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

export const GameState = {
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
    spPurchaseCount: 0,  // SP 구매 횟수 (최대 5)
    skillAutoUse: {} as Record<string, boolean>,  // 스킬 자동 사용 상태 (skillId -> boolean)
    activeBuffs: {} as Record<string, { startTime: number; endTime: number }>,  // 활성 버프 (skillId -> { startTime, endTime })
    dungeonLevels: {} as Record<string, number>,  // 던전 단계 (던전 ID -> 단계)
    skillLevels: {} as Record<string, number>,  // 스킬 레벨 (스킬 ID -> 레벨)
    storageKey: 'test_clicker_save', // localStorage 키
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
            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            console.log('Game state saved');
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    },
    
    // 게임 상태 로드
    load(): boolean {
        try {
            const savedData = localStorage.getItem(this.storageKey);
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
            localStorage.removeItem(this.storageKey);
            console.log('Game state cleared');
        } catch (error) {
            console.error('Failed to clear game state:', error);
        }
    },
    
    // 코인 추가
    addCoins(amount: number): void {
        this.coins += amount;
        // 자동 저장 (디바운싱 - 마지막 변경 후 1초 뒤에 저장)
        this.debouncedSave();
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
    
    // 코인 차감
    spendCoins(amount: number): boolean {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 스테이지 문자열 반환 (예: "1-5")
    getStageString(): string {
        return `${this.chapter}-${this.stage}`;
    },
    
    // 현재 스테이지 번호 계산 (챕터와 스테이지를 합친 전체 번호)
    getTotalStageNumber(): number {
        return (this.chapter - 1) * 20 + this.stage;
    },
    
    // 보스 스테이지인지 확인 (10번째 적 = killsInCurrentStage === 9)
    isBossStage(): boolean {
        return this.killsInCurrentStage === 9;
    },
    
    // 스테이지별 적 체력 계산
    getEnemyHp(): number {
        const totalStage = this.getTotalStageNumber();
        // 1-1: 10, 이후 1.5배씩 증가
        // 0.5배로 감소
        let baseHp = Math.floor(10 * Math.pow(1.5, totalStage - 1) * 0.25);
        
        // 보스 스테이지면 체력 2배
        if (this.isBossStage()) {
            baseHp *= 4;
        }
        
        return baseHp;
    },
    
    // 스테이지별 골드 보상 (적 체력 * 2)
    getEnemyGoldReward(): number {
        return this.getEnemyHp() * 2;
    },
    
    // 적 처치 시 호출 (스테이지 진행 처리)
    onEnemyDefeated(): void {
        this.killsInCurrentStage++;
        
        // 10마리 처치 시 다음 스테이지로
        if (this.killsInCurrentStage >= 10) {
            this.killsInCurrentStage = 0;
            this.stage++;
            
            // 1-20 이후 2-1로
            if (this.stage > 20) {
                this.stage = 1;
                this.chapter++;
            }
            
            this.save(); // 스테이지 변경 시 저장
        }
    },
    
    // 보스 타이머 만료 시 호출 (처치 카운트만 초기화)
    onBossTimerExpired(): void {
        this.killsInCurrentStage = 0;
        this.save();
    },
    
    // 공격력 실제 값 계산 (레벨에 따른 공격력)
    // 스킬 자동 사용 토글
    toggleSkillAutoUse(skillId: string): boolean {
        this.skillAutoUse[skillId] = !this.isSkillAutoUse(skillId);
        this.debouncedSave();
        return this.skillAutoUse[skillId];
    },
    
    // 스킬 자동 사용 여부 확인
    isSkillAutoUse(skillId: string): boolean {
        return this.skillAutoUse[skillId] === true;
    },
    
    getAttackPowerValue(): number {
        const level = this.attackPower - 1; // attackPower는 1부터 시작하므로 0부터 시작하도록 변환
        const section = Math.floor(level / 10);
        const position = level % 10;
        const increment = section + 1;
        
        // 시작값 계산
        let startValue = 1; // 구간 0
        for (let s = 1; s <= section; s++) {
            const prevIncrement = s; // 이전 구간의 증가량
            const prevLastValue = startValue + 9 * prevIncrement; // 이전 구간의 마지막 값
            startValue = prevLastValue + (s + 1); // 현재 구간 시작값 = 이전 마지막 + (section+1)
        }
        
        return startValue + position * increment;
    },
    
    // 공격력 강화 비용 계산
    getAttackPowerUpgradeCost(): number {
        // 구간별 설정 (임계값, multiplier, 지수) - 큰 값부터 정렬
        const costTiers = [
            { threshold: 200000, multiplier: 2900, exponent: 3.8 },
            { threshold: 190000, multiplier: 2800, exponent: 3.7 },
            { threshold: 180000, multiplier: 2700, exponent: 3.6 },
            { threshold: 170000, multiplier: 2600, exponent: 3.5 },
            { threshold: 160000, multiplier: 2500, exponent: 3.4 },
            { threshold: 150000, multiplier: 2400, exponent: 3.3 },
            { threshold: 140000, multiplier: 2300, exponent: 3.2 },
            { threshold: 130000, multiplier: 2200, exponent: 3.1 },
            { threshold: 120000, multiplier: 2100, exponent: 3 },
            { threshold: 110000, multiplier: 2000, exponent: 2.9 },
            { threshold: 100000, multiplier: 1900, exponent: 2.8 },
            { threshold: 90000, multiplier: 1800, exponent: 2.7 },
            { threshold: 80000, multiplier: 1600, exponent: 2.6 },
            { threshold: 70000, multiplier: 1400, exponent: 2.5 },
            { threshold: 60000, multiplier: 1000, exponent: 2.4 },
            { threshold: 50000, multiplier: 700, exponent: 2.3 },
            { threshold: 40000, multiplier: 500, exponent: 2.2 },
            { threshold: 30000, multiplier: 300, exponent: 2.1 },
            { threshold: 500, multiplier: 100, exponent: 2 },
            { threshold: 400, multiplier: 80, exponent: 2 },
            { threshold: 300, multiplier: 60, exponent: 2 },
            { threshold: 200, multiplier: 40, exponent: 2 },
            { threshold: 100, multiplier: 20, exponent: 2 }
        ];
        
        // 기본값
        let multiplier = 10;
        let exponent = 2;
        
        // 공격력에 맞는 구간 찾기
        for (const tier of costTiers) {
            if (this.attackPower > tier.threshold) {
                multiplier = tier.multiplier;
                exponent = tier.exponent;
                break;
            }
        }
        
        // 비용 계산: multiplier + (단계-1) * 10 + (단계-1)^exponent * 15
        const level = this.attackPower - 1;
        return Math.floor(multiplier + level * 10 + Math.pow(level, exponent) * 15);
    },
    
    // 공격 속도 강화 비용 계산 (더 비싸게 조정)
    getAttackSpeedUpgradeCost(): number {
        return Math.floor(75 * Math.pow(2.0, this.attackSpeed));
    },
    
    // 치명타 확률 업그레이드 비용 계산
    getCritChanceUpgradeCost(): number {
        let multiplier = 10;
        if (this.critChance > 100) {
            multiplier = 20;
        } else if (this.critChance > 200) {
            multiplier = 40;
        } else if (this.critChance > 300) {
            multiplier = 60;
        } else if (this.critChance > 400) {
            multiplier = 80;
        } else if (this.critChance > 500) {
            multiplier = 100;
        }
        // 제곱+선형 혼합: 10 + (단계-1) * 10 + (단계-1)² * 5
        return Math.floor(multiplier + (this.critChance - 1) * 50 + Math.pow(this.critChance - 1, 2) * 40);
    },

    // 치명타 데미지 강화 비용 계산
    getCritDamageUpgradeCost(): number {
        return Math.floor(75 * Math.pow(1.35, this.critDamage));
    },
    
    // 공격력 강화 구매
    upgradeAttackPower(): boolean {
        const cost = this.getAttackPowerUpgradeCost();
        if (this.spendCoins(cost)) {
            this.attackPower++;
            this.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 공격 속도 강화 구매 (최대 15)
    upgradeAttackSpeed(): boolean {
        // 최대치 체크
        if (this.attackSpeed >= 15) {
            return false;
        }
        
        const cost = this.getAttackSpeedUpgradeCost();
        if (this.spendCoins(cost)) {
            this.attackSpeed++;
            this.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 치명타 확률 강화 구매 (최대 100%)
    upgradeCritChance(): boolean {
        // 최대치 체크
        if (this.critChance >= 100) {
            return false;
        }
        
        const cost = this.getCritChanceUpgradeCost();
        if (this.spendCoins(cost)) {
            this.critChance++;
            this.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 치명타 데미지 강화 구매 (최대 100%)
    upgradeCritDamage(): boolean {
        // 최대치 체크
        if (this.critDamage >= 100) {
            return false;
        }
        
        const cost = this.getCritDamageUpgradeCost();
        if (this.spendCoins(cost)) {
            this.critDamage++;
            this.save(); // 자동 저장
            return true;
        }
        return false;
    },
    // 호환성을 위한 별칭 (이전 함수명)
    getClickUpgradeCost(): number {
        return this.getAttackPowerUpgradeCost();
    },
    
    getAutoFireUpgradeCost(): number {
        return this.getAttackSpeedUpgradeCost();
    },
    
    upgradeClick(): boolean {
        return this.upgradeAttackPower();
    },
    
    upgradeAutoFire(): boolean {
        return this.upgradeAttackSpeed();
    },
    
    // SP 추가
    addSp(amount: number): void {
        this.sp += amount;
        this.debouncedSave();
    },
    
    // SP 차감
    spendSp(amount: number): boolean {
        if (this.sp >= amount) {
            this.sp -= amount;
            this.save();
            return true;
        }
        return false;
    },
    
    // 스킬 습득 여부 확인
    isSkillLearned(skillId: string): boolean {
        return this.learnedSkills.includes(skillId);
    },
    
    // 스킬 습득
    learnSkill(skillId: string): boolean {
        if (!this.isSkillLearned(skillId)) {
            this.learnedSkills.push(skillId);
            // 습득 시 레벨 1로 초기화
            this.skillLevels[skillId] = 1;
            this.save();
            return true;
        }
        return false;
    },
    
    // 스킬 레벨 가져오기
    getSkillLevel(skillId: string): number {
        return this.skillLevels[skillId] || 1; // 기본값 1
    },
    
    // 스킬 레벨 업그레이드
    upgradeSkill(skillId: string): boolean {
        // 스킬을 습득하지 않았으면 실패
        if (!this.isSkillLearned(skillId)) {
            return false;
        }
        
        // SkillConfig에서 maxLevel 확인
        const config = SkillConfigs.find((s) => s.id === skillId);
        if (!config) {
            return false;
        }
        
        const currentLevel = this.getSkillLevel(skillId);
        const maxLevel = config.maxLevel || 1;
        
        // 최대 레벨에 도달했으면 실패
        if (currentLevel >= maxLevel) {
            return false;
        }
        
        // SP 3 소모
        if (this.sp >= 3 && this.spendSp(3)) {
            this.skillLevels[skillId] = currentLevel + 1;
            this.save();
            return true;
        }
        
        return false;
    },
    
    // 스킬의 skillPower 가져오기 (레벨 반영)
    getSkillPower(skillId: string): number {
        const config = SkillConfigs.find((s) => s.id === skillId);
        if (!config) {
            return 1;
        }
        
        // buff_attack_damage 스킬의 경우 레벨에 따라 skillPower 변경
        if (skillId === 'buff_attack_damage') {
            const level = this.getSkillLevel(skillId);
            // 레벨 1: 3, 레벨 2: 4, 레벨 3: 5
            return 2 + level;
        }
        
        // 다른 스킬은 기본 skillPower 반환
        return config.skillPower;
    },
    
    // SP 구매 비용 계산 (초기 10만원, 10배씩 증가)
    getSpPurchaseCost(): number {
        return Math.floor(100000 * Math.pow(10, this.spPurchaseCount));
    },
    
    // SP 구매 (최대 5개까지만)
    purchaseSp(): boolean {
        // 최대 5개까지만 구매 가능
        if (this.spPurchaseCount >= 10) {
            return false;
        }
        
        const cost = this.getSpPurchaseCost();
        if (this.spendCoins(cost)) {
            this.spPurchaseCount++;
            this.sp++;
            this.save();
            return true;
        }
        return false;
    },
    
    // 버프 활성화
    activateBuff(skillId: string, startTime: number, duration: number, scene?: Phaser.Scene): void {
        this.activeBuffs[skillId] = {
            startTime: startTime,
            endTime: startTime + duration * 1000 // duration은 초 단위이므로 밀리초로 변환
        };
        
        // buff_attack_damage 버프일 경우 이펙트 표시
        if (skillId === 'buff_attack_damage' && scene) {
            Character.showBuffEffect(scene);
        }
    },
    
    // 버프 만료 여부 확인
    isBuffActive(skillId: string, currentTime: number): boolean {
        const buff = this.activeBuffs[skillId];
        if (!buff) return false;
        return currentTime < buff.endTime;
    },
    
    // 버프 제거
    removeBuff(skillId: string): void {
        delete this.activeBuffs[skillId];
        
        // buff_attack_damage 버프일 경우 이펙트 숨김
        if (skillId === 'buff_attack_damage') {
            Character.hideBuffEffect();
        }
    },
    
    // 활성 버프의 배수 가져오기 (데미지 증가용)
    getBuffMultiplier(skillId: string, currentTime: number): number {
        if (this.isBuffActive(skillId, currentTime)) {
            // 레벨에 따른 skillPower 반환
            return this.getSkillPower(skillId);
        }
        return 1;
    },
    
    // 버프 남은 지속시간 계산 (초 단위)
    getBuffRemainingDuration(skillId: string, currentTime: number): number {
        const buff = this.activeBuffs[skillId];
        if (!buff) return 0;
        
        if (currentTime >= buff.endTime) return 0;
        
        const remaining = (buff.endTime - currentTime) / 1000; // 밀리초를 초로 변환
        return remaining > 0 ? remaining : 0;
    },
    
    // 던전 단계 가져오기
    getDungeonLevel(dungeonId: string): number {
        return this.dungeonLevels[dungeonId] || 1; // 기본값 1
    },
    
    // 던전 단계 증가
    incrementDungeonLevel(dungeonId: string): void {
        if (!this.dungeonLevels[dungeonId]) {
            this.dungeonLevels[dungeonId] = 1;
        }
        this.dungeonLevels[dungeonId]++;
        this.save(); // 자동 저장
    }
};
