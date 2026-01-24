// 알 뽑기 설정
export interface EggGachaConfig {
    id: number; // 알 뽑기 고유 ID (1~5)
    type: EggGachaType; // 알 뽑기 타입
    value: number;
    text: string;
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
        type: EggGachaType.Pet,
        value: 200,
        text: '1. 보유 시 멸치샷 쿨타임\n절반으로 감소\n2. 펫 공격력 증가 200%'
    },
    {
        id: 2,
        type: EggGachaType.AttackPower,
        value: 20,
        text: '알 공격력 증가 20%'
    },
    {
        id: 3,
        type: EggGachaType.AttackPower2,
        value: 20,
        text: '알 공격력2 증가 20%'
    },
    {
        id: 4,
        type: EggGachaType.CritDamage,
        value: 20,
        text: '알 치명타데미지 증가 20%'
    },
    {
        id: 5,
        type: EggGachaType.AddGoldRate,
        value: 20,
        text: '알 코인획득량 증가 20%'
    }
];
