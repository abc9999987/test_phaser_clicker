// 던전 설정 타입
export interface DungeonConfig {
    id: string;
    name: string;
    description: string;
    backgroundImageKey?: string; // 배경 이미지 키 (선택사항, 없으면 단색 배경 사용)
    backgroundColor?: number; // 배경 색상 (기본값: 0x2a2a3a)
}

// 던전 설정 목록
export const DungeonConfigs: DungeonConfig[] = [
    {
        id: 'gold_dungeon',
        name: '골드 던전',
        description: '골드 획득',
        backgroundColor: 0x2a2a3a
    }
];
