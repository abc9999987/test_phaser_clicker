import Phaser from 'phaser';

export enum SkillType {
    ATTACK = 1,
    BUFF = 2,
}
// 스킬 설정 타입
export interface SkillConfig {
    id: string;
    name: string;
    skillType: SkillType;
    cooldown: number; // 초 단위
    duration?: number; // 지속 시간 (초 단위) BUFF 타입일 경우에만 사용함.
    skillPower: number; // Skill 배수, ATTACK 타입일 경우 스킬의 데미지 배수, BUFF 타입일 경우 해당하는 능력치를 증가시켜주는 배수로 사용함.
    spCost: number; // 습득에 필요한 SP
    maxLevel?: number; // 최대 레벨 (선택사항, 없으면 레벨 업그레이드 불가)
    spUpgradeCost?: number; // 레벨 업그레이드에 필요한 SP
}

// 스킬 설정 목록
export const SkillConfigs: SkillConfig[] = [
    {
        id: 'big_k_fish_bread',
        name: '붕어빵테오',
        cooldown: 3,
        skillType: SkillType.ATTACK,
        skillPower: 20,
        spCost: 1  // 습득에 필요한 SP
    },
    {
        id: 'buff_attack_damage',
        name: '분노',
        skillType: SkillType.BUFF,
        cooldown: 10,
        duration: 10,
        skillPower: 3,
        spCost: 1,
        maxLevel: 3, // 최대 레벨 3
        spUpgradeCost: 3,
    },
    {
        id: 'buff_anchovy_shot',
        name: '멸치샷',
        skillType: SkillType.BUFF,
        cooldown: 20,
        duration: 10,
        skillPower: 2,
        spCost: 3   
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
