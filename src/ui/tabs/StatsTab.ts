// Stats 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { STATS_ITEMS, StatsItem } from '../../config/statsTabConfig';

export interface StatsTabState {
    statCards: Phaser.GameObjects.Container[];  // 각 스탯 카드 컨테이너 배열
    statTexts: Phaser.GameObjects.Text[];       // 각 스탯 값 텍스트 배열
}

export const StatsTab = {
    // Stats 탭 내용 생성 (내 정보)
    createStatsTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        state: StatsTabState,
        tabContents: Phaser.GameObjects.Container[]
    ): void {
        const contentContainer = scene.add.container(0, 0);
        
        // 타이틀
        const titleFontSize = Responsive.getFontSize(scene, 22);
        const titleY = uiAreaStartY + uiAreaHeight * 0.1;
        const titleText = scene.add.text(gameWidth / 2, titleY, '내 정보', {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        contentContainer.add(titleText);
        
        // 카드 레이아웃 설정
        const cardsPerRow = 2;  // 2열 그리드
        const cardSpacing = gameWidth * 0.03;  // 카드 간 간격
        const horizontalPadding = gameWidth * 0.08;  // 좌우 여백
        const availableWidth = gameWidth - (horizontalPadding * 2);
        const cardWidth = (availableWidth - cardSpacing) / cardsPerRow;
        const cardHeight = uiAreaHeight * 0.12;
        const cardRadius = 12;
        
        // 카드 시작 위치
        const startX = horizontalPadding + cardWidth / 2;
        const startY = titleY + uiAreaHeight * 0.15;
        
        // 상태 초기화
        state.statCards = [];
        state.statTexts = [];
        
        // Config 배열을 순회하며 카드 생성
        STATS_ITEMS.forEach((item: StatsItem, index: number) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            
            const cardX = startX + col * (cardWidth + cardSpacing);
            const cardY = startY + row * (cardHeight + cardSpacing);
            
            // 카드 컨테이너 생성
            const cardContainer = scene.add.container(cardX, cardY);
            
            // 그림자 효과 (약한 어두운 영역) - 먼저 추가하여 배경 뒤에 배치
            const shadow = scene.add.graphics();
            shadow.fillStyle(0x000000, 0.3);
            shadow.fillRoundedRect(-cardWidth / 2 + 2, -cardHeight / 2 + 2, cardWidth, cardHeight, cardRadius);
            cardContainer.add(shadow);
            
            // 카드 배경
            const cardBg = scene.add.graphics();
            cardBg.fillStyle(0x2a2a3a, 1);
            cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, cardRadius);
            
            // 테두리
            cardBg.lineStyle(2, 0x4a4a5a, 1);
            cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, cardRadius);
            cardContainer.add(cardBg);
            
            // 라벨 텍스트 (작은 폰트, 회색)
            const labelFontSize = Responsive.getFontSize(scene, 14);
            const labelText = scene.add.text(0, -cardHeight * 0.25, item.label, {
                fontSize: labelFontSize,
                color: '#aaaaaa',
                fontFamily: 'Arial',
                font: `500 ${labelFontSize} Arial`
            });
            labelText.setOrigin(0.5);
            cardContainer.add(labelText);
            
            // 값 텍스트 (큰 폰트, 흰색, 굵게)
            const valueFontSize = Responsive.getFontSize(scene, 18);
            const valueText = scene.add.text(0, cardHeight * 0.15, item.getDisplayValue(), {
                fontSize: valueFontSize,
                color: '#ffffff',
                fontFamily: 'Arial',
                font: `600 ${valueFontSize} Arial`
            });
            valueText.setOrigin(0.5);
            cardContainer.add(valueText);
            
            // 상태에 저장
            state.statCards.push(cardContainer);
            state.statTexts.push(valueText);
            
            contentContainer.add(cardContainer);
        });
        
        tabContents[0] = contentContainer;
    },
    
    // Stats 탭 업데이트
    update(
        state: StatsTabState,
        activeTabIndex: number
    ): void {
        // Stats 탭이 활성화되어 있을 때만 업데이트
        if (activeTabIndex !== 0) return;
        
        // Config 배열을 순회하며 각 텍스트 업데이트
        STATS_ITEMS.forEach((item: StatsItem, index: number) => {
            const valueText = state.statTexts[index];
            if (valueText && valueText.active) {
                valueText.setText(item.getDisplayValue());
            }
        });
    }
};
