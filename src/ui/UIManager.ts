import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';
import { GameState } from '../managers/GameState';

// UI 관리자
export const UIManager = {
    coinText: null as Phaser.GameObjects.Text | null,
    autoFireText: null as Phaser.GameObjects.Text | null,
    clickButton: null as Phaser.GameObjects.Rectangle | null,
    upgradeButton: null as Phaser.GameObjects.Rectangle | null,
    clickButtonText: null as Phaser.GameObjects.Text | null,
    upgradeButtonText: null as Phaser.GameObjects.Text | null,
    stageText: null as Phaser.GameObjects.Text | null,
    killCountText: null as Phaser.GameObjects.Text | null,
    bossTimerText: null as Phaser.GameObjects.Text | null,
    
    // UI 생성 (아래쪽 절반 영역에 배치)
    create(scene: Phaser.Scene): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const halfHeight = gameHeight * 0.5; // 화면 절반 지점
        const uiAreaHeight = gameHeight * 0.5; // 아래쪽 절반 영역 높이
        const uiAreaStartY = halfHeight; // UI 영역 시작 Y 위치
        
        // 스테이지 표시 (화면 위쪽 중앙)
        const stageFontSize = Responsive.getFontSize(scene, 32);
        this.stageText = scene.add.text(gameWidth / 2, gameHeight * 0.08, GameState.getStageString(), {
            fontSize: stageFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.stageText.setOrigin(0.5);
        
        // 처치 카운트 표시 (스테이지 바로 아래)
        const killCountFontSize = Responsive.getFontSize(scene, 18);
        this.killCountText = scene.add.text(gameWidth / 2, gameHeight * 0.11, '', {
            fontSize: killCountFontSize,
            color: '#e8e8e8',
            fontFamily: 'Arial'
        });
        this.killCountText.setOrigin(0.5);
        
        // 보스 타이머 표시 (화면 상단, 보스 스테이지일 때만 표시)
        const timerFontSize = Responsive.getFontSize(scene, 24);
        this.bossTimerText = scene.add.text(gameWidth / 2, gameHeight * 0.02, '', {
            fontSize: timerFontSize,
            color: '#ff4444',
            fontFamily: 'Arial',
            font: `bold ${timerFontSize} Arial`,
            stroke: '#000000',
            strokeThickness: 3
        });
        this.bossTimerText.setOrigin(0.5);
        this.bossTimerText.setVisible(false); // 기본적으로 숨김
        
        // 구분선 (위쪽 절반과 아래쪽 절반 구분)
        const dividerLine = scene.add.line(0, 0, 0, halfHeight, gameWidth, halfHeight, 0xffffff, 0.3);
        dividerLine.setOrigin(0, 0);
        dividerLine.setLineWidth(2);
        
        // UI 패널 배경 (아래쪽 절반 전체)
        const uiPanel = scene.add.rectangle(gameWidth / 2, halfHeight + uiAreaHeight / 2, gameWidth * 0.98, uiAreaHeight * 0.95, 0x1a1a1a, 0.9);
        uiPanel.setOrigin(0.5, 0.5);
        
        // 코인 텍스트 (아래쪽 절반 상단)
        const coinFontSize = Responsive.getFontSize(scene, 28);
        const coinY = uiAreaStartY + uiAreaHeight * 0.15;
        this.coinText = scene.add.text(gameWidth * 0.05, coinY, `코인: ${GameState.coins}`, {
            fontSize: coinFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `bold ${coinFontSize} Arial`
        });
        
        // 공격 속도 텍스트 (코인 아래)
        const attackSpeedFontSize = Responsive.getFontSize(scene, 20);
        const attackSpeedY = coinY + uiAreaHeight * 0.12;
        this.autoFireText = scene.add.text(gameWidth * 0.05, attackSpeedY, `공격 속도: ${GameState.attackSpeed}/초`, {
            fontSize: attackSpeedFontSize,
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // 공격력 텍스트 (공격 속도 아래)
        const attackPowerFontSize = Responsive.getFontSize(scene, 20);
        const attackPowerY = attackSpeedY + uiAreaHeight * 0.12;
        const attackPowerText = scene.add.text(gameWidth * 0.05, attackPowerY, `공격력: ${GameState.attackPower}`, {
            fontSize: attackPowerFontSize,
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        (this as any).attackPowerText = attackPowerText;
        
        // 공격력 강화 버튼 (아래쪽 절반 중앙 왼쪽)
        const buttonWidth = gameWidth * 0.42;
        const buttonHeight = uiAreaHeight * 0.12;
        const buttonY = uiAreaStartY + uiAreaHeight * 0.5;
        const leftButtonX = gameWidth * 0.25;
        
        this.clickButton = scene.add.rectangle(leftButtonX, buttonY, buttonWidth, buttonHeight, 0x4a90e2);
        this.clickButton.setInteractive({ useHandCursor: true });
        this.clickButton.on('pointerdown', () => {
            if (GameState.upgradeAttackPower()) {
                this.update();
            }
        });
        
        const buttonFontSize = Responsive.getFontSize(scene, 18);
        this.clickButtonText = scene.add.text(leftButtonX, buttonY, '공격력 강화', {
            fontSize: buttonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `bold ${buttonFontSize} Arial`
        });
        this.clickButtonText.setOrigin(0.5);
        
        // 비용 표시 (버튼 아래)
        const costFontSize = Responsive.getFontSize(scene, 14);
        const clickCostText = scene.add.text(leftButtonX, buttonY + buttonHeight * 0.6, '', {
            fontSize: costFontSize,
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        clickCostText.setOrigin(0.5);
        
        // 공격 속도 강화 버튼 (아래쪽 절반 중앙 오른쪽)
        const rightButtonX = gameWidth * 0.75;
        this.upgradeButton = scene.add.rectangle(rightButtonX, buttonY, buttonWidth, buttonHeight, 0x50c878);
        this.upgradeButton.setInteractive({ useHandCursor: true });
        this.upgradeButton.on('pointerdown', () => {
            if (GameState.upgradeAttackSpeed()) {
                this.update();
                // 공격 속도 타이머 재설정
                if ((scene as any).setupAutoFire) {
                    (scene as any).setupAutoFire();
                }
            }
        });
        
        this.upgradeButtonText = scene.add.text(rightButtonX, buttonY, '공격 속도 강화', {
            fontSize: buttonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `bold ${buttonFontSize} Arial`
        });
        this.upgradeButtonText.setOrigin(0.5);
        
        // 비용 표시 (버튼 아래)
        const autoCostText = scene.add.text(rightButtonX, buttonY + buttonHeight * 0.6, '', {
            fontSize: costFontSize,
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        autoCostText.setOrigin(0.5);
        
        // 비용 텍스트 업데이트 함수 저장
        (this as any).clickCostText = clickCostText;
        (this as any).autoCostText = autoCostText;
        
        // 초기 UI 업데이트
        this.update();
    },
    
    // UI 업데이트
    update(scene?: Phaser.Scene): void {
        // 스테이지 표시 업데이트
        if (this.stageText) {
            this.stageText.setText(GameState.getStageString());
        }
        
        // 처치 카운트 표시 업데이트
        if (this.killCountText) {
            this.killCountText.setText(`다음 스테이지까지: ${GameState.killsInCurrentStage}/10 처치`);
        }
        
        // 보스 타이머 업데이트
        if (this.bossTimerText && scene) {
            const isBossStage = GameState.isBossStage();
            this.bossTimerText.setVisible(isBossStage);
            
            if (isBossStage && (scene as any).bossTimer && (scene as any).bossTimerStartTime !== undefined) {
                const elapsed = scene.time.now - (scene as any).bossTimerStartTime;
                const remaining = Math.max(0, 15000 - elapsed);
                const seconds = Math.ceil(remaining / 1000);
                
                // 5초 이하면 빨간색, 아니면 주황색
                const color = seconds <= 5 ? '#ff0000' : '#ff8800';
                this.bossTimerText.setColor(color);
                this.bossTimerText.setText(`보스 타이머: ${seconds}초`);
            } else {
                this.bossTimerText.setVisible(false);
            }
        }
        
        if (this.coinText) {
            this.coinText.setText(`코인: ${Math.floor(GameState.coins)}`);
        }
        
        if (this.autoFireText) {
            this.autoFireText.setText(`공격 속도: ${GameState.attackSpeed}/초`);
        }
        
        // 공격력 텍스트 업데이트
        if ((this as any).attackPowerText) {
            (this as any).attackPowerText.setText(`공격력: ${GameState.attackPower}`);
        }
        
        // 버튼 색상 및 비용 업데이트 (구매 가능 여부)
        if (this.clickButton) {
            const attackPowerCost = GameState.getAttackPowerUpgradeCost();
            this.clickButton.setFillStyle(
                GameState.coins >= attackPowerCost ? 0x4a90e2 : 0x666666
            );
            
            // 비용 텍스트 업데이트
            if ((this as any).clickCostText) {
                (this as any).clickCostText.setText(`비용: ${attackPowerCost} 코인`);
            }
        }
        
        if (this.upgradeButton) {
            const attackSpeedCost = GameState.getAttackSpeedUpgradeCost();
            this.upgradeButton.setFillStyle(
                GameState.coins >= attackSpeedCost ? 0x50c878 : 0x666666
            );
            
            // 비용 텍스트 업데이트
            if ((this as any).autoCostText) {
                (this as any).autoCostText.setText(`비용: ${attackSpeedCost} 코인`);
            }
        }
    }
};
