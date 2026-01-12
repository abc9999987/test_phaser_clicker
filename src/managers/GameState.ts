// 게임 상태 관리
interface SaveData {
    coins: number;
    attackPower: number;
    attackSpeed: number;
    clickCount: number;
    chapter: number;
    stage: number;
    killsInCurrentStage: number;
    saveTime: number;
}

export const GameState = {
    coins: 0,
    attackPower: 1,  // 공격력
    attackSpeed: 0,  // 공격 속도 (초당 발사 횟수)
    clickCount: 0,
    chapter: 1,  // 챕터 (1, 2, 3, ...)
    stage: 1,  // 스테이지 (1-20)
    killsInCurrentStage: 0,  // 현재 스테이지에서 처치한 적 수
    storageKey: 'test_clicker_save', // localStorage 키
    saveTimer: null as number | null,
    
    // 게임 상태 저장
    save(): void {
        try {
            const saveData: SaveData = {
                coins: this.coins,
                attackPower: this.attackPower,
                attackSpeed: this.attackSpeed,
                clickCount: this.clickCount,
                chapter: this.chapter,
                stage: this.stage,
                killsInCurrentStage: this.killsInCurrentStage,
                saveTime: Date.now()
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
                this.clickCount = data.clickCount || 0;
                this.chapter = data.chapter || 1;
                this.stage = data.stage || 1;
                this.killsInCurrentStage = data.killsInCurrentStage || 0;
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
    
    // 스테이지별 적 체력 계산
    getEnemyHp(): number {
        const totalStage = this.getTotalStageNumber();
        // 1-1: 10, 이후 1.5배씩 증가
        return Math.floor(10 * Math.pow(1.5, totalStage - 1));
    },
    
    // 스테이지별 골드 보상 (적 체력과 동일)
    getEnemyGoldReward(): number {
        return this.getEnemyHp();
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
    
    // 공격력 강화 비용 계산 (1.4로 조정)
    getAttackPowerUpgradeCost(): number {
        return Math.floor(10 * Math.pow(1.4, this.attackPower - 1));
    },
    
    // 공격 속도 강화 비용 계산 (더 비싸게 조정)
    getAttackSpeedUpgradeCost(): number {
        return Math.floor(75 * Math.pow(2.0, this.attackSpeed));
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
    
    // 공격 속도 강화 구매
    upgradeAttackSpeed(): boolean {
        const cost = this.getAttackSpeedUpgradeCost();
        if (this.spendCoins(cost)) {
            this.attackSpeed++;
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
    }
};
