// 보옥 설정
export interface GemConfig {
    // 스탯 초기값
    initialStats: {
        attackPower: number;        // 공격력 초기값
        attackPowerPercent: number;  // 공격력 % 초기값
        critDamage: number;          // 치명타 데미지 초기값
    };
    
    // 업그레이드당 증가량
    upgradeIncrements: {
        attackPower: number;         // 공격력 증가량 (레벨당)
        attackPowerPercent: number;  // 공격력 % 증가량 (레벨당)
        critDamage: number;          // 치명타 데미지 증가량 (레벨당)
    };
    
    // 업그레이드 비용 설정
    upgradeCost: {
        initialCost: number;         // 초기 비용
        multiplier: number;          // 레벨당 배수 (3배씩 증가)
    };
}

// 보옥 설정
export const GemConfig: GemConfig = {
    initialStats: {
        attackPower: 0,              // 공격력 초기값: 0
        attackPowerPercent: 0,       // 공격력 % 초기값: 0
        critDamage: 0                // 치명타 데미지 초기값: 0
    },
    
    upgradeIncrements: {
        attackPower: 10000,            // 공격력 증가량: 레벨당 +10000
        attackPowerPercent: 10,      // 공격력 % 증가량: 레벨당 +10%
        critDamage: 15               // 치명타 데미지 증가량: 레벨당 +15%
    },
    
    upgradeCost: {
        initialCost: 100,             // 초기 비용: 100 젬
        multiplier: 3                 // 레벨당 3배씩 증가
    }
};
