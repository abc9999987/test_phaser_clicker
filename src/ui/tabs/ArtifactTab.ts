// 유물 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { ArtifactConfigs, ArtifactConfig } from '../../config/artifactConfig';
import { GameState } from '../../managers/GameState';
import { NumberFormatter } from '../../utils/NumberFormatter';

export interface ArtifactTabState {
    artifactCards: Phaser.GameObjects.Container[];
    scrollContainer: Phaser.GameObjects.Container | null;
    scrollArea: Phaser.GameObjects.Rectangle | null;
    scrollStartY: number;
    scrollStartContainerY: number;
    isScrolling: boolean;
    rubyText: Phaser.GameObjects.Text | null;
}

export const ArtifactTab = {
    // 유물 탭 내용 생성
    createArtifactTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        tabIndex: number,
        state: ArtifactTabState,
        tabContents: Phaser.GameObjects.Container[]
    ): void {
        // 기존 탭 컨텐츠 제거
        if (tabContents[tabIndex]) {
            tabContents[tabIndex].destroy();
            tabContents[tabIndex] = null as any;
        }
        
        // 기존 유물 카드들 제거
        state.artifactCards.forEach(card => card.destroy());
        state.artifactCards = [];
        
        // 기존 스크롤 관련 요소 정리
        if (state.scrollArea) {
            state.scrollArea.destroy();
            state.scrollArea = null;
        }
        
        // 기존 루비 텍스트 정리
        if (state.rubyText) {
            state.rubyText.destroy();
            state.rubyText = null;
        }
        
        const contentContainer = scene.add.container(0, 0);

        // 타이틀
        const titleFontSize = Responsive.getFontSize(scene, 22);
        const titleY = uiAreaStartY + uiAreaHeight * 0.08;
        const titleText = scene.add.text(gameWidth / 2, titleY, '유물', {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        contentContainer.add(titleText);
        
        // 루비 보유량 표시 (타이틀 왼쪽 아래)
        const rubyFontSize = Responsive.getFontSize(scene, 12);
        const rubyX = gameWidth * 0.05; // 화면 왼쪽에서 살짝 떨어진 위치
        const titleFontSizeNum = parseFloat(titleFontSize);
        const rubyY = titleY + titleFontSizeNum * 0.1 + 5; // 타이틀 아래
        state.rubyText = scene.add.text(rubyX, rubyY, `루비: ${NumberFormatter.formatNumber(Math.floor(GameState.rubies))}`, {
            fontSize: rubyFontSize,
            color: '#ff6b9d',
            fontFamily: 'Arial',
            font: `500 ${rubyFontSize} Arial`
        });
        state.rubyText.setOrigin(0, 0); // 왼쪽 정렬
        contentContainer.add(state.rubyText);

        // 스크롤 가능한 영역 정의
        // 탭 버튼 공간을 확보하기 위해 높이를 줄임 (tabHeight = uiAreaHeight * 0.1)
        const scrollAreaStartY = titleY + uiAreaHeight * 0.10;
        const scrollAreaHeight = uiAreaHeight * 0.7; // 탭 버튼 공간 확보를 위해 높이 조정 (0.75 -> 0.6)
        const scrollAreaWidth = gameWidth * 0.95;
        const scrollAreaX = gameWidth / 2;
        
        // 스크롤 영역 (투명한 상호작용 영역)
        // 탭 버튼을 가리지 않도록 상호작용 범위 제한
        state.scrollArea = scene.add.rectangle(
            scrollAreaX,
            scrollAreaStartY + scrollAreaHeight / 2,
            scrollAreaWidth,
            scrollAreaHeight,
            0x000000,
            0
        );
        state.scrollArea.setInteractive({ useHandCursor: true });
        // 스크롤 영역이 다른 요소 위에 있지 않도록 depth 설정
        state.scrollArea.setDepth(0);
        contentContainer.add(state.scrollArea);

        // 유물 카드 생성 (패딩 계산을 위해 먼저 실행)
        const artifactCardWidth = scrollAreaWidth * 0.98;
        const artifactCardHeight = scrollAreaHeight * 0.12;
        const artifactCardSpacing = scrollAreaHeight * 0.02;
        const cardX = 0; // 스크롤 컨테이너 기준 0
        
        // 첫 번째 카드가 잘리지 않도록 상단/하단 패딩 추가
        const topPadding = artifactCardHeight * 0.1;
        const bottomPadding = artifactCardHeight * 0.1;
        
        // 마스크 위치 조정 (상단 패딩을 고려하여 마스크 시작 위치를 아래로 조정)
        const maskStartY = scrollAreaStartY + topPadding;
        const maskHeight = scrollAreaHeight - topPadding - bottomPadding;
        
        // 스크롤 컨테이너 생성 (상단 패딩을 고려하여 위치 조정)
        // 카드가 y=0에서 시작하므로 컨테이너를 topPadding만큼 아래로 이동
        state.scrollContainer = scene.add.container(scrollAreaX, scrollAreaStartY + topPadding);
        
        // 마스크 생성 (스크롤 영역을 벗어나지 않도록)
        // 마스크는 contentContainer 기준으로 생성, 카드 위치에 맞춤
        const maskGraphics = scene.add.graphics();
        // 마스크는 보이지 않지만, 혹시 보일 경우를 대비해 어두운 색상 사용
        maskGraphics.fillStyle(0x1a1a1a); // 어두운 배경색 (카드 배경과 어울림)
        maskGraphics.fillRect(
            scrollAreaX - scrollAreaWidth / 2,
            maskStartY - artifactCardHeight * 0.55,
            scrollAreaWidth,
            maskHeight
        );
        const mask = maskGraphics.createGeometryMask();
        state.scrollContainer.setMask(mask);
        
        // 스크롤 영역 배경 추가 (어울리는 어두운 색상)
        const scrollBackground = scene.add.graphics();
        scrollBackground.fillStyle(0x1a1a1a, 0.8); // 어두운 배경색, 약간 투명
        scrollBackground.fillRoundedRect(
            scrollAreaX - scrollAreaWidth / 2,
            scrollAreaStartY,
            scrollAreaWidth,
            scrollAreaHeight,
            8
        );
        scrollBackground.setDepth(-1); // 마스크와 컨테이너 뒤에 배치
        contentContainer.add(scrollBackground);
        
        contentContainer.add(maskGraphics); // 마스크 그래픽 먼저 추가 (렌더링 순서)
        contentContainer.add(state.scrollContainer);
        
        let currentCardY = 0; // 스크롤 컨테이너 기준 0에서 시작
        
        ArtifactConfigs.forEach((artifactConfig) => {
            const artifactCard = ArtifactTab.createArtifactCard(
                scene,
                artifactConfig,
                cardX,
                currentCardY,
                artifactCardWidth,
                artifactCardHeight
            );
            state.scrollContainer!.add(artifactCard);
            state.artifactCards.push(artifactCard);
            
            currentCardY += artifactCardHeight + artifactCardSpacing;
        });

        // 스크롤 컨테이너의 실제 높이 계산
        const totalCardsHeight = state.artifactCards.length * artifactCardHeight + 
                                 (state.artifactCards.length - 1) * artifactCardSpacing;

        // 스크롤 기능 설정 (조정된 마스크 높이 및 컨테이너 위치 사용)
        ArtifactTab.setupScroll(scene, state, maskHeight, scrollAreaStartY + topPadding, totalCardsHeight);

        tabContents[tabIndex] = contentContainer;
    },
    
    // 개별 유물 카드 생성
    createArtifactCard(
        scene: Phaser.Scene,
        artifactConfig: ArtifactConfig,
        x: number,
        y: number,
        width: number,
        height: number
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        const cardRadius = 12;
        const padding = 10;
        
        // 현재 레벨 (초기값 0, 나중에 GameState와 연동)
        const currentLevel = 0;
        
        // 강화 확률 계산 (maxLevel - 현재 level)
        const upgradeChance = artifactConfig.maxLevel - currentLevel;

        // 카드 배경
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(0x2a2a3a, 0.95);
        cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardBg.lineStyle(2, 0x4a4a5a, 0.8);
        cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardContainer.add(cardBg);

        // 레이아웃: 왼쪽부터 순서대로 배치
        const centerY = 0;
        const itemSpacing = padding * 1.2;
        let currentX = -width / 2 + padding;
        
        // 1. 유물 이미지 (64x64 크기)
        const imageSize = height * 0.7;
        const imageBorderSize = imageSize + padding * 0.8; // 테두리 포함 크기
        const imageX = currentX + imageBorderSize / 2; // 이미지가 들어갈 사각형의 중심 X
        const imageY = centerY;
        
        // 이미지 배경 사각형 (테두리용)
        const imageBg = scene.add.graphics();
        imageBg.fillStyle(0x1a1a1a, 1); // 어두운 배경색
        imageBg.fillRect(
            currentX,
            centerY - imageBorderSize / 2,
            imageBorderSize,
            imageBorderSize
        );
        // 테두리 그리기
        imageBg.lineStyle(2, 0x4a4a5a, 1); // 테두리 색상 (회색)
        imageBg.strokeRect(
            currentX,
            centerY - imageBorderSize / 2,
            imageBorderSize,
            imageBorderSize
        );
        cardContainer.add(imageBg);
        
        // 이미지가 로드되지 않았을 경우를 대비한 처리
        let artifactImage: Phaser.GameObjects.Image;
        
        // imageKey를 사용하여 직접 이미지 로드
        const imageKey = artifactConfig.imageKey;
        
        // 이미지가 존재하는지 확인
        if (scene.textures.exists(imageKey)) {
            // 이미지가 존재하는 경우
            try {
                artifactImage = scene.add.image(imageX, imageY, imageKey);
                artifactImage.setDisplaySize(imageSize, imageSize);
                artifactImage.setOrigin(0.5, 0.5); // 중심 정렬로 변경
            } catch (error) {
                console.error(`[유물 이미지] 이미지 생성 실패: ${imageKey}`, error);
                // 에러 발생 시 기본 이미지 사용
                artifactImage = scene.add.image(imageX, imageY, 'weapon');
                artifactImage.setDisplaySize(imageSize, imageSize);
                artifactImage.setOrigin(0.5, 0.5);
                artifactImage.setTint(0x888888);
            }
        } else {
            // 이미지가 없으면 기본 이미지나 빈 이미지 사용
            console.warn(`유물 이미지를 찾을 수 없습니다: ${imageKey}`);
            artifactImage = scene.add.image(imageX, imageY, 'weapon'); // 기본 이미지 사용
            artifactImage.setDisplaySize(imageSize, imageSize);
            artifactImage.setOrigin(0.5, 0.5);
            artifactImage.setTint(0x888888); // 회색으로 표시
        }
        cardContainer.add(artifactImage);
        currentX += imageBorderSize + itemSpacing; // 테두리 포함 크기만큼 이동

        // 2. 유물 이름
        const nameFontSize = Responsive.getFontSize(scene, 14);
        const nameText = scene.add.text(currentX, centerY, artifactConfig.name, {
            fontSize: nameFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${nameFontSize} Arial`
        });
        nameText.setOrigin(0, 0.5);
        cardContainer.add(nameText);
        currentX += nameText.width + itemSpacing;

        // 3. valueType: value (예: "공격력%: 10")
        const valueFontSize = Responsive.getFontSize(scene, 12);
        const valueText = scene.add.text(currentX, centerY, `${artifactConfig.valueType}: ${artifactConfig.value}`, {
            fontSize: valueFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `500 ${valueFontSize} Arial`
        });
        valueText.setOrigin(0, 0.5);
        cardContainer.add(valueText);
        currentX += valueText.width + itemSpacing;

        // 4. (현재단계/maxLevel) 예: "(0/100)"
        const levelFontSize = Responsive.getFontSize(scene, 12);
        const levelText = scene.add.text(currentX, centerY, `(${currentLevel}/${artifactConfig.maxLevel})`, {
            fontSize: levelFontSize,
            color: '#b0b0b0',
            fontFamily: 'Arial',
            font: `400 ${levelFontSize} Arial`
        });
        levelText.setOrigin(0, 0.5);
        cardContainer.add(levelText);
        currentX += levelText.width + itemSpacing;

        // 5. 강화 확률: n%
        const chanceFontSize = Responsive.getFontSize(scene, 12);
        const chanceText = scene.add.text(currentX, centerY, `${upgradeChance}%`, {
            fontSize: chanceFontSize,
            color: '#90ee90',
            fontFamily: 'Arial',
            font: `500 ${chanceFontSize} Arial`
        });
        chanceText.setOrigin(0, 0.5);
        cardContainer.add(chanceText);
        
        // 6. 강화 버튼 (오른쪽 끝에 배치)
        const buttonWidth = width * 0.12;
        const buttonHeight = height * 0.5;
        const buttonRadius = 8;
        const buttonX = width / 2 - padding - buttonWidth / 2;
        const buttonY = centerY;

        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x4169e1, 1);
        buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        buttonBg.lineStyle(2, 0x5b7ce1, 1);
        buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        buttonBg.setDepth(100);
        cardContainer.add(buttonBg);

        const upgradeButton = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x000000, 0);
        upgradeButton.setInteractive({ useHandCursor: true });
        upgradeButton.setDepth(101);
        
        // 강화 버튼 클릭 이벤트 (나중에 기능 추가 예정)
        upgradeButton.on('pointerdown', () => {
            // TODO: 강화 기능 구현
        });

        upgradeButton.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x5179f1, 1);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x6b8ff1, 1);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });

        upgradeButton.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x4169e1, 1);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, 0x5b7ce1, 1);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
        });

        cardContainer.add(upgradeButton);

        const buttonTextFontSize = Responsive.getFontSize(scene, 11);
        const buttonText = scene.add.text(buttonX, buttonY, '강화', {
            fontSize: buttonTextFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${buttonTextFontSize} Arial`
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(102);
        cardContainer.add(buttonText);

        return cardContainer;
    },
    
    // 스크롤 기능 설정
    setupScroll(
        scene: Phaser.Scene,
        state: ArtifactTabState,
        scrollAreaHeight: number,
        scrollAreaStartY: number,
        totalCardsHeight: number
    ): void {
        if (!state.scrollArea || !state.scrollContainer) return;

        // 최소/최대 스크롤 위치 계산
        // 컨테이너의 시작 위치는 scrollAreaStartY
        const minScrollY = scrollAreaStartY;
        const maxScrollY = totalCardsHeight > scrollAreaHeight 
            ? scrollAreaStartY - (totalCardsHeight - scrollAreaHeight) 
            : scrollAreaStartY;
        
        state.isScrolling = false;
        state.scrollStartY = 0;
        state.scrollStartContainerY = scrollAreaStartY;

        // 스크롤 시작
        state.scrollArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            state.isScrolling = true;
            state.scrollStartY = pointer.y;
            state.scrollStartContainerY = state.scrollContainer!.y;
        });

        // 스크롤 중
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!state.isScrolling || !state.scrollContainer) return;
            if (!pointer.isDown) {
                state.isScrolling = false;
                return;
            }

            const deltaY = pointer.y - state.scrollStartY;
            const newY = state.scrollStartContainerY + deltaY;
            
            // 스크롤 범위 제한
            const clampedY = Math.max(maxScrollY, Math.min(minScrollY, newY));
            state.scrollContainer.y = clampedY;
        });

        // 스크롤 종료
        scene.input.on('pointerup', () => {
            state.isScrolling = false;
        });
    },
    
    // 루비 텍스트 업데이트
    updateRubyText(state: ArtifactTabState): void {
        if (state.rubyText) {
            state.rubyText.setText(`루비: ${NumberFormatter.formatNumber(Math.floor(GameState.rubies))}`);
        }
    }
};
