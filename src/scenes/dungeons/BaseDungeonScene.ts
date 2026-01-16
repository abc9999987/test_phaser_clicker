import Phaser from 'phaser';
import { DungeonConfig } from '../../config/dungeonConfig';
import { Responsive } from '../../utils/Responsive';

// 던전 씬 베이스 클래스
export abstract class BaseDungeonScene extends Phaser.Scene {
    protected dungeonConfig: DungeonConfig | null = null;
    protected backButton: Phaser.GameObjects.Rectangle | null = null;
    protected backButtonText: Phaser.GameObjects.Text | null = null;
    
    constructor(key: string) {
        super({ key });
    }
    
    // 던전 설정 설정
    setDungeonConfig(config: DungeonConfig): void {
        this.dungeonConfig = config;
    }
    
    // 던전 설정 가져오기
    getDungeonConfig(): DungeonConfig | null {
        return this.dungeonConfig;
    }
    
    init(data?: { dungeonConfig: DungeonConfig }): void {
        // 던전 설정이 전달되면 저장
        if (data?.dungeonConfig) {
            this.setDungeonConfig(data.dungeonConfig);
        }
    }
    
    preload(): void {
        // 던전별 에셋 로드는 각 씬에서 구현
        this.loadDungeonAssets();
    }
    
    create(): void {
        // 배경 설정
        this.setupBackground();
        
        // 뒤로가기 버튼 생성
        this.createBackButton();
        
        // 던전별 초기화는 각 씬에서 구현
        this.initializeDungeon();
    }
    
    // 배경 설정
    protected setupBackground(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        
        if (this.dungeonConfig?.backgroundImageKey) {
            // 배경 이미지가 있으면 이미지 사용
            const bgImage = this.add.image(gameWidth / 2, gameHeight / 2, this.dungeonConfig.backgroundImageKey);
            bgImage.setDisplaySize(gameWidth, gameHeight);
            bgImage.setOrigin(0.5, 0.5);
        } else {
            // 단색 배경 사용
            const backgroundColor = this.dungeonConfig?.backgroundColor || 0x1a1a1a;
            this.cameras.main.setBackgroundColor(backgroundColor);
        }
    }
    
    // 뒤로가기 버튼 생성
    protected createBackButton(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;
        const buttonWidth = gameWidth * 0.2;
        const buttonHeight = gameHeight * 0.06;
        const buttonX = gameWidth * 0.1;
        const buttonY = gameHeight * 0.1;
        const buttonRadius = 8;
        
        // 버튼 배경
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x4a4a4a, 1);
        buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        buttonBg.lineStyle(2, 0x6a6a6a, 1);
        buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        
        // 버튼 (상호작용용)
        this.backButton = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x000000, 0);
        this.backButton.setInteractive({ useHandCursor: true });
        
        this.backButton.on('pointerdown', () => {
            this.returnToMainScene();
        });
        
        this.backButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x5a5a5a, 1);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x7a7a7a, 1);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });
        
        this.backButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x4a4a4a, 1);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x6a6a6a, 1);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });
        
        // 버튼 텍스트
        const buttonFontSize = Responsive.getFontSize(this, 14);
        this.backButtonText = this.add.text(buttonX, buttonY, '← 뒤로', {
            fontSize: buttonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${buttonFontSize} Arial`
        });
        this.backButtonText.setOrigin(0.5);
    }
    
    // 메인 씬으로 돌아가기
    protected returnToMainScene(): void {
        this.scene.start('GameScene');
    }
    
    // 던전별 에셋 로드 (각 씬에서 구현)
    protected abstract loadDungeonAssets(): void;
    
    // 던전별 초기화 (각 씬에서 구현)
    protected abstract initializeDungeon(): void;
}
