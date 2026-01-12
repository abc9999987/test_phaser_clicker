// 게임 상태 관리
interface SaveData {
    coins: number;
    coinsPerClick: number;
    autoFireRate: number;
    clickCount: number;
    saveTime: number;
}

export const GameState = {
    coins: 0,
    coinsPerClick: 1,
    autoFireRate: 0,  // 초당 발사 횟수
    clickCount: 0,
    storageKey: 'acerpg_save', // localStorage 키
    saveTimer: null as number | null,
    
    // 게임 상태 저장
    save(): void {
        try {
            const saveData: SaveData = {
                coins: this.coins,
                coinsPerClick: this.coinsPerClick,
                autoFireRate: this.autoFireRate,
                clickCount: this.clickCount,
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
                this.coinsPerClick = data.coinsPerClick || 1;
                this.autoFireRate = data.autoFireRate || 0;
                this.clickCount = data.clickCount || 0;
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
    
    // 클릭 강화 비용 계산
    getClickUpgradeCost(): number {
        return Math.floor(10 * Math.pow(1.5, this.coinsPerClick - 1));
    },
    
    // 자동 발사 강화 비용 계산
    getAutoFireUpgradeCost(): number {
        return Math.floor(50 * Math.pow(2, this.autoFireRate));
    },
    
    // 클릭 강화 구매
    upgradeClick(): boolean {
        const cost = this.getClickUpgradeCost();
        if (this.spendCoins(cost)) {
            this.coinsPerClick++;
            this.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 자동 발사 강화 구매
    upgradeAutoFire(): boolean {
        const cost = this.getAutoFireUpgradeCost();
        if (this.spendCoins(cost)) {
            this.autoFireRate++;
            this.save(); // 자동 저장
            return true;
        }
        return false;
    }
};
