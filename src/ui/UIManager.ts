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
    tabs: [] as Phaser.GameObjects.Rectangle[],
    tabTexts: [] as Phaser.GameObjects.Text[],
    tabContents: [] as Phaser.GameObjects.Container[],
    activeTabIndex: 0,
    
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
        
        // 골드 텍스트 (화면 상단 좌측)
        const coinFontSize = Responsive.getFontSize(scene, 24);
        this.coinText = scene.add.text(gameWidth * 0.03, halfHeight - gameHeight * 0.035, `코인: ${GameState.coins}`, {
            fontSize: coinFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${coinFontSize} Arial`,
            stroke: '#b8860b',
            strokeThickness: 1
        });
        
        // 보스 타이머 표시 (화면 상단 중앙, 보스 스테이지일 때만 표시)
        const timerFontSize = Responsive.getFontSize(scene, 24);
        this.bossTimerText = scene.add.text(gameWidth / 2, gameHeight * 0.04, '', {
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
        
        // 탭 시스템 생성
        this.createTabs(scene, gameWidth, gameHeight, halfHeight, uiAreaHeight, uiAreaStartY);
        
        // 첫 번째 탭 (Stats - 내 정보) 내용 생성
        this.createStatsTab(scene, gameWidth, gameHeight, halfHeight, uiAreaHeight, uiAreaStartY);
        
        // 두 번째 탭 (Upgrade) 내용 생성
        this.createUpgradeTab(scene, gameWidth, gameHeight, halfHeight, uiAreaHeight, uiAreaStartY);
        
        // 나머지 탭 (Lock) 내용 생성
        for (let i = 2; i < 5; i++) {
            this.createLockTab(scene, gameWidth, gameHeight, halfHeight, uiAreaHeight, uiAreaStartY, i);
        }
        
        // 초기 탭 활성화 (Stats 탭)
        this.switchTab(0);
        
        // 초기 UI 업데이트
        this.update();
    },
    
    // 탭 시스템 생성
    createTabs(scene: Phaser.Scene, gameWidth: number, gameHeight: number, _halfHeight: number, uiAreaHeight: number, _uiAreaStartY: number): void {
        const tabCount = 5;
        const tabWidth = gameWidth / tabCount;
        const tabHeight = uiAreaHeight * 0.1;
        const tabY = gameHeight - tabHeight * 0.5 - 5; // 화면 최하단에서 약간 위로
        
        this.tabs = [];
        this.tabTexts = [];
        this.tabContents = [];
        
        const tabLabels = ['Stats', 'Upgrade', 'Lock', 'Lock', 'Lock'];
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
                this.switchTab(tabIndex);
            });
            
            // 호버 효과
            tab.on('pointerover', () => {
                if (tabIndex !== this.activeTabIndex) {
                    tabBg.clear();
                    tabBg.fillStyle(0x2a2a3a, 0.95);
                    tabBg.fillRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
                    tabBg.lineStyle(1.5, 0x4a4a5a, 0.8);
                    tabBg.strokeRoundedRect(tabX - tabBgWidth / 2, tabY - tabBgHeight / 2, tabBgWidth, tabBgHeight, cornerRadius);
                }
            });
            
            tab.on('pointerout', () => {
                if (tabIndex !== this.activeTabIndex) {
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
            this.tabs.push({ bg: tabBg, shadow: shadow, interactive: tab, text: tabText } as any);
            this.tabTexts.push(tabText);
            this.tabContents.push(null as any); // 나중에 설정
        }
    },
    
    // Stats 탭 내용 생성 (내 정보)
    createStatsTab(scene: Phaser.Scene, gameWidth: number, _gameHeight: number, _halfHeight: number, uiAreaHeight: number, uiAreaStartY: number): void {
        const contentContainer = scene.add.container(0, 0);
        
        // 타이틀
        const titleFontSize = Responsive.getFontSize(scene, 22);
        const titleY = uiAreaStartY + uiAreaHeight * 0.15;
        const titleText = scene.add.text(gameWidth / 2, titleY, '내 정보', {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        contentContainer.add(titleText);
        
        // 공격 속도 텍스트
        const attackSpeedFontSize = Responsive.getFontSize(scene, 20);
        const attackSpeedY = titleY + uiAreaHeight * 0.15;
        this.autoFireText = scene.add.text(gameWidth * 0.1, attackSpeedY, `공격 속도: ${GameState.attackSpeed}/초`, {
            fontSize: attackSpeedFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${attackSpeedFontSize} Arial`
        });
        contentContainer.add(this.autoFireText);
        
        // 공격력 텍스트
        const attackPowerFontSize = Responsive.getFontSize(scene, 20);
        const attackPowerY = attackSpeedY + uiAreaHeight * 0.12;
        const attackPowerText = scene.add.text(gameWidth * 0.1, attackPowerY, `공격력: ${GameState.attackPower}`, {
            fontSize: attackPowerFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${attackPowerFontSize} Arial`
        });
        (this as any).attackPowerText = attackPowerText;
        contentContainer.add(attackPowerText);
        
        this.tabContents[0] = contentContainer;
    },
    
    // Upgrade 탭 내용 생성
    createUpgradeTab(scene: Phaser.Scene, gameWidth: number, _gameHeight: number, _halfHeight: number, uiAreaHeight: number, uiAreaStartY: number): void {
        const contentContainer = scene.add.container(0, 0);
        
        const baseY = uiAreaStartY + uiAreaHeight * 0.2;
        const rowHeight = uiAreaHeight * 0.15;
        const buttonRadius = 12;
        const x1ButtonWidth = 50;
        const x1ButtonHeight = 35;
        
        // 공격력 강화 행
        const attackPowerY = baseY;
        const attackPowerStartX = gameWidth * 0.1;
        const attackPowerButtonX = gameWidth * 0.85;
        
        // 공격력 강화 전체 텍스트 (공격력 (8 -> 9) 비용: 123456)
        const attackPowerFontSize = Responsive.getFontSize(scene, 18);
        const clickFullText = scene.add.text(attackPowerStartX, attackPowerY, '', {
            fontSize: attackPowerFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${attackPowerFontSize} Arial`
        });
        clickFullText.setOrigin(0, 0.5);
        contentContainer.add(clickFullText);
        (this as any).clickFullText = clickFullText;
        
        // x1 버튼 배경
        const leftButtonBg = scene.add.graphics();
        leftButtonBg.fillStyle(0x4a90e2, 1);
        leftButtonBg.fillRoundedRect(attackPowerButtonX - x1ButtonWidth / 2, attackPowerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        leftButtonBg.lineStyle(2, 0x6ab0ff, 1);
        leftButtonBg.strokeRoundedRect(attackPowerButtonX - x1ButtonWidth / 2, attackPowerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        contentContainer.add(leftButtonBg);
        
        // x1 버튼 그림자
        const leftButtonShadow = scene.add.graphics();
        leftButtonShadow.fillStyle(0x000000, 0.2);
        leftButtonShadow.fillRoundedRect(attackPowerButtonX - x1ButtonWidth / 2 + 2, attackPowerY - x1ButtonHeight / 2 + 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        leftButtonShadow.setDepth(-1);
        contentContainer.add(leftButtonShadow);
        
        // x1 버튼 (상호작용용)
        this.clickButton = scene.add.rectangle(attackPowerButtonX, attackPowerY, x1ButtonWidth, x1ButtonHeight, 0x000000, 0);
        this.clickButton.setInteractive({ useHandCursor: true });
        this.clickButton.on('pointerdown', () => {
            if (GameState.upgradeAttackPower()) {
                this.update();
            }
        });
        this.clickButton.on('pointerover', () => {
            leftButtonBg.clear();
            leftButtonBg.fillStyle(0x5a9fff, 1);
            leftButtonBg.fillRoundedRect(attackPowerButtonX - x1ButtonWidth / 2, attackPowerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            leftButtonBg.lineStyle(2, 0x7ab3ff, 1);
            leftButtonBg.strokeRoundedRect(attackPowerButtonX - x1ButtonWidth / 2, attackPowerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        this.clickButton.on('pointerout', () => {
            leftButtonBg.clear();
            const canAfford = GameState.coins >= GameState.getAttackPowerUpgradeCost();
            leftButtonBg.fillStyle(canAfford ? 0x4a90e2 : 0x555555, canAfford ? 1 : 0.8);
            leftButtonBg.fillRoundedRect(attackPowerButtonX - x1ButtonWidth / 2, attackPowerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            leftButtonBg.lineStyle(2, canAfford ? 0x6ab0ff : 0x666666, canAfford ? 1 : 0.8);
            leftButtonBg.strokeRoundedRect(attackPowerButtonX - x1ButtonWidth / 2, attackPowerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        contentContainer.add(this.clickButton);
        (this as any).leftButtonBg = leftButtonBg;
        
        // x1 버튼 텍스트
        const x1ButtonFontSize = Responsive.getFontSize(scene, 14);
        this.clickButtonText = scene.add.text(attackPowerButtonX, attackPowerY, 'x1', {
            fontSize: x1ButtonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${x1ButtonFontSize} Arial`
        });
        this.clickButtonText.setOrigin(0.5);
        contentContainer.add(this.clickButtonText);
        
        // 공격 속도 강화 행
        const attackSpeedY = baseY + rowHeight;
        const attackSpeedStartX = gameWidth * 0.1;
        const attackSpeedButtonX = gameWidth * 0.85;
        
        // 공격 속도 강화 전체 텍스트 (공격속도 (8 -> 9) 비용: 123456)
        const attackSpeedFontSize = Responsive.getFontSize(scene, 18);
        const autoFullText = scene.add.text(attackSpeedStartX, attackSpeedY, '', {
            fontSize: attackSpeedFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${attackSpeedFontSize} Arial`
        });
        autoFullText.setOrigin(0, 0.5);
        contentContainer.add(autoFullText);
        (this as any).autoFullText = autoFullText;
        
        // x1 버튼 배경
        const rightButtonBg = scene.add.graphics();
        rightButtonBg.fillStyle(0x50c878, 1);
        rightButtonBg.fillRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        rightButtonBg.lineStyle(2, 0x6ad888, 1);
        rightButtonBg.strokeRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        contentContainer.add(rightButtonBg);
        
        // x1 버튼 그림자
        const rightButtonShadow = scene.add.graphics();
        rightButtonShadow.fillStyle(0x000000, 0.2);
        rightButtonShadow.fillRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2 + 2, attackSpeedY - x1ButtonHeight / 2 + 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        rightButtonShadow.setDepth(-1);
        contentContainer.add(rightButtonShadow);
        
        // x1 버튼 (상호작용용)
        this.upgradeButton = scene.add.rectangle(attackSpeedButtonX, attackSpeedY, x1ButtonWidth, x1ButtonHeight, 0x000000, 0);
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
        this.upgradeButton.on('pointerover', () => {
            rightButtonBg.clear();
            rightButtonBg.fillStyle(0x60d888, 1);
            rightButtonBg.fillRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            rightButtonBg.lineStyle(2, 0x7ae898, 1);
            rightButtonBg.strokeRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        this.upgradeButton.on('pointerout', () => {
            rightButtonBg.clear();
            const canAfford = GameState.coins >= GameState.getAttackSpeedUpgradeCost();
            rightButtonBg.fillStyle(canAfford ? 0x50c878 : 0x555555, canAfford ? 1 : 0.8);
            rightButtonBg.fillRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            rightButtonBg.lineStyle(2, canAfford ? 0x6ad888 : 0x666666, canAfford ? 1 : 0.8);
            rightButtonBg.strokeRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        contentContainer.add(this.upgradeButton);
        (this as any).rightButtonBg = rightButtonBg;
        
        // x1 버튼 텍스트
        this.upgradeButtonText = scene.add.text(attackSpeedButtonX, attackSpeedY, 'x1', {
            fontSize: x1ButtonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${x1ButtonFontSize} Arial`
        });
        this.upgradeButtonText.setOrigin(0.5);
        contentContainer.add(this.upgradeButtonText);
        
        this.tabContents[1] = contentContainer; // Upgrade 탭은 인덱스 1
    },
    
    // Lock 탭 내용 생성
    createLockTab(scene: Phaser.Scene, gameWidth: number, _gameHeight: number, _halfHeight: number, uiAreaHeight: number, uiAreaStartY: number, tabIndex: number): void {
        const contentContainer = scene.add.container(0, 0);
        
        // Lock 텍스트
        const lockFontSize = Responsive.getFontSize(scene, 32);
        const lockY = uiAreaStartY + uiAreaHeight * 0.4;
        const lockText = scene.add.text(gameWidth / 2, lockY, 'Lock', {
            fontSize: lockFontSize,
            color: '#666666',
            fontFamily: 'Arial',
            font: `bold ${lockFontSize} Arial`
        });
        lockText.setOrigin(0.5);
        contentContainer.add(lockText);
        
        this.tabContents[tabIndex] = contentContainer;
    },
    
    // 탭 전환
    switchTab(tabIndex: number): void {
        this.activeTabIndex = tabIndex;
        
        // 모든 탭 내용 숨기기
        this.tabContents.forEach((content, index) => {
            if (content) {
                content.setVisible(index === tabIndex);
            }
        });
        
        // 탭 버튼 스타일 업데이트
        this.tabs.forEach((tabObj: any, index) => {
            const tabBg = tabObj.bg;
            const tabText = this.tabTexts[index];
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
        
        // 골드 텍스트 업데이트 (화면 상단 좌측)
        if (this.coinText) {
            this.coinText.setText(`코인: ${Math.floor(GameState.coins)}`);
        }
        
        // 공격 속도 텍스트 업데이트 (Stats 탭에만 표시)
        if (this.autoFireText && this.activeTabIndex === 0) {
            this.autoFireText.setText(`공격 속도: ${GameState.attackSpeed}/초`);
        }
        
        // 공격력 텍스트 업데이트 (Stats 탭에만 표시)
        if ((this as any).attackPowerText && this.activeTabIndex === 0) {
            (this as any).attackPowerText.setText(`공격력: ${GameState.attackPower}`);
        }
        
        // 버튼 색상 및 비용 업데이트 (구매 가능 여부) - Upgrade 탭일 때만
        if (this.activeTabIndex === 1) {
            if (this.clickButton && (this as any).leftButtonBg) {
                const attackPowerCost = GameState.getAttackPowerUpgradeCost();
                const canAfford = GameState.coins >= attackPowerCost;
                const leftButtonBg = (this as any).leftButtonBg;
                const buttonWidth = this.clickButton.width;
                const buttonHeight = this.clickButton.height;
                const buttonX = this.clickButton.x;
                const buttonY = this.clickButton.y;
                const buttonRadius = 12;
                
                leftButtonBg.clear();
                if (canAfford) {
                    leftButtonBg.fillStyle(0x4a90e2, 1);
                    leftButtonBg.lineStyle(2, 0x6ab0ff, 1);
                } else {
                    leftButtonBg.fillStyle(0x555555, 0.8);
                    leftButtonBg.lineStyle(2, 0x666666, 0.8);
                }
                leftButtonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                leftButtonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                
                // 전체 텍스트 업데이트 (공격력 (8 -> 9) 비용: 123456)
                if ((this as any).clickFullText) {
                    const currentStat = GameState.attackPower;
                    const nextStat = currentStat + 1;
                    (this as any).clickFullText.setText(`공격력 (${currentStat} -> ${nextStat}) 비용: ${attackPowerCost}`);
                    (this as any).clickFullText.setColor(canAfford ? '#e0e0e0' : '#999999');
                }
            }
            
            if (this.upgradeButton && (this as any).rightButtonBg) {
                const attackSpeedCost = GameState.getAttackSpeedUpgradeCost();
                const canAfford = GameState.coins >= attackSpeedCost;
                const rightButtonBg = (this as any).rightButtonBg;
                const buttonWidth = this.upgradeButton.width;
                const buttonHeight = this.upgradeButton.height;
                const buttonX = this.upgradeButton.x;
                const buttonY = this.upgradeButton.y;
                const buttonRadius = 12;
                
                rightButtonBg.clear();
                if (canAfford) {
                    rightButtonBg.fillStyle(0x50c878, 1);
                    rightButtonBg.lineStyle(2, 0x6ad888, 1);
                } else {
                    rightButtonBg.fillStyle(0x555555, 0.8);
                    rightButtonBg.lineStyle(2, 0x666666, 0.8);
                }
                rightButtonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                rightButtonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                
                // 전체 텍스트 업데이트 (공격속도 (8 -> 9) 비용: 123456)
                if ((this as any).autoFullText) {
                    const currentStat = GameState.attackSpeed;
                    const nextStat = currentStat + 1;
                    (this as any).autoFullText.setText(`공격속도 (${currentStat} -> ${nextStat}) 비용: ${attackSpeedCost}`);
                    (this as any).autoFullText.setColor(canAfford ? '#e0e0e0' : '#999999');
                }
            }
        }
    }
};
