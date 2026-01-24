// 알 뽑기 설정
export interface EggGachaConfig {
    id: number; // 알 뽑기 고유 ID (1~5)
    type: EggGachaType; // 알 뽑기 타입
    value?: number;
}

export enum EggGachaType {
    Pet = '펫',
    AttackPower = '알 공격력%',
    AttackPower2 = '알 공격력2%',
    AttackSpeed = '알 공격속도',
    CritDamage = '알 치명타데미지',
    AddGoldRate = '알 코인획득량'
}

// 알 뽑기 설정 목록
export const EggGachaConfigs: EggGachaConfig[] = [
    {
        id: 1,
        type: EggGachaType.Pet
    },
    {
        id: 2,
        type: EggGachaType.AttackPower,
        value: 20,
    },
    {
        id: 3,
        type: EggGachaType.AttackPower2,
        value: 20,
    },
    {
        id: 4,
        type: EggGachaType.CritDamage,
        value: 20,
    },
    {
        id: 5,
        type: EggGachaType.AddGoldRate,
        value: 20,
    }
];
