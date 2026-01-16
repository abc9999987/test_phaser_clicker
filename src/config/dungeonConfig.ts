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
    // 보스 정보
    bossBaseHp: number; // 보스 기본 HP
    bossBaseReward: number; // 보스 기본 보상 (골드)
    /**
     * 보스 HP 계산 함수 (던전 단계에 따라 HP 증가)
     * @param level 던전 단계
     * @returns 보스 HP
     */
    getBossHp?: (level: number) => number;
    /**
     * 보스 보상 계산 함수 (던전 단계에 따라 보상 증가)
     * @param level 던전 단계
     * @returns 보상 골드
     */
    getBossReward?: (level: number) => number;
    /**
     * 던전 타이머 제한 시간 (초 단위, 선택사항)
     * 설정되어 있으면 해당 시간 내에 보스를 처치해야 함
     * 시간 내에 처치하지 못하면 실패 처리
     */
    timeLimit?: number;
}

// 던전 설정 목록
export const DungeonConfigs: DungeonConfig[] = [
    {
        id: 'gold_dungeon',
        name: '골드 던전',
        description: '단계: ',
        sceneKey: 'GoldDungeonScene',
        backgroundColor: 0x2a2a3a,
        bossBaseHp: 1000, // 보스 기본 HP
        bossBaseReward: 10000, // 보스 기본 보상
        // 보스 HP 계산 (단계당 1.5배 증가)
        getBossHp: (level: number) => {
            return Math.floor(1000 * Math.pow(1.5, level - 1));
        },
        // 보스 보상 계산 (단계당 1.2배 증가)
        getBossReward: (level: number) => {
            return Math.floor(1000 * Math.pow(1.5, level - 1)) * 50;
        },
        timeLimit: 10 // 10초 내에 보스 처치 필요
        // backgroundImageKey 사용 예시:
        // backgroundImageKey: 'gold_dungeon_bg' // AssetLoader에서 먼저 로드한 이미지 키
    }
];
