// 공통 UI 요소 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { NumberFormatter } from '../../utils/NumberFormatter';

// 공통 UI 상태 인터페이스
export interface CommonUIState {
    coinText: Phaser.GameObjects.Text | null;
    stageText: Phaser.GameObjects.Text | null;
    killCountText: Phaser.GameObjects.Text | null;
    bossTimerText: Phaser.GameObjects.Text | null;
    dungeonTimerText: Phaser.GameObjects.Text | null;
    activeTabIndex: number;
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
        
        // 골드 텍스트 (화면 상단 좌측)
        const coinFontSize = Responsive.getFontSize(scene, 18);
        state.coinText = scene.add.text(gameWidth * 0.01, halfHeight - gameHeight * 0.027, `코인: ${NumberFormatter.formatNumber(Math.floor(GameState.coins))}`, {
            fontSize: coinFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${coinFontSize} Arial`,
            stroke: '#b8860b',
            strokeThickness: 1
        });
        
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
        
        // 골드 텍스트 (화면 상단 좌측)
        const coinFontSize = Responsive.getFontSize(scene, 24);
        state.coinText = scene.add.text(gameWidth * 0.03, halfHeight - gameHeight * 0.035, `코인: ${NumberFormatter.formatNumber(Math.floor(GameState.coins))}`, {
            fontSize: coinFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${coinFontSize} Arial`,
            stroke: '#b8860b',
            strokeThickness: 1
        });
        
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
            state.killCountText.setText(`다음 스테이지까지: ${GameState.killsInCurrentStage}/10 처치`);
        }
        
        // 보스 타이머 업데이트
        if (state.bossTimerText && scene) {
            const isBossStage = GameState.isBossStage();
            state.bossTimerText.setVisible(isBossStage);
            
            if (isBossStage && (scene as any).bossTimer && (scene as any).bossTimerStartTime !== undefined) {
                const elapsed = scene.time.now - (scene as any).bossTimerStartTime;
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
            state.coinText.setText(`코인: ${NumberFormatter.formatNumber(Math.floor(GameState.coins))}`);
        }
    }
};
