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

    /**
     * 소탕 기능 활성화 여부
     * true이면 일일 소탕 횟수, 최소 레벨 등의 설정을 사용함
     */
    enableSweep?: boolean;

    /**
     * 일일 소탕 가능 횟수 (던전별로 다르게 설정 가능)
     * 설정되지 않은 경우 소탕 기능이 활성화되어도 기본값(예: 5회)을 사용하는 쪽으로
     * DungeonSweepManager에서 처리할 수 있도록 optional로 둠
     */
    dailySweepLimit?: number;

    /**
     * 소탕 가능 최소 던전 레벨
     * 기본적으로 2레벨 이상부터 소탕 가능하도록 설계
     */
    sweepMinLevel?: number;
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
        enableSweep: true,
        dailySweepLimit: 3,
        sweepMinLevel: 2,
        bossBaseHp: 1000, // 보스 기본 HP
        bossBaseReward: 10000, // 보스 기본 보상
        // 보스 HP 계산 (단계당 1.5배 증가)
        getBossHp: (level: number) => {
            return Math.floor(1000 * Math.pow(1.5, level - 1));
        },
        // 보스 보상 계산 (단계당 1.2배 증가)
        getBossReward: (level: number) => {
            return Math.floor(1000 * Math.pow(1.5, level - 1)) * 100;
        },
        timeLimit: 10 // 10초 내에 보스 처치 필요
        // backgroundImageKey 사용 예시:
        // backgroundImageKey: 'gold_dungeon_bg' // AssetLoader에서 먼저 로드한 이미지 키
    },
    {
        id: 'artifact_dungeon',
        name: '유물 던전',
        description: '단계: ',
        sceneKey: 'ArtifactDungeonScene',
        backgroundColor: 0x2a2a3a,
        enableSweep: true,
        dailySweepLimit: 5,
        sweepMinLevel: 2,
        bossBaseHp: 1000, // 보스 기본 HP
        bossBaseReward: 10000, // 보스 기본 보상 (골드, 현재 미사용 - 나중에 유물 보상 시스템으로 변경 예정)
        // 보스 HP 계산 (단계당 1.5배 증가) - 골드 던전과 동일
        getBossHp: (level: number) => {
            return Math.floor(1000 * Math.pow(1.5, level - 1));
        },
        // 보스 보상 계산 (단계당 1.2배 증가) - 나중에 유물 보상 시스템으로 변경 예정
        getBossReward: (level: number) => {
            return Math.floor(1000 * Math.pow(1.5, level - 1)) * 100;
        },
        timeLimit: 10 // 10초 내에 보스 처치 필요 - 골드 던전과 동일
        // backgroundImageKey 사용 예시:
        // backgroundImageKey: 'artifact_dungeon_bg' // AssetLoader에서 먼저 로드한 이미지 키
    },
    {
        id: 'meat_dungeon',
        name: '고기 던전',
        description: '단계: ',
        sceneKey: 'MeatDungeonScene',
        backgroundColor: 0x2a2a3a,
        enableSweep: true,
        dailySweepLimit: 5,
        sweepMinLevel: 2,
        bossBaseHp: 1000,
        bossBaseReward: 10000,
        /**
         * 고기 던전 보스 HP:
         * - n층 보스 HP = 유물 던전 보스 5n층 HP
         * - 유물/골드 던전과 동일한 공식(1000 * 1.5^(level-1))을 사용하되, level을 5n으로 매핑
         */
        getBossHp: (level: number) => {
            const mappedLevel = level * 5; // 유물 던전 5n층에 해당
            return Math.floor(1000 * Math.pow(1.5, mappedLevel - 1));
        },
        // 보스 보상은 직접 사용하지 않고, DungeonBossReward에서 먹이(고기) 보상으로 처리
        getBossReward: (_level: number) => {
            return 0;
        },
        timeLimit: 10
    }
];
