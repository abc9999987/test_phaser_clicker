// Stats 상세 팝업 설정
import { GameState } from '../managers/GameState';
import { GameStateCore } from '../managers/state/GameStateCore';
import { NumberFormatter } from '../utils/NumberFormatter';
import { ArtifactConfigs } from './artifactConfig';
import { EggGachaConfigs } from './eggGachaConfig';

export interface StatsDetailItem {
    label: string;                    // "공격 속도", "공격력" 등
    getDisplayValue: () => string;     // 이미 포맷된 문자열 반환 (예: "15/초", "1,234")
}

export const STATS_DETAIL_ITEMS: StatsDetailItem[] = [
    // {
    //     label: '작업 중',
    //     getDisplayValue: () => '추가 예정입니다.'
    // },
    {
        label: '공격력',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameState.getBaseAttackPower())}`
    },
    {
        label: '유물 공격력',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameState.getArtifactLevel(1) * ArtifactConfigs[0].value)}%`
    },
    {
        label: '알 공격력',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameState.getEggGachaCount(EggGachaConfigs[1].id) * (EggGachaConfigs[1].value as number))}%`
    },
    {
        label: '알 공격력2',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameState.getEggGachaCount(EggGachaConfigs[2].id) * (EggGachaConfigs[2].value as number))}%`
    },
    {
        label: '펫 공격력',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameState.getEggGachaCount(EggGachaConfigs[0].id) * (EggGachaConfigs[0].value as number))}%`
    },
    {
        label: '공격 속도',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameStateCore.attackSpeed)}`
    },
    {
        label: '유물 공격 속도',
        getDisplayValue: () => `${NumberFormatter.formatNumber((GameState.getArtifactLevel(2) * ArtifactConfigs[1].value))}`
    },
    {
        label: '치명타 확률',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameStateCore.critChance)}%`
    },
    {
        label: '유물 치명타 확률',
        getDisplayValue: () => `${NumberFormatter.formatNumber((GameState.getArtifactLevel(3) * ArtifactConfigs[2].value))}%`
    },
    {
        label: '치명타데미지',
        getDisplayValue: () => `${NumberFormatter.formatNumber(GameStateCore.critDamage)}%`
    },
    {
        label: '유물 치명타데미지',
        getDisplayValue: () => `${NumberFormatter.formatNumber((GameState.getArtifactLevel(4) * ArtifactConfigs[3].value))}%`
    },
    {
        label: '알 치명타데미지',
        getDisplayValue: () => `${NumberFormatter.formatNumber((GameState.getEggGachaCount(EggGachaConfigs[3].id) * (EggGachaConfigs[3].value as number)))}%`
    },
    {
        label: '유물 코인 획득량',
        getDisplayValue: () => `${NumberFormatter.formatNumber((GameState.getArtifactLevel(5) * ArtifactConfigs[4].value))}%`
    },
    {
        label: '알 코인 획득량',
        getDisplayValue: () => `${NumberFormatter.formatNumber((GameState.getEggGachaCount(EggGachaConfigs[4].id) * (EggGachaConfigs[4].value as number)))}%`
    },
    // {
    //     label: '',
    //     getDisplayValue: () => `${NumberFormatter.formatNumber()}%`
    // },
];
