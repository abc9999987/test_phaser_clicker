import Phaser from 'phaser';
import { Effects } from '../../utils/Effects';
import { GameState } from '../../managers/GameState';
import { DungeonConfig } from '../../config/dungeonConfig';

// 던전 보스 보상 처리
export const DungeonBossReward = {
    // 보상 지급 처리
    giveReward(
        scene: Phaser.Scene,
        dungeonConfig: DungeonConfig,
        dungeonLevel: number,
        bossX: number,
        bossY: number
    ): void {
        if (dungeonConfig.id === 'artifact_dungeon') {
            // 유물 던전: 골드 보상 지급하지 않음
            // TODO: 나중에 유물 보상 시스템 추가 예정
            // 보상 계산 예시:
            // let reward = 0;
            // if (dungeonConfig.getBossReward) {
            //     reward = dungeonConfig.getBossReward(dungeonLevel);
            // }
            // 유물 보상 지급 로직 추가 (예: ArtifactManager.giveArtifact(reward))
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
        // 보상 계산
        let reward = 0;
        if (dungeonConfig.getBossReward) {
            reward = dungeonConfig.getBossReward(dungeonLevel);
        } else {
            // 기본 계산: baseReward * (1.2 ^ (level - 1))
            reward = Math.floor(dungeonConfig.bossBaseReward * Math.pow(1.2, dungeonLevel - 1));
        }
        
        // 보상 지급
        GameState.addCoins(reward);
        
        // 던전에서 골드를 받은 후 바로 게임 씬으로 돌아갈 수 있으므로 즉시 저장
        // (debouncedSave는 1초 후 저장되므로 씬 전환 전에 저장되지 않을 수 있음)
        GameState.save();
        
        // 코인 파티클 효과
        Effects.createCoinParticle(scene, bossX, bossY, reward);
    }
};
