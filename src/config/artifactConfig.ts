// 유물 설정 타입
export interface ArtifactConfig {
    id: number; // 유물 고유 ID
    name: string; // 유물 이름
    attackPower: number; // 공격력 보너스
    attackSpeed: number; // 공격 속도 보너스
    critChance: number; // 치명타 확률 보너스
    critDamage: number; // 치명타 데미지 보너스
    spriteKey: string; // Phaser에서 사용할 스프라이트 키 (예: 'item_gold_set_0')
    spriteSheetKey: string; // 스프라이트시트 이미지 키 (예: 'item_gold_set')
    spriteFrameIndex: number; // 스프라이트시트 내 프레임 인덱스 (0부터 시작)
}

// 유물 설정 목록
// 왼쪽 위부터 오른쪽으로:
// 1행: 0, 1, 2, 3
// 2행: 4, 5, 6, 7
// 3행: 8, 9, 10, 11
export const ArtifactConfigs: ArtifactConfig[] = [
    {
        id: 1,
        name: '유물 1',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_0',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 0
    },
    {
        id: 2,
        name: '유물 2',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_1',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 1
    },
    {
        id: 3,
        name: '유물 3',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_2',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 2
    },
    {
        id: 4,
        name: '유물 4',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_3',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 3
    },
    {
        id: 5,
        name: '유물 5',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_4',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 4
    },
    {
        id: 6,
        name: '유물 6',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_5',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 5
    },
    {
        id: 7,
        name: '유물 7',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_6',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 6
    },
    {
        id: 8,
        name: '유물 8',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_7',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 7
    },
    {
        id: 9,
        name: '유물 9',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_8',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 8
    },
    {
        id: 10,
        name: '유물 10',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_9',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 9
    },
    {
        id: 11,
        name: '유물 11',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_10',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 10
    },
    {
        id: 12,
        name: '유물 12',
        attackPower: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        spriteKey: 'item_gold_set_11',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 11
    }
];
