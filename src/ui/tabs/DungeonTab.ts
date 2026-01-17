// Dungeon 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { DungeonConfigs } from '../../config/dungeonConfig';

export interface DungeonTabState {
    dungeonCards: Phaser.GameObjects.Container[];
}

export const DungeonTab = {
    // Dungeon 탭 내용 생성
    createDungeonTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        tabIndex: number,
        state: DungeonTabState,
        tabContents: Phaser.GameObjects.Container[],
        createDungeonCard: (scene: Phaser.Scene, dungeonConfig: any, x: number, y: number, width: number, height: number) => Phaser.GameObjects.Container
    ): void {
        // 기존 탭 컨텐츠 제거
        if (tabContents[tabIndex]) {
            tabContents[tabIndex].destroy();
            tabContents[tabIndex] = null as any;
        }
        
        // 기존 던전 카드들 제거
        state.dungeonCards.forEach(card => card.destroy());
        
        // 던전 배열 초기화
        state.dungeonCards = [];
        
        const contentContainer = scene.add.container(0, 0);

        // 타이틀
        const titleFontSize = Responsive.getFontSize(scene, 22);
        const titleY = uiAreaStartY + uiAreaHeight * 0.08;
        const titleText = scene.add.text(gameWidth / 2, titleY, '던전', {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        contentContainer.add(titleText);

        // 던전 카드 영역 (세로 배치)
        const dungeonCardStartY = titleY + uiAreaHeight * 0.15;
        const dungeonCardWidth = gameWidth * 0.95;
        const dungeonCardHeight = uiAreaHeight * 0.15; // 한 줄 레이아웃에 맞게 높이 설정
        const dungeonCardSpacing = uiAreaHeight * 0.02; // 세로 간격
        const cardX = gameWidth / 2; // 카드는 중앙 정렬

        // 각 던전에 대해 카드 생성 (세로로 배치)
        DungeonConfigs.forEach((dungeonConfig, index) => {
            const cardY = dungeonCardStartY + index * (dungeonCardHeight + dungeonCardSpacing);
            const dungeonCard = createDungeonCard(scene, dungeonConfig, cardX, cardY, dungeonCardWidth, dungeonCardHeight);
            contentContainer.add(dungeonCard);
            state.dungeonCards.push(dungeonCard);
        });

        tabContents[tabIndex] = contentContainer;
    },
    
    // 개별 던전 카드 생성
    createDungeonCard(
        scene: Phaser.Scene,
        dungeonConfig: any,
        x: number,
        y: number,
        width: number,
        height: number
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        const cardRadius = 12;
        const padding = 10;

        // 카드 배경 (이미지가 있으면 이미지 사용, 없으면 단색 배경)
        const backgroundColor = dungeonConfig.backgroundColor || 0x2a2a3a;
        
        if (dungeonConfig.backgroundImageKey) {
            // 배경 이미지가 있는 경우
            const bgImage = scene.add.image(0, 0, dungeonConfig.backgroundImageKey);
            bgImage.setDisplaySize(width, height);
            bgImage.setOrigin(0.5, 0.5);
            // 이미지가 카드 높이를 유지하도록 설정
            const imageScale = height / bgImage.height;
            bgImage.setScale(imageScale);
            cardContainer.add(bgImage);
            
            // 이미지 위에 반투명 레이어 추가 (텍스트 가독성 향상)
            const overlay = scene.add.graphics();
            overlay.fillStyle(0x000000, 0.3);
            overlay.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
            cardContainer.add(overlay);
        } else {
            // 단색 배경 사용
            const cardBg = scene.add.graphics();
            cardBg.fillStyle(backgroundColor, 0.95);
            cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
            cardBg.lineStyle(2, 0x4a4a5a, 0.8);
            cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
            cardContainer.add(cardBg);
        }

        // 한 줄 레이아웃: Name / descText / statusText / 입장 버튼 (가로 일렬 배치)
        const centerY = 0;
        const itemSpacing = padding * 1.5; // 요소 간 간격
        
        // 1. nameText (왼쪽)
        const nameFontSize = Responsive.getFontSize(scene, 14);
        const nameX = -width / 2 + padding;
        const nameText = scene.add.text(nameX, centerY, dungeonConfig.name, {
            fontSize: nameFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${nameFontSize} Arial`
        });
        nameText.setOrigin(0, 0.5);
        cardContainer.add(nameText);

        // 버튼 영역 계산
        const buttonWidth = width * 0.15;
        const buttonAreaWidth = buttonWidth + padding; // 버튼 + 오른쪽 패딩
        
        // 2. descText (nameText 다음, 버튼 영역을 고려한 최대 너비)
        const descFontSize = Responsive.getFontSize(scene, 10);
        const nameTextWidth = nameText.width;
        const descX = nameX + nameTextWidth + itemSpacing;
        // 현재 던전 단계 가져오기
        const dungeonLevel = GameState.getDungeonLevel(dungeonConfig.id);
        const descriptionText = `${dungeonConfig.description} (Lv.${dungeonLevel})`;
        const descText = scene.add.text(descX, centerY, descriptionText, {
            fontSize: descFontSize,
            color: '#b0b0b0',
            fontFamily: 'Arial',
            font: `400 ${descFontSize} Arial`
        });
        descText.setOrigin(0, 0.5);
        // descText가 버튼 영역과 겹치지 않도록 최대 너비 제한
        const maxDescWidth = width / 2 - descX - buttonAreaWidth - itemSpacing * 2;
        if (descText.width > maxDescWidth && maxDescWidth > 0) {
            descText.setWordWrapWidth(maxDescWidth);
        }
        cardContainer.add(descText);

        // 3. statusText (descText 다음, 오른쪽 끝에 배치)
        const statusFontSize = Responsive.getFontSize(scene, 12);
        const descTextWidth = descText.width;
        const statusX = descX + descTextWidth + itemSpacing;
        const statusText = scene.add.text(statusX, centerY, '무제한', {
            fontSize: statusFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `500 ${statusFontSize} Arial`
        });
        statusText.setOrigin(0, 0.5);
        cardContainer.add(statusText);

        // 4. 입장 버튼 (카드 오른쪽 끝에 배치)
        const buttonHeight = height * 0.5;
        const buttonRadius = 8;
        const buttonX = width / 2 - padding * 0.5 - buttonWidth / 2;
        const buttonY = centerY;

        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x50c878, 1);
        buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        buttonBg.lineStyle(2, 0x6ad888, 1);
        buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        buttonBg.setDepth(100); // 다른 요소 위에 표시
        cardContainer.add(buttonBg);

        const enterButton = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x000000, 0);
        enterButton.setInteractive({ useHandCursor: true });
        enterButton.setDepth(101); // 버튼 배경 위에 표시
        
        const dungeonId = dungeonConfig.id;
        const sceneKey = dungeonConfig.sceneKey;
        enterButton.on('pointerdown', () => {
            // 던전 씬으로 전환
            if (sceneKey) {
                scene.scene.start(sceneKey, { dungeonConfig: dungeonConfig });
            } else {
                console.error(`던전 씬 키가 설정되지 않았습니다: ${dungeonId}`);
            }
        });

        enterButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x60d888, 1);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x7ae898, 1);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });

        enterButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x50c878, 1);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x6ad888, 1);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });

        cardContainer.add(enterButton);

        const buttonTextFontSize = Responsive.getFontSize(scene, 11);
        const buttonText = scene.add.text(buttonX, buttonY, '입장', {
            fontSize: buttonTextFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${buttonTextFontSize} Arial`
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(102); // 버튼 위에 표시
        cardContainer.add(buttonText);

        return cardContainer;
    }
};
