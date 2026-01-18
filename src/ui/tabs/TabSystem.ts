// 탭 시스템 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';

export interface TabSystemState {
    tabs: Phaser.GameObjects.Rectangle[];
    tabTexts: Phaser.GameObjects.Text[];
    tabContents: Phaser.GameObjects.Container[];
    activeTabIndex: number;
}

export const TabSystem = {
    // 탭 시스템 생성
    createTabs(
        scene: Phaser.Scene,
        gameWidth: number,
        gameHeight: number,
        uiAreaHeight: number,
        state: TabSystemState,
        onTabSwitch: (tabIndex: number) => void
    ): void {
        const tabCount = 5;
        const tabWidth = gameWidth / tabCount;
        const tabHeight = uiAreaHeight * 0.1;
        const tabY = gameHeight - tabHeight * 0.5 - 5; // 화면 최하단에서 약간 위로
        
        state.tabs = [];
        state.tabTexts = [];
        state.tabContents = [];
        
        const tabLabels = ['Stats', 'Upgrade', 'Skill', '던전', '유물'];
        const tabFontSize = Responsive.getFontSize(scene, 12);
        
        for (let i = 0; i < tabCount; i++) {
            const tabX = tabWidth * i + tabWidth / 2;
            
            // 탭 배경 (둥근 모서리를 위해 원형 사용하거나, 그래픽으로 그리기)
            const tabBg = scene.add.graphics();
            const tabBgWidth = tabWidth * 0.92;
            const tabBgHeight = tabHeight * 0.85;
            const cornerRadius = 12;
            
            // 비활성 탭 스타일 (어두운 배경, 부드러운 색상)
            tabBg.fillStyle(0x1e1e2e, 0.95);
            tabBg.fillRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
            tabBg.lineStyle(1.5, 0x3a3a4a, 0.8);
            tabBg.strokeRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
            
            // 그림자 효과 (약간 어둡게)
            const shadow = scene.add.graphics();
            shadow.fillStyle(0x000000, 0.3);
            shadow.fillRoundedRect(tabX - tabBgWidth / 2 + 2, tabY - tabBgHeight / 2 + 2, tabBgWidth, tabBgHeight, cornerRadius);
            shadow.setDepth(-1);
            
            // 탭 버튼 (상호작용용 투명 영역)
            const tab = scene.add.rectangle(tabX, tabY, tabBgWidth, tabBgHeight, 0x000000, 0);
            tab.setInteractive({ useHandCursor: true });
            
            const tabIndex = i;
            tab.on('pointerdown', () => {
                onTabSwitch(tabIndex);
            });
            
            // 호버 효과
            tab.on('pointerover', () => {
                if (tabIndex !== state.activeTabIndex) {
                    tabBg.clear();
                    tabBg.fillStyle(0x2a2a3a, 0.95);
                    tabBg.fillRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
                    tabBg.lineStyle(1.5, 0x4a4a5a, 0.8);
                    tabBg.strokeRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
                }
            });
            
            tab.on('pointerout', () => {
                if (tabIndex !== state.activeTabIndex) {
                    tabBg.clear();
                    tabBg.fillStyle(0x1e1e2e, 0.95);
                    tabBg.fillRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
                    tabBg.lineStyle(1.5, 0x3a3a4a, 0.8);
                    tabBg.strokeRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
                }
            });
            
            // 탭 텍스트
            const tabText = scene.add.text(tabX, tabY, tabLabels[i], {
                fontSize: tabFontSize,
                color: '#9ca3af',
                fontFamily: 'Arial',
                font: `500 ${tabFontSize} Arial`
            });
            tabText.setOrigin(0.5);
            
            // 탭 요소들을 배열에 저장 (tabBg, shadow, tab, tabText)
            state.tabs.push({ bg: tabBg, shadow: shadow, interactive: tab, text: tabText } as any);
            state.tabTexts.push(tabText);
            state.tabContents.push(null as any); // 나중에 설정
        }
    },
    
    // 탭 전환
    switchTab(
        tabIndex: number,
        state: TabSystemState
    ): void {
        state.activeTabIndex = tabIndex;
        
        // 모든 탭 내용 숨기기
        state.tabContents.forEach((content, index) => {
            if (content) {
                content.setVisible(index === tabIndex);
            }
        });
        
        // 탭 버튼 스타일 업데이트
        state.tabs.forEach((tabObj: any, index) => {
            const tabBg = tabObj.bg;
            const tabText = state.tabTexts[index];
            const tabWidth = tabBg.width || 78;
            const tabHeight = tabBg.height || 42;
            const cornerRadius = 12;
            
            tabBg.clear();
            
            if (index === tabIndex) {
                // 활성 탭 - 그라데이션 효과 (파란색 계열)
                const x = tabObj.interactive.x;
                const y = tabObj.interactive.y;
                
                // 배경 (밝은 파란색)
                tabBg.fillStyle(0x4f7cff, 1);
                tabBg.fillRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, cornerRadius);
                
                // 상단 하이라이트
                tabBg.fillStyle(0x6b9fff, 0.6);
                tabBg.fillRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight * 0.4, cornerRadius);
                
                // 테두리 (밝은 파란색)
                tabBg.lineStyle(2, 0x7ab3ff, 1);
                tabBg.strokeRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, cornerRadius);
                
                if (tabText) {
                    tabText.setColor('#ffffff');
                    tabText.setStyle({ font: `600 ${tabText.style.fontSize} Arial` });
                }
            } else {
                // 비활성 탭
                const x = tabObj.interactive.x;
                const y = tabObj.interactive.y;
                
                tabBg.fillStyle(0x1e1e2e, 0.95);
                tabBg.fillRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, cornerRadius);
                tabBg.lineStyle(1.5, 0x3a3a4a, 0.8);
                tabBg.strokeRoundedRect(x - tabWidth / 2, y - tabHeight / 2, tabWidth, tabHeight, cornerRadius);
                
                if (tabText) {
                    tabText.setColor('#9ca3af');
                    tabText.setStyle({ font: `500 ${tabText.style.fontSize} Arial` });
                }
            }
        });
    }
};
