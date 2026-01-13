import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';
import { GameState } from '../managers/GameState';
import { SkillManager } from '../managers/SkillManager';
import { SkillConfigs } from '../config/gameConfig';

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
    skillButton: null as Phaser.GameObjects.Rectangle | null,
    skillButtonText: null as Phaser.GameObjects.Text | null,
    skillCooldownText: null as Phaser.GameObjects.Text | null,
    skillLearnButtons: [] as Phaser.GameObjects.Rectangle[],
    skillLearnButtonBgs: [] as Phaser.GameObjects.Graphics[],
    skillLearnButtonTexts: [] as Phaser.GameObjects.Text[],
    skillCards: [] as Phaser.GameObjects.Container[],
    skillSpText: null as Phaser.GameObjects.Text | null,
    skillUseButtons: [] as Phaser.GameObjects.Arc[],
    skillUseButtonBgs: [] as Phaser.GameObjects.Graphics[],
    skillUseButtonIcons: [] as Phaser.GameObjects.Image[],
    skillUseButtonTexts: [] as Phaser.GameObjects.Text[],
    skillUseCooldownTexts: [] as Phaser.GameObjects.Text[],
    skillUseCooldownMasks: [] as Phaser.GameObjects.Graphics[],
    skillUseCooldownStates: [] as { isInCooldown: boolean; lastSecond: number }[], // 최적화: 이전 상태 저장
    skillAutoButtons: [] as Phaser.GameObjects.Rectangle[],
    skillAutoButtonBgs: [] as Phaser.GameObjects.Graphics[],
    skillAutoButtonTexts: [] as Phaser.GameObjects.Text[],
    
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
        
        // 세 번째 탭 (Skill) 내용 생성
        this.createSkillTab(scene, gameWidth, gameHeight, halfHeight, uiAreaHeight, uiAreaStartY, 2);

        // 나머지 탭 (Lock) 내용 생성
        for (let i = 3; i < 5; i++) {
            this.createLockTab(scene, gameWidth, gameHeight, halfHeight, uiAreaHeight, uiAreaStartY, i);
        }
        
        // 초기 탭 활성화 (Stats 탭)
        this.switchTab(0);
        
        // 초기 UI 업데이트
        this.update();
        
        // 게임 시작 시 이미 습득한 스킬이 있으면 사용 버튼 생성
        if (GameState.learnedSkills.length > 0) {
            this.createSkillUseButtons(scene);
        }
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
        
        const tabLabels = ['Stats', 'Upgrade', 'Skill', 'Lock', 'Lock'];
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
    
    // Skill 탭 내용 생성
    createSkillTab(scene: Phaser.Scene, gameWidth: number, _gameHeight: number, _halfHeight: number, uiAreaHeight: number, uiAreaStartY: number, tabIndex: number): void {
        const contentContainer = scene.add.container(0, 0);

        // 타이틀
        const titleFontSize = Responsive.getFontSize(scene, 22);
        const titleY = uiAreaStartY + uiAreaHeight * 0.08;
        const titleText = scene.add.text(gameWidth / 2, titleY, '스킬', {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        contentContainer.add(titleText);

        // SP 표시
        const spFontSize = Responsive.getFontSize(scene, 20);
        const spY = titleY + uiAreaHeight * 0.1;
        this.skillSpText = scene.add.text(gameWidth / 2, spY, `SP: ${GameState.sp}`, {
            fontSize: spFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${spFontSize} Arial`,
            stroke: '#b8860b',
            strokeThickness: 1
        });
        this.skillSpText.setOrigin(0.5);
        contentContainer.add(this.skillSpText);

        // 스킬 카드 영역 (세로 배치)
        const skillCardStartY = spY + uiAreaHeight * 0.15;
        const skillCardWidth = gameWidth * 0.95;
        const skillCardHeight = uiAreaHeight * 0.15; // 한 줄 레이아웃에 맞게 높이 축소
        const skillCardSpacing = uiAreaHeight * 0.02; // 세로 간격
        const cardX = gameWidth / 2; // 카드는 중앙 정렬

        // 스킬 배열 초기화
        this.skillLearnButtons = [];
        this.skillLearnButtonBgs = [];
        this.skillLearnButtonTexts = [];
        this.skillCards = [];

        // 각 스킬에 대해 카드 생성 (세로로 배치)
        SkillConfigs.forEach((skillConfig, index) => {
            const cardY = skillCardStartY + index * (skillCardHeight + skillCardSpacing);
            const skillCard = this.createSkillCard(scene, skillConfig, cardX, cardY, skillCardWidth, skillCardHeight);
            contentContainer.add(skillCard);
            this.skillCards.push(skillCard);
        });

        this.tabContents[tabIndex] = contentContainer;
    },
    
    // 개별 스킬 카드 생성
    createSkillCard(scene: Phaser.Scene, skillConfig: any, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        const cardRadius = 12;
        const padding = 10;
        const isLearned = GameState.isSkillLearned(skillConfig.id);

        // 카드 배경
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(0x2a2a3a, 0.95);
        cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardBg.lineStyle(2, 0x4a4a5a, 0.8);
        cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardContainer.add(cardBg);

        // 한 줄 레이아웃: Name / descText / statusText / 습득 버튼 (가로 일렬 배치)
        const centerY = 0;
        const itemSpacing = padding * 1.5; // 요소 간 간격
        
        // 1. nameText (왼쪽)
        const nameFontSize = Responsive.getFontSize(scene, 14);
        const nameX = -width / 2 + padding;
        const nameText = scene.add.text(nameX, centerY, skillConfig.name, {
            fontSize: nameFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${nameFontSize} Arial`
        });
        nameText.setOrigin(0, 0.5);
        cardContainer.add(nameText);

        // 2. descText (nameText 다음)
        const descFontSize = Responsive.getFontSize(scene, 10);
        const nameTextWidth = nameText.width;
        const descX = nameX + nameTextWidth + itemSpacing;
        const descText = scene.add.text(descX, centerY, `×${skillConfig.damageMultiplier} | ${skillConfig.cooldown}초`, {
            fontSize: descFontSize,
            color: '#b0b0b0',
            fontFamily: 'Arial',
            font: `400 ${descFontSize} Arial`
        });
        descText.setOrigin(0, 0.5);
        cardContainer.add(descText);

        // 3. statusText (descText 다음)
        const statusFontSize = Responsive.getFontSize(scene, 12);
        const descTextWidth = descText.width;
        const statusX = descX + descTextWidth + itemSpacing;
        const statusText = scene.add.text(statusX, centerY, isLearned ? '✓ 습득 완료' : `SP ${skillConfig.spCost}`, {
            fontSize: statusFontSize,
            color: isLearned ? '#4ade80' : '#ffd700',
            fontFamily: 'Arial',
            font: `500 ${statusFontSize} Arial`
        });
        statusText.setOrigin(0, 0.5);
        cardContainer.add(statusText);

        // 4. 습득 버튼 (카드 오른쪽 끝에 배치)
        if (!isLearned) {
            const buttonWidth = width * 0.2;
            const buttonHeight = height * 0.5;
            const buttonRadius = 8;
            // 버튼을 카드 오른쪽 끝에서 padding만큼 떨어진 위치에 배치
            const buttonX = width / 2 - padding - buttonWidth / 2;
            const buttonY = centerY;

            const buttonBg = scene.add.graphics();
            const canLearn = GameState.sp >= skillConfig.spCost;
            buttonBg.fillStyle(canLearn ? 0x50c878 : 0x555555, canLearn ? 1 : 0.8);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, canLearn ? 0x6ad888 : 0x666666, canLearn ? 1 : 0.8);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            cardContainer.add(buttonBg);
            this.skillLearnButtonBgs.push(buttonBg);

            const learnButton = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x000000, 0);
            learnButton.setInteractive({ useHandCursor: true });
            
            const skillId = skillConfig.id;
            learnButton.on('pointerdown', () => {
                if ((scene as any).learnSkill) {
                    (scene as any).learnSkill(skillId);
                }
            });

            learnButton.on('pointerover', () => {
                if (canLearn) {
                    buttonBg.clear();
                    buttonBg.fillStyle(0x60d888, 1);
                    buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    buttonBg.lineStyle(2, 0x7ae898, 1);
                    buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                }
            });

            learnButton.on('pointerout', () => {
                buttonBg.clear();
                buttonBg.fillStyle(canLearn ? 0x50c878 : 0x555555, canLearn ? 1 : 0.8);
                buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                buttonBg.lineStyle(2, canLearn ? 0x6ad888 : 0x666666, canLearn ? 1 : 0.8);
                buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            });

            cardContainer.add(learnButton);
            this.skillLearnButtons.push(learnButton);

            const buttonTextFontSize = Responsive.getFontSize(scene, 11);
            const buttonText = scene.add.text(buttonX, buttonY, '습득', {
                fontSize: buttonTextFontSize,
                color: canLearn ? '#ffffff' : '#999999',
                fontFamily: 'Arial',
                font: `600 ${buttonTextFontSize} Arial`
            });
            buttonText.setOrigin(0.5);
            cardContainer.add(buttonText);
            this.skillLearnButtonTexts.push(buttonText);
        }

        return cardContainer;
    },
    
    // 화면 중앙에 습득한 스킬 사용 버튼 생성
    createSkillUseButtons(scene: Phaser.Scene): void {
        // 기존 버튼들 제거
        this.removeSkillUseButtons();
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const centerY = gameHeight * 0.45; // 화면 y축 중앙
        const rightX = gameWidth * 0.9; // 화면 오른쪽
        
        // 습득한 모든 스킬에 대해 버튼 생성
        const learnedSkills = GameState.learnedSkills;
        console.log('습득한 스킬:', learnedSkills); // 디버깅용
        if (learnedSkills.length === 0) {
            console.log('습득한 스킬이 없습니다.');
            return;
        }
        
        // 첫 번째 습득한 스킬만 버튼 생성 (나중에 여러 개 지원 가능)
        const skillId = learnedSkills[0];
        const index = 0; // 첫 번째 스킬 인덱스
        const skillConfig = SkillConfigs.find(s => s.id === skillId);
        if (!skillConfig) {
            console.log('스킬 설정을 찾을 수 없습니다:', skillId);
            return;
        }
        
        console.log('스킬 사용 버튼 생성:', skillConfig.name); // 디버깅용
        
        // 작은 원형 버튼 크기
        const buttonRadius = gameWidth * 0.06; // 화면 너비의 6%
        const buttonX = rightX;
        const buttonY = centerY;
        
        // 원형 배경 생성
        const buttonBg = scene.add.graphics();
        buttonBg.fillStyle(0x4a4a4a, 1);
        buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
        buttonBg.lineStyle(3, 0xffffff, 1);
        buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
        buttonBg.setDepth(15);
        this.skillUseButtonBgs.push(buttonBg);
        
        // 클릭 가능한 투명한 원형 영역
        const useButton = scene.add.circle(buttonX, buttonY, buttonRadius, 0x000000, 0);
        useButton.setInteractive({ useHandCursor: true });
        useButton.setDepth(16);
        
        useButton.on('pointerdown', () => {
            if ((scene as any).useSkill) {
                (scene as any).useSkill(skillId);
            }
        });
        
        useButton.on('pointerover', () => {
            // 쿨타임 중이면 호버 효과 적용하지 않음
            const remaining = SkillManager.getRemainingCooldown(skillId, scene.time.now);
            if (remaining > 0) {
                return;
            }
            
            buttonBg.clear();
            buttonBg.fillStyle(0x5a5a5a, 1);
            buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
            buttonBg.lineStyle(3, 0xffff00, 1);
            buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
        });
        
        useButton.on('pointerout', () => {
            // 쿨타임 중이면 호버 효과 적용하지 않음
            const remaining = SkillManager.getRemainingCooldown(skillId, scene.time.now);
            if (remaining > 0) {
                return;
            }
            
            buttonBg.clear();
            buttonBg.fillStyle(0x4a4a4a, 1);
            buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
            buttonBg.lineStyle(3, 0xffffff, 1);
            buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
        });
        
        this.skillUseButtons.push(useButton);
        
        // 붕어빵 아이콘 이미지 (원 안에 배치)
        const iconSize = buttonRadius * 1.2; // 원보다 약간 작게
        const skillIcon = scene.add.image(buttonX, buttonY, 'weapon');
        skillIcon.setDisplaySize(iconSize, iconSize);
        skillIcon.setOrigin(0.5, 0.5);
        skillIcon.setDepth(16);
        this.skillUseButtonIcons.push(skillIcon);
        
        // 쿨타임 텍스트 (아이콘 바로 밑에 작게)
        const cooldownFontSize = Responsive.getFontSize(scene, 10);
        const cooldownFontSizeNum = parseFloat(cooldownFontSize);
        const cooldownText = scene.add.text(buttonX, buttonY + buttonRadius + cooldownFontSizeNum, '준비 완료', {
            fontSize: cooldownFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `500 ${cooldownFontSize} Arial`
        });
        cooldownText.setOrigin(0.5);
        cooldownText.setDepth(16);
        this.skillUseCooldownTexts.push(cooldownText);
        
        // 쿨타임 마스크 (원형 그래프로 쿨타임 표시)
        const cooldownMask = scene.add.graphics();
        cooldownMask.setDepth(17); // 아이콘 위에 표시
        this.skillUseCooldownMasks.push(cooldownMask);
        
        // 최적화: 쿨타임 상태 추적 초기화
        this.skillUseCooldownStates.push({ isInCooldown: false, lastSecond: -1 });
        
        // Auto 버튼 생성 (스킬 사용 버튼 왼쪽)
        const autoButtonWidth = gameWidth * 0.12;
        const autoButtonHeight = gameWidth * 0.08;
        const autoButtonX = buttonX - buttonRadius * 2 - autoButtonWidth / 2;
        const autoButtonY = buttonY;
        const autoButtonRadius = 8;
        
        // Auto 버튼 배경
        const autoButtonBg = scene.add.graphics();
        const isAutoOn = GameState.isSkillAutoUse(skillId);
        autoButtonBg.fillStyle(isAutoOn ? 0x50c878 : 0x4a4a4a, 1);
        autoButtonBg.fillRoundedRect(
            autoButtonX - autoButtonWidth / 2,
            autoButtonY - autoButtonHeight / 2,
            autoButtonWidth,
            autoButtonHeight,
            autoButtonRadius
        );
        autoButtonBg.lineStyle(2, isAutoOn ? 0x6ad888 : 0xffffff, 1);
        autoButtonBg.strokeRoundedRect(
            autoButtonX - autoButtonWidth / 2,
            autoButtonY - autoButtonHeight / 2,
            autoButtonWidth,
            autoButtonHeight,
            autoButtonRadius
        );
        autoButtonBg.setDepth(15);
        this.skillAutoButtonBgs.push(autoButtonBg);
        
        // Auto 버튼 클릭 영역
        const autoButton = scene.add.rectangle(
            autoButtonX,
            autoButtonY,
            autoButtonWidth,
            autoButtonHeight,
            0x000000,
            0
        );
        autoButton.setInteractive({ useHandCursor: true });
        autoButton.setDepth(16);
        
        autoButton.on('pointerdown', () => {
            const newState = GameState.toggleSkillAutoUse(skillId);
            // 배경 업데이트
            autoButtonBg.clear();
            autoButtonBg.fillStyle(newState ? 0x50c878 : 0x4a4a4a, 1);
            autoButtonBg.fillRoundedRect(
                autoButtonX - autoButtonWidth / 2,
                autoButtonY - autoButtonHeight / 2,
                autoButtonWidth,
                autoButtonHeight,
                autoButtonRadius
            );
            autoButtonBg.lineStyle(2, newState ? 0x6ad888 : 0xffffff, 1);
            autoButtonBg.strokeRoundedRect(
                autoButtonX - autoButtonWidth / 2,
                autoButtonY - autoButtonHeight / 2,
                autoButtonWidth,
                autoButtonHeight,
                autoButtonRadius
            );
            // 텍스트 색상 업데이트
            if (index < this.skillAutoButtonTexts.length) {
                this.skillAutoButtonTexts[index].setColor(newState ? '#ffffff' : '#cccccc');
            }
        });
        
        autoButton.on('pointerover', () => {
            autoButtonBg.clear();
            const isAutoOn = GameState.isSkillAutoUse(skillId);
            autoButtonBg.fillStyle(isAutoOn ? 0x6ad888 : 0x5a5a5a, 1);
            autoButtonBg.fillRoundedRect(
                autoButtonX - autoButtonWidth / 2,
                autoButtonY - autoButtonHeight / 2,
                autoButtonWidth,
                autoButtonHeight,
                autoButtonRadius
            );
            autoButtonBg.lineStyle(2, isAutoOn ? 0x7ae888 : 0xffff00, 1);
            autoButtonBg.strokeRoundedRect(
                autoButtonX - autoButtonWidth / 2,
                autoButtonY - autoButtonHeight / 2,
                autoButtonWidth,
                autoButtonHeight,
                autoButtonRadius
            );
        });
        
        autoButton.on('pointerout', () => {
            autoButtonBg.clear();
            const isAutoOn = GameState.isSkillAutoUse(skillId);
            autoButtonBg.fillStyle(isAutoOn ? 0x50c878 : 0x4a4a4a, 1);
            autoButtonBg.fillRoundedRect(
                autoButtonX - autoButtonWidth / 2,
                autoButtonY - autoButtonHeight / 2,
                autoButtonWidth,
                autoButtonHeight,
                autoButtonRadius
            );
            autoButtonBg.lineStyle(2, isAutoOn ? 0x6ad888 : 0xffffff, 1);
            autoButtonBg.strokeRoundedRect(
                autoButtonX - autoButtonWidth / 2,
                autoButtonY - autoButtonHeight / 2,
                autoButtonWidth,
                autoButtonHeight,
                autoButtonRadius
            );
        });
        
        this.skillAutoButtons.push(autoButton);
        
        // Auto 텍스트
        const autoFontSize = Responsive.getFontSize(scene, 12);
        const autoText = scene.add.text(autoButtonX, autoButtonY, 'Auto', {
            fontSize: autoFontSize,
            color: isAutoOn ? '#ffffff' : '#cccccc',
            fontFamily: 'Arial',
            font: `600 ${autoFontSize} Arial`
        });
        autoText.setOrigin(0.5);
        autoText.setDepth(16);
        this.skillAutoButtonTexts.push(autoText);
    },
    
    // 스킬 사용 버튼 제거
    removeSkillUseButtons(): void {
        this.skillUseButtons.forEach(btn => btn.destroy());
        this.skillUseButtonBgs.forEach(bg => bg.destroy());
        this.skillUseButtonIcons.forEach(icon => icon.destroy());
        this.skillUseButtonTexts.forEach(text => text.destroy());
        this.skillUseCooldownTexts.forEach(text => text.destroy());
        this.skillUseCooldownMasks.forEach(mask => mask.destroy());
        this.skillAutoButtons.forEach(btn => btn.destroy());
        this.skillAutoButtonBgs.forEach(bg => bg.destroy());
        this.skillAutoButtonTexts.forEach(text => text.destroy());
        
        this.skillUseButtons = [];
        this.skillUseButtonBgs = [];
        this.skillUseButtonIcons = [];
        this.skillUseButtonTexts = [];
        this.skillUseCooldownTexts = [];
        this.skillUseCooldownMasks = [];
        this.skillUseCooldownStates = [];
        this.skillAutoButtons = [];
        this.skillAutoButtonBgs = [];
        this.skillAutoButtonTexts = [];
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
        const attackPowerText = scene.add.text(gameWidth * 0.1, attackPowerY, `공격력: ${GameState.getAttackPowerValue()}`, {
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
            const isMaxLevel = GameState.attackSpeed >= 15;
            if (!isMaxLevel) {
                rightButtonBg.fillStyle(0x60d888, 1);
                rightButtonBg.lineStyle(2, 0x7ae898, 1);
            } else {
                rightButtonBg.fillStyle(0x555555, 0.8);
                rightButtonBg.lineStyle(2, 0x666666, 0.8);
            }
            rightButtonBg.fillRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            rightButtonBg.strokeRoundedRect(attackSpeedButtonX - x1ButtonWidth / 2, attackSpeedY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        this.upgradeButton.on('pointerout', () => {
            rightButtonBg.clear();
            const isMaxLevel = GameState.attackSpeed >= 15;
            const canAfford = !isMaxLevel && GameState.coins >= GameState.getAttackSpeedUpgradeCost();
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

        // SP 구매 행
        const spPurchaseY = baseY + rowHeight * 2;
        const spPurchaseStartX = gameWidth * 0.1;
        const spPurchaseButtonX = gameWidth * 0.85;

        // SP 구매 전체 텍스트 (SP (0/5 -> 1/5) 비용: 100000)
        const spPurchaseFontSize = Responsive.getFontSize(scene, 18);
        const spFullText = scene.add.text(spPurchaseStartX, spPurchaseY, '', {
            fontSize: spPurchaseFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${spPurchaseFontSize} Arial`
        });
        spFullText.setOrigin(0, 0.5);
        contentContainer.add(spFullText);
        (this as any).spFullText = spFullText;

        // x1 버튼 배경
        const spButtonBg = scene.add.graphics();
        spButtonBg.fillStyle(0xffd700, 1);
        spButtonBg.fillRoundedRect(spPurchaseButtonX - x1ButtonWidth / 2, spPurchaseY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        spButtonBg.lineStyle(2, 0xffed4e, 1);
        spButtonBg.strokeRoundedRect(spPurchaseButtonX - x1ButtonWidth / 2, spPurchaseY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        contentContainer.add(spButtonBg);

        // x1 버튼 그림자
        const spButtonShadow = scene.add.graphics();
        spButtonShadow.fillStyle(0x000000, 0.2);
        spButtonShadow.fillRoundedRect(spPurchaseButtonX - x1ButtonWidth / 2 + 2, spPurchaseY - x1ButtonHeight / 2 + 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        spButtonShadow.setDepth(-1);
        contentContainer.add(spButtonShadow);

        // x1 버튼 (상호작용용)
        const spPurchaseButton = scene.add.rectangle(spPurchaseButtonX, spPurchaseY, x1ButtonWidth, x1ButtonHeight, 0x000000, 0);
        spPurchaseButton.setInteractive({ useHandCursor: true });
        spPurchaseButton.on('pointerdown', () => {
            if (GameState.purchaseSp()) {
                this.update();
            }
        });
        spPurchaseButton.on('pointerover', () => {
            spButtonBg.clear();
            const canPurchase = GameState.spPurchaseCount < 5 && GameState.coins >= GameState.getSpPurchaseCost();
            spButtonBg.fillStyle(canPurchase ? 0xffed4e : 0x555555, canPurchase ? 1 : 0.8);
            spButtonBg.fillRoundedRect(spPurchaseButtonX - x1ButtonWidth / 2, spPurchaseY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            spButtonBg.lineStyle(2, canPurchase ? 0xfff066 : 0x666666, canPurchase ? 1 : 0.8);
            spButtonBg.strokeRoundedRect(spPurchaseButtonX - x1ButtonWidth / 2, spPurchaseY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        spPurchaseButton.on('pointerout', () => {
            spButtonBg.clear();
            const canPurchase = GameState.spPurchaseCount < 5 && GameState.coins >= GameState.getSpPurchaseCost();
            spButtonBg.fillStyle(canPurchase ? 0xffd700 : 0x555555, canPurchase ? 1 : 0.8);
            spButtonBg.fillRoundedRect(spPurchaseButtonX - x1ButtonWidth / 2, spPurchaseY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            spButtonBg.lineStyle(2, canPurchase ? 0xffed4e : 0x666666, canPurchase ? 1 : 0.8);
            spButtonBg.strokeRoundedRect(spPurchaseButtonX - x1ButtonWidth / 2, spPurchaseY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        contentContainer.add(spPurchaseButton);
        (this as any).spPurchaseButton = spPurchaseButton;
        (this as any).spButtonBg = spButtonBg;

        // x1 버튼 텍스트
        const spButtonText = scene.add.text(spPurchaseButtonX, spPurchaseY, 'x1', {
            fontSize: x1ButtonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${x1ButtonFontSize} Arial`
        });
        spButtonText.setOrigin(0.5);
        contentContainer.add(spButtonText);
        (this as any).spButtonText = spButtonText;

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
            (this as any).attackPowerText.setText(`공격력: ${GameState.getAttackPowerValue()}`);
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
                const currentStat = GameState.attackSpeed;
                const isMaxLevel = currentStat >= 15;
                const attackSpeedCost = GameState.getAttackSpeedUpgradeCost();
                const canAfford = !isMaxLevel && GameState.coins >= attackSpeedCost;
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
                
                // 전체 텍스트 업데이트
                if ((this as any).autoFullText) {
                    if (isMaxLevel) {
                        (this as any).autoFullText.setText(`공격속도 (${currentStat}/15) 최대 레벨`);
                        (this as any).autoFullText.setColor('#999999');
                    } else {
                        const nextStat = currentStat + 1;
                        (this as any).autoFullText.setText(`공격속도 (${currentStat} -> ${nextStat}) 비용: ${attackSpeedCost}`);
                        (this as any).autoFullText.setColor(canAfford ? '#e0e0e0' : '#999999');
                    }
                }
            }

            // SP 구매 버튼 업데이트
            if ((this as any).spPurchaseButton && (this as any).spButtonBg) {
                const spCost = GameState.getSpPurchaseCost();
                const canPurchase = GameState.spPurchaseCount < 5 && GameState.coins >= spCost;
                const spButtonBg = (this as any).spButtonBg;
                const buttonWidth = (this as any).spPurchaseButton.width;
                const buttonHeight = (this as any).spPurchaseButton.height;
                const buttonX = (this as any).spPurchaseButton.x;
                const buttonY = (this as any).spPurchaseButton.y;
                const buttonRadius = 12;

                spButtonBg.clear();
                if (canPurchase) {
                    spButtonBg.fillStyle(0xffd700, 1);
                    spButtonBg.lineStyle(2, 0xffed4e, 1);
                } else {
                    spButtonBg.fillStyle(0x555555, 0.8);
                    spButtonBg.lineStyle(2, 0x666666, 0.8);
                }
                spButtonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                spButtonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);

                // 전체 텍스트 업데이트 (SP (0/5 -> 1/5) 비용: 100000)
                if ((this as any).spFullText) {
                    const currentCount = GameState.spPurchaseCount;
                    const nextCount = currentCount + 1;
                    if (currentCount >= 5) {
                        (this as any).spFullText.setText(`SP (${currentCount}/5) 최대 구매 완료`);
                        (this as any).spFullText.setColor('#999999');
                    } else {
                        (this as any).spFullText.setText(`SP (${currentCount}/5 -> ${nextCount}/5) 비용: ${spCost}`);
                        (this as any).spFullText.setColor(canPurchase ? '#e0e0e0' : '#999999');
                    }
                }
            }
        }

        // SP 표시 업데이트 - Skill 탭일 때만
        if (this.skillSpText && this.activeTabIndex === 2) {
            this.skillSpText.setText(`SP: ${GameState.sp}`);
        }
        
        // 스킬 습득 버튼 상태 업데이트 - Skill 탭일 때만
        if (this.activeTabIndex === 2) {
            // 스킬 카드들을 다시 생성하여 상태 업데이트
            // (습득 상태가 변경되었을 수 있으므로)
            SkillConfigs.forEach((skillConfig, index) => {
                const isLearned = GameState.isSkillLearned(skillConfig.id);
                const canLearn = !isLearned && GameState.sp >= skillConfig.spCost;
                
                // 해당 인덱스의 버튼이 있으면 업데이트
                if (index < this.skillLearnButtonBgs.length && index < this.skillLearnButtons.length && index < this.skillLearnButtonTexts.length) {
                    const buttonBg = this.skillLearnButtonBgs[index];
                    const learnButton = this.skillLearnButtons[index];
                    const buttonText = this.skillLearnButtonTexts[index];
                    
                    if (isLearned) {
                        // 습득 완료면 버튼 숨기기
                        buttonBg.setVisible(false);
                        learnButton.setVisible(false);
                        buttonText.setVisible(false);
                    } else {
                        // 버튼 색상 업데이트
                        const buttonWidth = learnButton.width;
                        const buttonHeight = learnButton.height;
                        const buttonX = learnButton.x;
                        const buttonY = learnButton.y;
                        const buttonRadius = 8;
                        
                        buttonBg.clear();
                        buttonBg.fillStyle(canLearn ? 0x50c878 : 0x555555, canLearn ? 1 : 0.8);
                        buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                        buttonBg.lineStyle(2, canLearn ? 0x6ad888 : 0x666666, canLearn ? 1 : 0.8);
                        buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                        
                        buttonText.setColor(canLearn ? '#ffffff' : '#999999');
                    }
                }
            });
        }
        
        // 화면 중앙 스킬 사용 버튼 쿨타임 업데이트
        if (scene && this.skillUseCooldownTexts.length > 0) {
            const learnedSkills = GameState.learnedSkills;
            learnedSkills.forEach((skillId, index) => {
                if (index < this.skillUseCooldownTexts.length && index < this.skillUseCooldownMasks.length && index < this.skillUseCooldownStates.length) {
                    const cooldownText = this.skillUseCooldownTexts[index];
                    const cooldownMask = this.skillUseCooldownMasks[index];
                    const cooldownState = this.skillUseCooldownStates[index];
                    const skillConfig = SkillConfigs.find(s => s.id === skillId);
                    const remaining = SkillManager.getRemainingCooldown(skillId, scene.time.now);
                    const isInCooldown = remaining > 0;
                    const currentSecond = isInCooldown ? Math.ceil(remaining) : -1;
                    
                    // 최적화: 쿨타임 텍스트는 초 단위로 변경될 때만 업데이트
                    if (cooldownState.lastSecond !== currentSecond) {
                        cooldownState.lastSecond = currentSecond;
                        if (remaining <= 0) {
                            cooldownText.setText('준비 완료');
                            cooldownText.setColor('#ffffff');
                        } else {
                            cooldownText.setText(`${currentSecond}초`);
                            cooldownText.setColor('#ffcc00');
                        }
                    }
                    
                    // 쿨타임 마스크 업데이트 (원형 그래프)
                    if (skillConfig && index < this.skillUseButtons.length && index < this.skillUseButtonBgs.length) {
                        const useButton = this.skillUseButtons[index];
                        const buttonBg = this.skillUseButtonBgs[index];
                        const buttonX = useButton.x;
                        const buttonY = useButton.y;
                        const buttonRadius = useButton.radius;
                        
                        // 최적화: 쿨타임 상태가 변경될 때만 배경 업데이트
                        if (cooldownState.isInCooldown !== isInCooldown) {
                            cooldownState.isInCooldown = isInCooldown;
                            if (isInCooldown) {
                                // 쿨타임 시작: 흰색 테두리로 변경
                                buttonBg.clear();
                                buttonBg.fillStyle(0x4a4a4a, 1);
                                buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
                                buttonBg.lineStyle(3, 0xffffff, 1);
                                buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
                            }
                            // 쿨타임 종료 시에는 호버 이벤트가 자동으로 처리하므로 여기서는 아무것도 하지 않음
                        }
                        
                        // 쿨타임 마스크는 매 프레임 업데이트 (부드러운 애니메이션을 위해)
                        cooldownMask.clear();
                        
                        if (remaining > 0) {
                            // 쿨타임 진행률 계산 (0~1)
                            const progress = remaining / skillConfig.cooldown;
                            // 가려져야 할 각도 (라디안)
                            const angle = progress * Math.PI * 2;
                            
                            // 반투명한 회색으로 가려지는 부분 그리기
                            cooldownMask.fillStyle(0x000000, 0.6);
                            
                            // 원형 섹터 그리기 (시계 방향으로 가려짐)
                            // 시작 각도: -90도 (위쪽에서 시작)
                            const startAngle = -Math.PI / 2;
                            
                            if (angle > 0) {
                                cooldownMask.beginPath();
                                cooldownMask.moveTo(buttonX, buttonY);
                                // 시작점에서 원의 경계까지
                                cooldownMask.lineTo(
                                    buttonX + Math.cos(startAngle) * buttonRadius,
                                    buttonY + Math.sin(startAngle) * buttonRadius
                                );
                                // 원호 그리기
                                cooldownMask.arc(
                                    buttonX, buttonY, buttonRadius,
                                    startAngle, startAngle + angle,
                                    false
                                );
                                // 중심으로 돌아오기
                                cooldownMask.lineTo(buttonX, buttonY);
                                cooldownMask.closePath();
                                cooldownMask.fillPath();
                            }
                        }
                    }
                }
            });
        }
    }
};
