import { BaseDungeonScene } from './BaseDungeonScene';
import { Responsive } from '../../utils/Responsive';

// 골드 던전 씬
export class GoldDungeonScene extends BaseDungeonScene {
    constructor() {
        super('GoldDungeonScene');
    }
    
    // 던전별 에셋 로드
    protected loadDungeonAssets(): void {
        // 골드 던전 전용 에셋이 있으면 여기서 로드
        // 예: this.load.image('gold_dungeon_bg', 'assets/dungeon/gold_dungeon_bg.png');
    }
    
    // 던전별 초기화
    protected initializeDungeon(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        
        // 골드 던전 타이틀
        const titleFontSize = Responsive.getFontSize(this, 32);
        const titleText = this.add.text(gameWidth / 2, gameHeight * 0.2, '골드 던전', {
            fontSize: titleFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `bold ${titleFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 4
        });
        titleText.setOrigin(0.5);
        
        // 골드 던전 설명
        const descFontSize = Responsive.getFontSize(this, 18);
        const descText = this.add.text(gameWidth / 2, gameHeight * 0.3, '골드를 획득할 수 있는 던전입니다.', {
            fontSize: descFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `500 ${descFontSize} Arial`
        });
        descText.setOrigin(0.5);
        
        // 추후 골드 던전 전용 로직 추가 예정
    }
}
