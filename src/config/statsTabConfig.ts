// Stats 탭 설정
import { GameState } from '../managers/GameState';
import { NumberFormatter } from '../utils/NumberFormatter';

export interface StatsItem {
    label: string;                    // "공격 속도", "공격력" 등
    getDisplayValue: () => string;     // 이미 포맷된 문자열 반환 (예: "15/초", "1,234")
}

export const STATS_ITEMS: StatsItem[] = [
    {
        label: '공격 속도',
        getDisplayValue: () => `${GameState.getAttackSpeedValue()}/초`
    },
    {
        label: '공격력',
        getDisplayValue: () => NumberFormatter.formatNumber(GameState.getAttackPowerValue())
    },
    {
        label: '치명타 확률',
        getDisplayValue: () => `${GameState.getCritChanceValue()}%`
    },
    {
        label: '치명타 데미지',
        getDisplayValue: () => `${GameState.getCritDamageValue()}%`
    },
    {
        label: '코인 획득량',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameState.getGoldRateValue())}%`
    }
];
