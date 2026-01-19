// 스탯 관리 (공격력, 공격 속도, 치명타 등)
import { GameStateCore } from './GameStateCore';
import { CoinManager } from './CoinManager';
import { GameState } from '../GameState';
import { ArtifactConfigs } from '../../config/artifactConfig';

export const StatManager = {
    // 공격력 실제 값 계산 (레벨에 따른 공격력)
    getAttackPowerValue(): number {
        const level = GameStateCore.attackPower - 1; // attackPower는 1부터 시작하므로 0부터 시작하도록 변환
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
        // ArtifactConfigs[0]은 유물 공격력 %로 증가 (id: 1)
        const artifactMultiplier = ((GameState.getArtifactLevel(1) * ArtifactConfigs[0].value) / 100) + 1;
        return (startValue + position * increment) * (artifactMultiplier === 0 ? 1 : artifactMultiplier);
    },

    getAttackSpeedValue(): number {
        const attackSpeed = GameStateCore.attackSpeed + (GameState.getArtifactLevel(2) * ArtifactConfigs[1].value);
        return attackSpeed;
    },

    getCritChanceValue(): number {
        const critChance = GameStateCore.critChance + (GameState.getArtifactLevel(3) * ArtifactConfigs[2].value);
        return critChance;
    },

    getCritDamageValue(): number {
        const critDamage = GameStateCore.critDamage + (GameState.getArtifactLevel(4) * ArtifactConfigs[3].value);
        return critDamage;
    },

    getGoldRateValue(): number {
        // 유물 ID 5의 레벨 * value = 코인 획득량 증가율 (%)
        // 예: 레벨 10이면 10% 증가
        return GameState.getArtifactLevel(5) * ArtifactConfigs[4].value;
    },
    
    // 공격력 강화 비용 계산
    getAttackPowerUpgradeCost(): number {
        // 구간별 설정 (임계값, multiplier, 지수) - 큰 값부터 정렬
        const costTiers = [
            { threshold: 300000, multiplier: 3900, exponent: 4.8 },
            { threshold: 290000, multiplier: 3800, exponent: 4.7 },
            { threshold: 280000, multiplier: 3700, exponent: 4.6 },
            { threshold: 270000, multiplier: 3600, exponent: 4.5 },
            { threshold: 260000, multiplier: 3500, exponent: 4.4 },
            { threshold: 250000, multiplier: 3400, exponent: 4.3 },
            { threshold: 240000, multiplier: 3300, exponent: 4.2 },
            { threshold: 230000, multiplier: 3200, exponent: 4.1 },
            { threshold: 220000, multiplier: 3100, exponent: 4 },
            { threshold: 210000, multiplier: 3000, exponent: 3.9 },
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
            if (GameStateCore.attackPower > tier.threshold) {
                multiplier = tier.multiplier;
                exponent = tier.exponent;
                break;
            }
        }
        
        // 비용 계산: multiplier + (단계-1) * 10 + (단계-1)^exponent * 15
        const level = GameStateCore.attackPower - 1;
        return Math.floor(multiplier + level * 10 + Math.pow(level, exponent) * 15);
    },
    
    // 공격 속도 강화 비용 계산 (더 비싸게 조정)
    getAttackSpeedUpgradeCost(): number {
        return Math.floor(75 * Math.pow(2.0, GameStateCore.attackSpeed));
    },
    
    // 치명타 확률 업그레이드 비용 계산
    getCritChanceUpgradeCost(): number {
        let multiplier = 10;
        if (GameStateCore.critChance > 100) {
            multiplier = 20;
        } else if (GameStateCore.critChance > 200) {
            multiplier = 40;
        } else if (GameStateCore.critChance > 300) {
            multiplier = 60;
        } else if (GameStateCore.critChance > 400) {
            multiplier = 80;
        } else if (GameStateCore.critChance > 500) {
            multiplier = 100;
        }
        // 제곱+선형 혼합: 10 + (단계-1) * 10 + (단계-1)² * 5
        return Math.floor(multiplier + (GameStateCore.critChance - 1) * 50 + Math.pow(GameStateCore.critChance - 1, 2) * 40);
    },

    // 치명타 데미지 강화 비용 계산
    getCritDamageUpgradeCost(): number {
        return Math.floor(75 * Math.pow(1.35, GameStateCore.critDamage));
    },
    
    // 공격력 강화 구매
    upgradeAttackPower(): boolean {
        const cost = this.getAttackPowerUpgradeCost();
        if (CoinManager.spendCoins(cost)) {
            GameStateCore.attackPower++;
            GameStateCore.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 공격 속도 강화 구매 (최대 15)
    upgradeAttackSpeed(): boolean {
        // 최대치 체크
        if (GameStateCore.attackSpeed >= 15) {
            return false;
        }
        
        const cost = this.getAttackSpeedUpgradeCost();
        if (CoinManager.spendCoins(cost)) {
            GameStateCore.attackSpeed++;
            GameStateCore.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 치명타 확률 강화 구매 (최대 100%)
    upgradeCritChance(): boolean {
        // 최대치 체크
        if (GameStateCore.critChance >= 100) {
            return false;
        }
        
        const cost = this.getCritChanceUpgradeCost();
        if (CoinManager.spendCoins(cost)) {
            GameStateCore.critChance++;
            GameStateCore.save(); // 자동 저장
            return true;
        }
        return false;
    },
    
    // 치명타 데미지 강화 구매 (최대 100%)
    upgradeCritDamage(): boolean {
        // 최대치 체크
        if (GameStateCore.critDamage >= 100) {
            return false;
        }
        
        const cost = this.getCritDamageUpgradeCost();
        if (CoinManager.spendCoins(cost)) {
            GameStateCore.critDamage++;
            GameStateCore.save(); // 자동 저장
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
