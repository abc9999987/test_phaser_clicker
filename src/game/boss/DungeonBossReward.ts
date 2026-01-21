import Phaser from 'phaser';
import { Effects } from '../../utils/Effects';
import { GameState } from '../../managers/GameState';
import { DungeonConfig } from '../../config/dungeonConfig';
import { StatManager } from '../../managers/state/StatManager';

// 던전 보스 보상 처리
export const DungeonBossReward = {
    // 골드 보상 값 계산(실제 지급 전 순수 계산용)
    getGoldRewardValue(
        dungeonConfig: DungeonConfig,
        dungeonLevel: number
    ): number {
        let reward = 0;

        if (dungeonConfig.getBossReward) {
            reward = dungeonConfig.getBossReward(dungeonLevel);
        } else {
            // 기본 계산: baseReward * (1.2 ^ (level - 1))
            reward = Math.floor(dungeonConfig.bossBaseReward * Math.pow(1.2, dungeonLevel - 1));
        }

        // 유물 효과 적용 (코인 획득량 증가율)
        const goldRateMultiplier = 1 + (StatManager.getGoldRateValue() / 100);
        reward = Math.floor(reward * goldRateMultiplier);

        return reward;
    },

    // 보상 지급 처리
    giveReward(
        scene: Phaser.Scene,
        dungeonConfig: DungeonConfig,
        dungeonLevel: number,
        bossX: number,
        bossY: number
    ): void {
        if (dungeonConfig.id === 'artifact_dungeon') {
            // 유물 던전: 루비 보상 지급 (현재 층수와 동일한 양)
            this.giveRubyReward(scene, dungeonLevel, bossX, bossY);
        } else if (dungeonConfig.id === 'feed_dungeon') {
            // 고기 던전: meat 보상 지급
            this.giveMeatReward(scene, dungeonLevel, bossX, bossY);
        } else {
            // 골드 던전 등: 골드 보상 지급
            this.giveGoldReward(scene, dungeonConfig, dungeonLevel, bossX, bossY);
        }
    },
    
    // 골드 보상 지급
    giveGoldReward(
        scene: Phaser.Scene,
        dungeonConfig: DungeonConfig,
        dungeonLevel: number,
        bossX: number,
        bossY: number
    ): void {
        // 보상 계산 (공통 헬퍼 사용)
        const reward = this.getGoldRewardValue(dungeonConfig, dungeonLevel);
        
        // 보상 지급
        GameState.addCoins(reward);
        
        // 던전에서 골드를 받은 후 바로 게임 씬으로 돌아갈 수 있으므로 즉시 저장
        // (debouncedSave는 1초 후 저장되므로 씬 전환 전에 저장되지 않을 수 있음)
        GameState.save();
        
        // 코인 파티클 효과
        Effects.createDungeonRewardParticle(scene, bossX, bossY, reward, '', '#ffd700');
    },
    
    // 루비 보상 지급
    giveRubyReward(
        scene: Phaser.Scene,
        dungeonLevel: number,
        bossX: number,
        bossY: number
    ): void {
        // 보상 계산: 현재 층수와 동일한 양의 루비
        const reward = dungeonLevel;
        
        // 보상 지급
        GameState.addRubies(reward);
        
        // 즉시 저장
        GameState.save();
        
        // 루비 파티클 효과
        Effects.createDungeonRewardParticle(scene, bossX, bossY, reward, ' 루비', '#ff6b9d');
    },

    // 먹이(meat) 보상 지급
    giveMeatReward(
        scene: Phaser.Scene,
        dungeonLevel: number,
        bossX: number,
        bossY: number
    ): void {
        // 보상 계산: 층수 * 10개
        const reward = dungeonLevel * 10;

        // 보상 지급
        GameState.addMeat(reward);

        // 즉시 저장 (GameState.addMeat에서 이미 저장하지만 명시적으로 한 번 더 호출 가능)
        GameState.save();

        // 고기 파티클 효과 (루비 스타일에 텍스트만 변경)
        Effects.createDungeonRewardParticle(scene, bossX, bossY, reward, ' 고기', '#ff6b9d');
    }
};
