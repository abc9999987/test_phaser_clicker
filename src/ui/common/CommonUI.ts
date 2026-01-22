// 공통 UI 요소 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { NumberFormatter } from '../../utils/NumberFormatter';
import { MenuPopup, MenuPopupState } from '../menu/MenuPopup';
import { FeatureMenuPopup, FeatureMenuPopupState } from '../feature/FeatureMenuPopup';

// 공통 UI 상태 인터페이스
export interface CommonUIState {
    coinText: Phaser.GameObjects.Text | null;
    rubyText: Phaser.GameObjects.Text | null;
    meatText: Phaser.GameObjects.Text | null;
    stageText: Phaser.GameObjects.Text | null;
    killCountText: Phaser.GameObjects.Text | null;
    bossTimerText: Phaser.GameObjects.Text | null;
    dungeonTimerText: Phaser.GameObjects.Text | null;
    activeTabIndex: number;
    menuPopupState: MenuPopupState;
    featureMenuPopupState: FeatureMenuPopupState;
}

// 공통 UI 생성 및 업데이트
export const CommonUI = {
    // 공통 UI 요소 생성 (메인 씬용)
    createCommonElements(
        scene: Phaser.Scene,
        state: CommonUIState
    ): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const halfHeight = gameHeight * 0.5;
        
        // 스테이지 표시 (화면 위쪽 중앙)
        const stageFontSize = Responsive.getFontSize(scene, 32);
        state.stageText = scene.add.text(gameWidth / 2, gameHeight * 0.08, GameState.getStageString(), {
            fontSize: stageFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        state.stageText.setOrigin(0.5);
        
        // 처치 카운트 표시 (스테이지 바로 아래)
        const killCountFontSize = Responsive.getFontSize(scene, 18);
        state.killCountText = scene.add.text(gameWidth / 2, gameHeight * 0.11, '', {
            fontSize: killCountFontSize,
            color: '#e8e8e8',
            fontFamily: 'Arial'
        });
        state.killCountText.setOrigin(0.5);

        // 화면 우상단 자원 표시 (골드 / 루비 / 고기)
        const resourceFontSize = Responsive.getFontSize(scene, 16); // 예: '16px'
        const numericResourceFontSize = parseFloat(resourceFontSize); // 아이콘 크기 계산용 숫자 값
        const baseY = gameHeight * 0.072;
        const marginRight = gameWidth * 0.95;
        const rowSpacing = numericResourceFontSize * 1.1;
        const iconSize = numericResourceFontSize * 0.9;
        const innerSpacing = 4;

        // 먼저 텍스트 객체를 생성 (x는 나중에 재배치)
        state.coinText = scene.add.text(0, baseY, NumberFormatter.formatNumber(Math.floor(GameState.coins)), {
            fontSize: resourceFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${resourceFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 2
        });
        state.coinText.setOrigin(0, 0.5);

        state.rubyText = scene.add.text(0, baseY, NumberFormatter.formatNumber(Math.floor(GameState.rubies)), {
            fontSize: resourceFontSize,
            color: '#ff6b9d',
            fontFamily: 'Arial',
            font: `600 ${resourceFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 2
        });
        state.rubyText.setOrigin(0, 0.5);

        state.meatText = scene.add.text(0, baseY, NumberFormatter.formatNumber(Math.floor(GameState.meat)), {
            fontSize: resourceFontSize,
            color: '#ffb366',
            fontFamily: 'Arial',
            font: `600 ${resourceFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 2
        });
        state.meatText.setOrigin(0, 0.5);

        // 아이콘(간단한 벡터) + 텍스트 세로 정렬
        const baseX = gameWidth - marginRight;

        // 골드 (맨 위)
        const coinIconX = baseX - iconSize / 2;
        const coinIcon = scene.add.circle(coinIconX, baseY, iconSize / 2, 0xffd700);
        coinIcon.setStrokeStyle(2, 0xb8860b, 1);
        state.coinText.x = baseX + innerSpacing;

        // 루비 (중간)
        const rubyY = baseY + rowSpacing;
        const rubyIconX = baseX - iconSize / 2;
        const rubyIcon = scene.add.circle(rubyIconX, rubyY, iconSize / 2, 0xff6b9d);
        rubyIcon.setStrokeStyle(2, 0xb03060, 1);
        state.rubyText.y = rubyY;
        state.rubyText.x = baseX + innerSpacing;

        // 고기 (맨 아래)
        const meatY = baseY + rowSpacing * 2;
        const meatIconX = baseX - iconSize / 2;
        const meatIcon = scene.add.circle(meatIconX, meatY, iconSize / 2, 0xcc4c39);
        meatIcon.setStrokeStyle(2, 0x5a2018, 1);
        state.meatText.y = meatY;
        state.meatText.x = baseX + innerSpacing;
        
        // 보스 타이머 표시 (화면 상단 중앙, 보스 스테이지일 때만 표시)
        const timerFontSize = Responsive.getFontSize(scene, 24);
        state.bossTimerText = scene.add.text(gameWidth / 2, gameHeight * 0.04, '', {
            fontSize: timerFontSize,
            color: '#ff4444',
            fontFamily: 'Arial',
            font: `bold ${timerFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 3
        });
        state.bossTimerText.setOrigin(0.5);
        state.bossTimerText.setVisible(false); // 기본적으로 숨김
        
        // 구분선 (위쪽 절반과 아래쪽 절반 구분)
        const dividerLine = scene.add.line(0, 0, 0, halfHeight, gameWidth, halfHeight, 0xffffff, 0.3);
        dividerLine.setOrigin(0, 0);
        dividerLine.setLineWidth(2);
        
        // UI 패널 배경 (아래쪽 절반 전체)
        const uiAreaHeight = gameHeight * 0.5;
        const uiPanel = scene.add.rectangle(gameWidth / 2, halfHeight + uiAreaHeight / 2, gameWidth * 0.98, uiAreaHeight * 0.95, 0x1a1a1a, 0.9);
        uiPanel.setOrigin(0.5, 0.5);
        
        // 메뉴 버튼 생성
        MenuPopup.createMenuButton(scene, state.menuPopupState);
        
        // Feature 버튼 생성
        FeatureMenuPopup.createFeatureButton(scene, state.featureMenuPopupState);
    },
    
    // 공통 UI 요소 생성 (던전 씬용)
    createForDungeon(
        scene: Phaser.Scene,
        dungeonName: string,
        dungeonLevel: number,
        state: CommonUIState
    ): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const halfHeight = gameHeight * 0.5;
        
        // 던전 정보 표시 (화면 위쪽 중앙)
        const stageFontSize = Responsive.getFontSize(scene, 32);
        state.stageText = scene.add.text(gameWidth / 2, gameHeight * 0.08, `${dungeonName} Lv.${dungeonLevel}`, {
            fontSize: stageFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        state.stageText.setOrigin(0.5);
        
        // 처치 카운트 표시는 던전에서는 사용하지 않으므로 null로 설정
        state.killCountText = null;
        
        // 던전 타이머 표시 (화면 상단 중앙, 타이머가 설정된 경우에만 표시)
        const timerFontSize = Responsive.getFontSize(scene, 24);
        state.dungeonTimerText = scene.add.text(gameWidth / 2, gameHeight * 0.04, '', {
            fontSize: timerFontSize,
            color: '#ff4444',
            fontFamily: 'Arial',
            font: `bold ${timerFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 3
        });
        state.dungeonTimerText.setOrigin(0.5);
        state.dungeonTimerText.setVisible(false); // 기본적으로 숨김

        // 던전 씬에서도 동일한 우상단 자원 표시 사용
        const resourceFontSize = Responsive.getFontSize(scene, 18);
        const numericResourceFontSize = parseFloat(resourceFontSize);
        const baseY = halfHeight - gameHeight * 0.035;
        const marginRight = gameWidth * 0.02;
        const rowSpacing = numericResourceFontSize * 1.1;
        const iconSize = numericResourceFontSize * 0.9;
        const innerSpacing = 4;

        state.coinText = scene.add.text(0, baseY, NumberFormatter.formatNumber(Math.floor(GameState.coins)), {
            fontSize: resourceFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${resourceFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 2
        });
        state.coinText.setOrigin(0, 0.5);

        state.rubyText = scene.add.text(0, baseY, NumberFormatter.formatNumber(Math.floor(GameState.rubies)), {
            fontSize: resourceFontSize,
            color: '#ff6b9d',
            fontFamily: 'Arial',
            font: `600 ${resourceFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 2
        });
        state.rubyText.setOrigin(0, 0.5);

        state.meatText = scene.add.text(0, baseY, NumberFormatter.formatNumber(Math.floor(GameState.meat)), {
            fontSize: resourceFontSize,
            color: '#ffb366',
            fontFamily: 'Arial',
            font: `600 ${resourceFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 2
        });
        state.meatText.setOrigin(0, 0.5);

        const baseX = gameWidth - marginRight;

        // 골드 (맨 위)
        const coinIconX = baseX - iconSize / 2;
        const coinIcon = scene.add.circle(coinIconX, baseY, iconSize / 2, 0xffd700);
        coinIcon.setStrokeStyle(2, 0xb8860b, 1);
        state.coinText.x = baseX + innerSpacing;

        // 루비 (중간)
        const rubyY = baseY + rowSpacing;
        const rubyIconX = baseX - iconSize / 2;
        const rubyIcon = scene.add.circle(rubyIconX, rubyY, iconSize / 2, 0xff6b9d);
        rubyIcon.setStrokeStyle(2, 0xb03060, 1);
        state.rubyText.y = rubyY;
        state.rubyText.x = baseX + innerSpacing;

        // 고기 (맨 아래)
        const meatY = baseY + rowSpacing * 2;
        const meatIconX = baseX - iconSize / 2;
        const meatIcon = scene.add.circle(meatIconX, meatY, iconSize / 2, 0xcc4c39);
        meatIcon.setStrokeStyle(2, 0x5a2018, 1);
        state.meatText.y = meatY;
        state.meatText.x = baseX + innerSpacing;
        
        // 보스 타이머 표시는 던전에서는 사용하지 않으므로 null로 설정
        state.bossTimerText = null;
        
        // 구분선 (위쪽 절반과 아래쪽 절반 구분)
        const dividerLine = scene.add.line(0, 0, 0, halfHeight, gameWidth, halfHeight, 0xffffff, 0.3);
        dividerLine.setOrigin(0, 0);
        dividerLine.setLineWidth(2);
        
        // UI 패널 배경 (아래쪽 절반 전체)
        const uiAreaHeight = gameHeight * 0.5;
        const uiPanel = scene.add.rectangle(gameWidth / 2, halfHeight + uiAreaHeight / 2, gameWidth * 0.98, uiAreaHeight * 0.95, 0x1a1a1a, 0.9);
        uiPanel.setOrigin(0.5, 0.5);
    },
    
    // 공통 UI 업데이트
    update(
        scene: Phaser.Scene | undefined,
        state: CommonUIState
    ): void {
        // 스테이지 표시 업데이트
        if (state.stageText) {
            state.stageText.setText(GameState.getStageString());
        }
        
        // 처치 카운트 표시 업데이트 (던전 씬에서는 null일 수 있음)
        if (state.killCountText) {
            state.killCountText.setText(`${GameState.killsInCurrentStage}/10 처치`);
        }
        
        // 보스 타이머 업데이트
        if (state.bossTimerText && scene) {
            const isBossStage = GameState.isBossStage();
            const gameScene: any = scene as any;
            const bossTimer = gameScene.bossTimer;

            if (isBossStage && bossTimer && typeof bossTimer.getElapsed === 'function') {
                state.bossTimerText.setVisible(true);

                // 타이머 이벤트 자체의 경과 시간을 기준으로 남은 시간 계산
                const elapsed = bossTimer.getElapsed();
                const remaining = Math.max(0, 15000 - elapsed);
                const seconds = Math.ceil(remaining / 1000);
                
                // 5초 이하면 빨간색, 아니면 주황색
                const color = seconds <= 5 ? '#ff0000' : '#ff8800';
                state.bossTimerText.setColor(color);
                state.bossTimerText.setText(`보스 타이머: ${seconds}초`);
            } else {
                state.bossTimerText.setVisible(false);
            }
        }
        
        // 던전 타이머 업데이트
        if (state.dungeonTimerText && scene) {
            const dungeonTimer = (scene as any).dungeonTimer;
            const dungeonConfig = (scene as any).getDungeonConfig ? (scene as any).getDungeonConfig() : null;
            
            // 타이머가 존재하고 활성화되어 있으면 표시
            if (dungeonTimer && dungeonTimer.getElapsed !== undefined && dungeonConfig && dungeonConfig.timeLimit) {
                // 타이머의 경과 시간을 직접 가져옴 (더 정확함)
                const elapsed = dungeonTimer.getElapsed();
                const remaining = Math.max(0, dungeonConfig.timeLimit * 1000 - elapsed);
                const seconds = Math.floor(remaining / 1000);
                
                state.dungeonTimerText.setVisible(true);
                
                // 5초 이하면 빨간색, 아니면 주황색
                const color = seconds <= 5 ? '#ff0000' : '#ff8800';
                state.dungeonTimerText.setColor(color);
                state.dungeonTimerText.setText(`던전 타이머: ${seconds}초`);
            } else {
                state.dungeonTimerText.setVisible(false);
            }
        }
        
        // 골드 텍스트 업데이트 (화면 상단 좌측)
        if (state.coinText) {
            state.coinText.setText(NumberFormatter.formatNumber(Math.floor(GameState.coins)));
        }
        
        // 루비 텍스트 업데이트
        if (state.rubyText) {
            state.rubyText.setText(NumberFormatter.formatNumber(Math.floor(GameState.rubies)));
        }

        // 고기 텍스트 업데이트
        if (state.meatText) {
            state.meatText.setText(NumberFormatter.formatNumber(Math.floor(GameState.meat)));
        }
    }
};
