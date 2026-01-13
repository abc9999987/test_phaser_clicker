import Phaser from 'phaser';

// 스킬 설정 타입
export interface SkillConfig {
    id: string;
    name: string;
    cooldown: number; // 초 단위
    damageMultiplier: number; // 유저 공격력 배수
    spCost: number; // 습득에 필요한 SP
}

// 스킬 설정 목록
export const SkillConfigs: SkillConfig[] = [
    {
        id: 'big_k_fish_bread',
        name: '붕어빵테오',
        cooldown: 6,
        damageMultiplier: 20,
        spCost: 1  // 습득에 필요한 SP
    }
];

// Phaser 게임 설정 (모바일 세로 해상도, 반응형)
export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 390,
    height: 844,
    parent: 'game-container',
    backgroundColor: '#7ec8ff',
    scene: undefined, // GameScene에서 설정됨
    scale: {
        mode: Phaser.Scale.FIT, // 비율 유지하면서 화면에 맞춤 (여백 자동 처리)
        autoCenter: Phaser.Scale.CENTER_BOTH, // 좌우/상하 중앙 정렬
        width: 390,
        height: 844,
        min: {
            width: 320,
            height: 568 // iPhone SE 등 작은 화면
        }
        // max 제거: 큰 화면에서도 자동으로 스케일링
    }
};
