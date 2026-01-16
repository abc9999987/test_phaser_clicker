// 던전 설정 타입
export interface DungeonConfig {
    id: string;
    name: string;
    description: string;
    sceneKey: string; // 던전 씬의 Phaser 씬 키 (예: 'GoldDungeonScene')
    /**
     * 배경 이미지 키 (선택사항, 없으면 단색 배경 사용)
     * 
     * 사용 방법:
     * 1. AssetLoader.preload() 또는 AssetLoader.loadPNGImage()에서 이미지를 먼저 로드해야 합니다.
     *    예: scene.load.image('gold_dungeon_bg', 'assets/dungeon/gold_dungeon_bg.png');
     * 
     * 2. 이 키를 backgroundImageKey에 설정합니다.
     *    예: backgroundImageKey: 'gold_dungeon_bg'
     * 
     * 3. 이미지가 설정되면 카드 배경으로 사용되며, 카드 높이는 유지됩니다.
     */
    backgroundImageKey?: string;
    backgroundColor?: number; // 배경 색상 (기본값: 0x2a2a3a)
}

// 던전 설정 목록
export const DungeonConfigs: DungeonConfig[] = [
    {
        id: 'gold_dungeon',
        name: '골드 던전',
        description: '골드 획득',
        sceneKey: 'GoldDungeonScene',
        backgroundColor: 0x2a2a3a
        // backgroundImageKey 사용 예시:
        // backgroundImageKey: 'gold_dungeon_bg' // AssetLoader에서 먼저 로드한 이미지 키
    }
];
