// 알 뽑기 설정
export interface EggGachaConfig {
    id: number; // 알 뽑기 고유 ID (1~5)
    type: EggGachaType; // 알 뽑기 타입
}

export enum EggGachaType {
    Pet = 'pet',
    AttackPower = '공격력%',
    AttackSpeed = '공격속도',
    CritDamage = '치명타데미지',
    AddGoldRate = '코인획득량'
}

// 알 뽑기 설정 목록
export const EggGachaConfigs: EggGachaConfig[] = [
    {
        id: 1,
        type: EggGachaType.Pet
    },
    {
        id: 2,
        type: EggGachaType.AttackPower
    },
    {
        id: 3,
        type: EggGachaType.AttackSpeed
    },
    {
        id: 4,
        type: EggGachaType.CritDamage
    },
    {
        id: 5,
        type: EggGachaType.AddGoldRate
    }
];
