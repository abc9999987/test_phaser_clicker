// 유물설정 타입
export interface ArtifactConfig {
    id: number; // 유물고유 ID
    name: string; // 유물이름
    value: number; // 유물 능력치 값
    valueType: ArtifactValueType; // 유물 능력치 타입
    spriteKey: string; // Phaser에서 사용할 스프라이트 키 (예: 'item_gold_set_0')
    spriteSheetKey: string; // 스프라이트시트 이미지 키 (예: 'item_gold_set')
    spriteFrameIndex: number; // 스프라이트시트 내 프레임 인덱스 (0부터 시작)
    maxLevel: number; // 유물 최대 레벨
}

export enum ArtifactValueType {
    AttackPower = '공격력%',
    AttackSpeed = '공격속도',
    CritChance = '치명타확률',
    CritDamage = '치명타데미지',
}

// 유물설정 목록
// 왼쪽 위부터 오른쪽으로:
// 1행: 0, 1, 2, 3
// 2행: 4, 5, 6, 7
// 3행: 8, 9, 10, 11
export const ArtifactConfigs: ArtifactConfig[] = [
    {
        id: 1,
        name: '유물1',
        value: 10,
        valueType: ArtifactValueType.AttackPower,
        spriteKey: 'item_gold_set_0',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 0,
        maxLevel: 100
    },
    {
        id: 2,
        name: '유물2',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_1',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 1,
        maxLevel: 100
    },
    {
        id: 3,
        name: '유물3',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_2',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 2,
        maxLevel: 100
    },
    {
        id: 4,
        name: '유물4',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_3',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 3,
        maxLevel: 100
    },
    {
        id: 5,
        name: '유물5',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_4',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 4,
        maxLevel: 100
    },
    {
        id: 6,
        name: '유물6',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_5',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 5,
        maxLevel: 100
    },
    {
        id: 7,
        name: '유물7',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_6',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 6,
        maxLevel: 100
    },
    {
        id: 8,
        name: '유물8',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_7',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 7,
        maxLevel: 100
    },
    {
        id: 9,
        name: '유물9',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_8',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 8,
        maxLevel: 100
    },
    {
        id: 10,
        name: '유물10',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_9',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 9,
        maxLevel: 100
    },
    {
        id: 11,
        name: '유물11',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_10',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 10,
        maxLevel: 100
    },
    {
        id: 12,
        name: '유물12',
        value: 10,
        valueType: ArtifactValueType.AttackSpeed,
        spriteKey: 'item_gold_set_11',
        spriteSheetKey: 'item_gold_set',
        spriteFrameIndex: 11,
        maxLevel: 100
    }
];
