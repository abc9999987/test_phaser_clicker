import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';
import { GameState } from '../managers/GameState';
import { SkillManager } from '../managers/SkillManager';
import { SkillConfigs } from '../config/gameConfig';
import { NumberFormatter } from '../utils/NumberFormatter';

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
    skillCards: [] as Phaser.GameObjects.Container[],
    skillSpText: null as Phaser.GameObjects.Text | null,
    skillUseButtons: [] as Phaser.GameObjects.Arc[],
    skillUseButtonBgs: [] as Phaser.GameObjects.Graphics[],
    skillUseButtonIcons: [] as Phaser.GameObjects.Image[],
    skillUseButtonTexts: [] as Phaser.GameObjects.Text[],
    skillUseCooldownTexts: [] as Phaser.GameObjects.Text[],
    skillUseCooldownMasks: [] as Phaser.GameObjects.Graphics[],
    skillUseCooldownStates: [] as { isInCooldown: boolean; lastSecond: number }[], // 최적화: 이전 상태 저장
    skillBuffDurationMasks: [] as Phaser.GameObjects.Graphics[], // Buff 스킬 지속시간 표시용
    skillAutoButtons: [] as Phaser.GameObjects.Rectangle[],
    skillAutoButtonBgs: [] as Phaser.GameObjects.Graphics[],
    skillAutoButtonTexts: [] as Phaser.GameObjects.Text[],
    upgradeCards: [] as Phaser.GameObjects.Container[],
    
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
        this.coinText = scene.add.text(gameWidth * 0.03, halfHeight - gameHeight * 0.035, `코인: ${NumberFormatter.formatNumber(Math.floor(GameState.coins))}`, {
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
        // 기존 탭 컨텐츠 제거
        if (this.tabContents[tabIndex]) {
            this.tabContents[tabIndex].destroy();
            this.tabContents[tabIndex] = null as any;
        }
        
        // 기존 스킬 카드들 제거 (카드가 destroy되면 내부 버튼들도 자동으로 제거됨)
        this.skillCards.forEach(card => card.destroy());
        
        // 스킬 배열 초기화
        this.skillCards = [];
        
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
        this.skillSpText = scene.add.text(gameWidth / 2, spY, `SP: ${NumberFormatter.formatNumber(GameState.sp)}`, {
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

        // 버튼 영역 계산 (습득하지 않은 경우)
        const buttonWidth = !isLearned ? width * 0.15 : 0;
        const buttonAreaWidth = buttonWidth + padding; // 버튼 + 오른쪽 패딩
        
        // 2. descText (nameText 다음, 버튼 영역을 고려한 최대 너비)
        const descFontSize = Responsive.getFontSize(scene, 10);
        const nameTextWidth = nameText.width;
        const descX = nameX + nameTextWidth + itemSpacing;
        // BUFF 타입 스킬은 duration도 표시
        let descTextContent = `×${skillConfig.skillPower} | ${skillConfig.cooldown}초`;
        if (skillConfig.skillType === 2 && skillConfig.duration) { // BUFF 타입
            descTextContent = `×${skillConfig.skillPower} | ${skillConfig.duration}초 지속 | ${skillConfig.cooldown}초 쿨타임`;
        }
        const descText = scene.add.text(descX, centerY, descTextContent, {
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

        // 3. statusText (습득 완료일 때는 오른쪽 끝에 배치, 아니면 descText 다음)
        const statusFontSize = Responsive.getFontSize(scene, 12);
        let statusText: Phaser.GameObjects.Text;
        
        if (isLearned) {
            // 습득 완료 텍스트를 오른쪽 끝에 배치
            const statusX = width / 2 - padding;
            statusText = scene.add.text(statusX, centerY, '✓ 습득 완료', {
                fontSize: statusFontSize,
                color: '#4ade80',
                fontFamily: 'Arial',
                font: `500 ${statusFontSize} Arial`
            });
            statusText.setOrigin(1, 0.5); // 오른쪽 정렬
        } else {
            // SP 비용 텍스트는 descText 다음에 배치
            const descTextWidth = descText.width;
            const statusX = descX + descTextWidth + itemSpacing;
            statusText = scene.add.text(statusX, centerY, `SP ${NumberFormatter.formatNumber(skillConfig.spCost)}`, {
                fontSize: statusFontSize,
                color: '#ffd700',
                fontFamily: 'Arial',
                font: `500 ${statusFontSize} Arial`
            });
            statusText.setOrigin(0, 0.5);
        }
        cardContainer.add(statusText);

        // 4. 습득 버튼 (카드 오른쪽 끝에 배치)
        if (!isLearned) {
            const buttonWidth = width * 0.15; // 버튼 너비
            const buttonHeight = height * 0.5;
            const buttonRadius = 8;
            // 버튼을 카드 오른쪽 끝에 최대한 붙여서 배치 (최소한의 여유만)
            const buttonX = width / 2 - padding * 0.5 - buttonWidth / 2;
            const buttonY = centerY;
            

            const buttonBg = scene.add.graphics();
            const canLearn = GameState.sp >= skillConfig.spCost;
            buttonBg.fillStyle(canLearn ? 0x50c878 : 0x555555, canLearn ? 1 : 0.8);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, canLearn ? 0x6ad888 : 0x666666, canLearn ? 1 : 0.8);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.setDepth(100); // 다른 요소 위에 표시
            cardContainer.add(buttonBg);

            const learnButton = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x000000, 0);
            learnButton.setInteractive({ useHandCursor: true });
            learnButton.setDepth(101); // 버튼 배경 위에 표시
            
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

            const buttonTextFontSize = Responsive.getFontSize(scene, 11);
            const buttonText = scene.add.text(buttonX, buttonY, '습득', {
                fontSize: buttonTextFontSize,
                color: canLearn ? '#ffffff' : '#999999',
                fontFamily: 'Arial',
                font: `600 ${buttonTextFontSize} Arial`
            });
            buttonText.setOrigin(0.5);
            buttonText.setDepth(102); // 버튼 위에 표시
            cardContainer.add(buttonText);
            
            // 카드 컨테이너에 버튼 참조 저장 (업데이트용)
            (cardContainer as any).skillCardData = {
                skillId: skillConfig.id,
                buttonBg: buttonBg,
                learnButton: learnButton,
                buttonText: buttonText,
                buttonX: buttonX,
                buttonY: buttonY,
                buttonWidth: buttonWidth,
                buttonHeight: buttonHeight,
                buttonRadius: buttonRadius
            };
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
        const rightX = gameWidth * 0.9; // 화면 오른쪽 기준 위치
        
        // 습득한 모든 스킬에 대해 버튼 생성
        const learnedSkills = GameState.learnedSkills;
        if (learnedSkills.length === 0) {
            return;
        }
        
        // 각 스킬마다 하나의 버튼을 오른쪽에서부터 왼쪽으로 배치
        const buttonRadius = gameWidth * 0.06; // 화면 너비의 6%
        const buttonSpacing = buttonRadius * 2.4; // 버튼 간 간격
        
        learnedSkills.forEach((skillId, index) => {
            const skillConfig = SkillConfigs.find(s => s.id === skillId);
            if (!skillConfig) {
                return;
            }
            
            const buttonX = rightX - index * buttonSpacing;
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
                // 쿨타임 중이거나 버프 지속시간 중이면 호버 효과 적용하지 않음
                const now = scene.time.now;
                const remaining = SkillManager.getRemainingCooldown(skillId, now);
                const buffRemaining = skillConfig.skillType === 2 ? GameState.getBuffRemainingDuration(skillId, now) : 0;
                
                if (remaining > 0 || buffRemaining > 0) {
                    return;
                }
                
                buttonBg.clear();
                buttonBg.fillStyle(0x5a5a5a, 1);
                buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
                buttonBg.lineStyle(3, 0xffff00, 1);
                buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
            });
            
            useButton.on('pointerout', () => {
                // 쿨타임 중이거나 버프 지속시간 중이면 호버 효과 적용하지 않음
                const now = scene.time.now;
                const remaining = SkillManager.getRemainingCooldown(skillId, now);
                const buffRemaining = skillConfig.skillType === 2 ? GameState.getBuffRemainingDuration(skillId, now) : 0;
                
                if (remaining > 0 || buffRemaining > 0) {
                    return;
                }
                
                buttonBg.clear();
                buttonBg.fillStyle(0x4a4a4a, 1);
                buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
                buttonBg.lineStyle(3, 0xffffff, 1);
                buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
            });
            
            this.skillUseButtons.push(useButton);
            
            // 공격 스킬은 기존처럼 아이콘, 버프 스킬은 텍스트 "Buff" 표시
            if (skillConfig.id === 'buff_attack_damage') {
                // Buff 텍스트만 가운데 표시
                const labelFontSize = Responsive.getFontSize(scene, 12);
                const labelText = scene.add.text(buttonX, buttonY, 'Buff', {
                    fontSize: labelFontSize,
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    font: `600 ${labelFontSize} Arial`
                });
                labelText.setOrigin(0.5);
                labelText.setDepth(16);
                // 아이콘 배열에는 추가하지 않음 (파괴 시에도 문제 없음)
            } else {
                // 붕어빵 아이콘 이미지 (원 안에 배치)
                const iconSize = buttonRadius * 1.2; // 원보다 약간 작게
                const skillIcon = scene.add.image(buttonX, buttonY, 'weapon');
                skillIcon.setDisplaySize(iconSize, iconSize);
                skillIcon.setOrigin(0.5, 0.5);
                skillIcon.setDepth(16);
                this.skillUseButtonIcons.push(skillIcon);
            }
            
            // 쿨타임 텍스트 (아이콘/텍스트 바로 밑에 작게)
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
            cooldownMask.setDepth(17); // 아이콘/텍스트 위에 표시
            this.skillUseCooldownMasks.push(cooldownMask);
            
            // Buff 스킬 지속시간 마스크 (Buff 스킬일 때만 생성)
            if (skillConfig.skillType === 2) { // BUFF 타입
                const buffDurationMask = scene.add.graphics();
                buffDurationMask.setDepth(18); // 쿨타임 마스크 위에 표시
                this.skillBuffDurationMasks.push(buffDurationMask);
            } else {
                // 공격 스킬은 지속시간 마스크 없음
                this.skillBuffDurationMasks.push(null as any);
            }
            
            // 최적화: 쿨타임 상태 추적 초기화
            this.skillUseCooldownStates.push({ isInCooldown: false, lastSecond: -1 });
        });
        
        // Auto 버튼 하나 생성 (모든 스킬의 자동 사용을 관리)
        if (learnedSkills.length > 0) {
            // 가장 왼쪽 스킬 버튼 위치 계산
            const leftmostButtonX = rightX - (learnedSkills.length - 1) * buttonSpacing * 0.35;
            const autoButtonWidth = gameWidth * 0.12;
            const autoButtonHeight = gameWidth * 0.08;
            // 가장 왼쪽 스킬 버튼 왼쪽에 여유 공간을 두고 배치
            const autoButtonX = leftmostButtonX - buttonRadius * 3 - autoButtonWidth / 2;
            const autoButtonY = centerY;
            const autoButtonRadius = 8;
            
            // 모든 스킬의 자동 사용 상태 확인 (하나라도 켜져있으면 켜진 상태)
            const hasAnyAutoOn = learnedSkills.some(skillId => GameState.isSkillAutoUse(skillId));
            
            // Auto 버튼 배경
            const autoButtonBg = scene.add.graphics();
            autoButtonBg.fillStyle(hasAnyAutoOn ? 0x50c878 : 0x4a4a4a, 1);
            autoButtonBg.fillRoundedRect(
                autoButtonX - autoButtonWidth / 2,
                autoButtonY - autoButtonHeight / 2,
                autoButtonWidth,
                autoButtonHeight,
                autoButtonRadius
            );
            autoButtonBg.lineStyle(2, hasAnyAutoOn ? 0x6ad888 : 0xffffff, 1);
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
                // 현재 상태 확인 (하나라도 켜져있으면 모두 끄기, 모두 꺼져있으면 모두 켜기)
                const currentState = learnedSkills.some(skillId => GameState.isSkillAutoUse(skillId));
                const newState = !currentState;
                
                // 모든 스킬의 자동 사용 상태 변경
                learnedSkills.forEach(skillId => {
                    const currentSkillState = GameState.isSkillAutoUse(skillId);
                    if (currentSkillState !== newState) {
                        GameState.toggleSkillAutoUse(skillId);
                    }
                });
                
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
                if (this.skillAutoButtonTexts.length > 0) {
                    this.skillAutoButtonTexts[0].setColor(newState ? '#ffffff' : '#cccccc');
                }
            });
            
            autoButton.on('pointerover', () => {
                const hasAnyAutoOnNow = learnedSkills.some(skillId => GameState.isSkillAutoUse(skillId));
                autoButtonBg.clear();
                autoButtonBg.fillStyle(hasAnyAutoOnNow ? 0x6ad888 : 0x5a5a5a, 1);
                autoButtonBg.fillRoundedRect(
                    autoButtonX - autoButtonWidth / 2,
                    autoButtonY - autoButtonHeight / 2,
                    autoButtonWidth,
                    autoButtonHeight,
                    autoButtonRadius
                );
                autoButtonBg.lineStyle(2, hasAnyAutoOnNow ? 0x7ae888 : 0xffff00, 1);
                autoButtonBg.strokeRoundedRect(
                    autoButtonX - autoButtonWidth / 2,
                    autoButtonY - autoButtonHeight / 2,
                    autoButtonWidth,
                    autoButtonHeight,
                    autoButtonRadius
                );
            });
            
            autoButton.on('pointerout', () => {
                const hasAnyAutoOnNow = learnedSkills.some(skillId => GameState.isSkillAutoUse(skillId));
                autoButtonBg.clear();
                autoButtonBg.fillStyle(hasAnyAutoOnNow ? 0x50c878 : 0x4a4a4a, 1);
                autoButtonBg.fillRoundedRect(
                    autoButtonX - autoButtonWidth / 2,
                    autoButtonY - autoButtonHeight / 2,
                    autoButtonWidth,
                    autoButtonHeight,
                    autoButtonRadius
                );
                autoButtonBg.lineStyle(2, hasAnyAutoOnNow ? 0x6ad888 : 0xffffff, 1);
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
                color: hasAnyAutoOn ? '#ffffff' : '#cccccc',
                fontFamily: 'Arial',
                font: `600 ${autoFontSize} Arial`
            });
            autoText.setOrigin(0.5);
            autoText.setDepth(16);
            this.skillAutoButtonTexts.push(autoText);
        }
    },
    
    // 스킬 사용 버튼 제거
    removeSkillUseButtons(): void {
        this.skillUseButtons.forEach(btn => btn.destroy());
        this.skillUseButtonBgs.forEach(bg => bg.destroy());
        this.skillUseButtonIcons.forEach(icon => icon.destroy());
        this.skillUseButtonTexts.forEach(text => text.destroy());
        this.skillUseCooldownTexts.forEach(text => text.destroy());
        this.skillUseCooldownMasks.forEach(mask => mask.destroy());
        this.skillBuffDurationMasks.forEach(mask => {
            if (mask) mask.destroy();
        });
        this.skillAutoButtons.forEach(btn => btn.destroy());
        this.skillAutoButtonBgs.forEach(bg => bg.destroy());
        this.skillAutoButtonTexts.forEach(text => text.destroy());
        
        this.skillUseButtons = [];
        this.skillUseButtonBgs = [];
        this.skillUseButtonIcons = [];
        this.skillUseButtonTexts = [];
        this.skillUseCooldownTexts = [];
        this.skillUseCooldownMasks = [];
        this.skillBuffDurationMasks = [];
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
        const attackPowerY = attackSpeedY + uiAreaHeight * 0.06;
        const attackPowerText = scene.add.text(gameWidth * 0.1, attackPowerY, `공격력: ${NumberFormatter.formatNumber(GameState.getAttackPowerValue())}`, {
            fontSize: attackPowerFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${attackPowerFontSize} Arial`
        });
        (this as any).attackPowerText = attackPowerText;
        contentContainer.add(attackPowerText);
        
        // 치명타 확률 텍스트
        const critChanceFontSize = Responsive.getFontSize(scene, 20);
        const critChanceY = attackPowerY + uiAreaHeight * 0.06;
        const critChanceText = scene.add.text(gameWidth * 0.1, critChanceY, `치명타 확률: ${GameState.critChance}%`, {
            fontSize: critChanceFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${critChanceFontSize} Arial`
        });
        (this as any).critChanceText = critChanceText;
        contentContainer.add(critChanceText);

        // 치명타 데미지 텍스트
        const critDamageFontSize = Responsive.getFontSize(scene, 20);
        const critDamageY = critChanceY + uiAreaHeight * 0.06;
        const critDamageText = scene.add.text(gameWidth * 0.1, critDamageY, `치명타 데미지: ${GameState.critDamage}%`, {
            fontSize: critDamageFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${critDamageFontSize} Arial`
        });
        (this as any).critDamageText = critDamageText;
        contentContainer.add(critDamageText);
        
        this.tabContents[0] = contentContainer;
    },
    
    // 업그레이드 카드 생성 (공통 함수)
    createUpgradeCard(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        labelText: string,
        valueText: string,
        costText: string,
        buttonColor: number,
        buttonHoverColor: number,
        buttonBorderColor: number,
        onUpgrade: () => boolean,
        getCost: () => number,
        canAfford: () => boolean,
        isMaxLevel?: () => boolean
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        const cardRadius = 12;
        const padding = 10;
        const buttonRadius = 12;
        const x1ButtonWidth = 50;
        const x1ButtonHeight = 35;
        
        // 카드 배경
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(0x2a2a3a, 0.95);
        cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardBg.lineStyle(2, 0x4a4a5a, 0.8);
        cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardContainer.add(cardBg);
        
        const centerY = 0;
        const startX = -width / 2 + padding;
        const centerX = 0;
        const buttonX = width / 2 - padding - x1ButtonWidth / 2;
        
        // 첫 번째 줄: 큰 글씨
        const labelFontSize = Responsive.getFontSize(scene, 18);
        const labelY = centerY - 8;
        
        // 왼쪽: 항목명
        const label = scene.add.text(startX, labelY, labelText, {
            fontSize: labelFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${labelFontSize} Arial`
        });
        label.setOrigin(0, 0.5);
        cardContainer.add(label);
        
        // 중앙: "비용"
        const costLabel = scene.add.text(centerX, labelY, '비용', {
            fontSize: labelFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${labelFontSize} Arial`
        });
        costLabel.setOrigin(0.5, 0.5);
        cardContainer.add(costLabel);
        
        // 두 번째 줄: 작은 글씨
        const valueFontSize = Responsive.getFontSize(scene, 14);
        const valueY = centerY + 8;
        
        // 왼쪽: 값 변화
        const value = scene.add.text(startX, valueY, valueText, {
            fontSize: valueFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${valueFontSize} Arial`
        });
        value.setOrigin(0, 0.5);
        cardContainer.add(value);
        
        // 중앙: 비용 숫자
        const costValue = scene.add.text(centerX, valueY, costText, {
            fontSize: valueFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${valueFontSize} Arial`
        });
        costValue.setOrigin(0.5, 0.5);
        cardContainer.add(costValue);
        
        // x1 버튼 배경
        const buttonBg = scene.add.graphics();
        const canAffordNow = isMaxLevel ? !isMaxLevel() && canAfford() : canAfford();
        buttonBg.fillStyle(canAffordNow ? buttonColor : 0x555555, canAffordNow ? 1 : 0.8);
        buttonBg.fillRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        buttonBg.lineStyle(2, canAffordNow ? buttonBorderColor : 0x666666, canAffordNow ? 1 : 0.8);
        buttonBg.strokeRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        cardContainer.add(buttonBg);
        
        // x1 버튼 그림자
        const buttonShadow = scene.add.graphics();
        buttonShadow.fillStyle(0x000000, 0.2);
        buttonShadow.fillRoundedRect(buttonX - x1ButtonWidth / 2 + 2, centerY - x1ButtonHeight / 2 + 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        buttonShadow.setDepth(-1);
        cardContainer.add(buttonShadow);
        
        // x1 버튼 (상호작용용)
        const button = scene.add.rectangle(buttonX, centerY, x1ButtonWidth, x1ButtonHeight, 0x000000, 0);
        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => {
            if (onUpgrade()) {
                // 업그레이드 후 UI 업데이트는 외부에서 처리
            }
        });
        button.on('pointerover', () => {
            buttonBg.clear();
            const maxed = isMaxLevel ? isMaxLevel() : false;
            if (!maxed) {
                buttonBg.fillStyle(buttonHoverColor, 1);
                buttonBg.lineStyle(2, buttonBorderColor, 1);
            } else {
                buttonBg.fillStyle(0x555555, 0.8);
                buttonBg.lineStyle(2, 0x666666, 0.8);
            }
            buttonBg.fillRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            buttonBg.strokeRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        button.on('pointerout', () => {
            buttonBg.clear();
            const maxed = isMaxLevel ? isMaxLevel() : false;
            const canAffordNow = !maxed && canAfford();
            buttonBg.fillStyle(canAffordNow ? buttonColor : 0x555555, canAffordNow ? 1 : 0.8);
            buttonBg.lineStyle(2, canAffordNow ? buttonBorderColor : 0x666666, canAffordNow ? 1 : 0.8);
            buttonBg.fillRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
            buttonBg.strokeRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        });
        cardContainer.add(button);
        
        // x1 버튼 텍스트
        const x1ButtonFontSize = Responsive.getFontSize(scene, 14);
        const buttonText = scene.add.text(buttonX, centerY, 'x1', {
            fontSize: x1ButtonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${x1ButtonFontSize} Arial`
        });
        buttonText.setOrigin(0.5);
        cardContainer.add(buttonText);
        
        // 카드에 참조 저장 (업데이트용)
        (cardContainer as any).upgradeCardData = {
            label,
            costLabel,
            value,
            costValue,
            button,
            buttonBg,
            buttonText,
            onUpgrade,
            getCost,
            canAfford,
            isMaxLevel
        };
        
        return cardContainer;
    },
    
    // Upgrade 탭 내용 생성
    createUpgradeTab(scene: Phaser.Scene, gameWidth: number, _gameHeight: number, _halfHeight: number, uiAreaHeight: number, uiAreaStartY: number): void {
        const contentContainer = scene.add.container(0, 0);
        
        // 카드 영역 설정
        const cardStartY = uiAreaStartY + uiAreaHeight * 0.15;
        const cardWidth = gameWidth * 0.95;
        const cardHeight = uiAreaHeight * 0.12;
        const cardSpacing = uiAreaHeight * 0.02;
        const cardX = gameWidth / 2;
        
        // 기존 카드 제거
        this.upgradeCards.forEach(card => card.destroy());
        this.upgradeCards = [];
        
        // 1. 공격력 강화 카드
        const attackPowerCardY = cardStartY;
        const attackPowerCurrent = GameState.attackPower;
        const attackPowerNext = attackPowerCurrent + 1;
        const attackPowerCost = GameState.getAttackPowerUpgradeCost();
        
        const attackPowerCard = this.createUpgradeCard(
            scene,
            cardX,
            attackPowerCardY,
            cardWidth,
            cardHeight,
            '공격력',
            `(${NumberFormatter.formatNumber(attackPowerCurrent)} -> ${NumberFormatter.formatNumber(attackPowerNext)})`,
            `${NumberFormatter.formatNumber(attackPowerCost)}`,
            0x4a90e2, // 버튼 색상
            0x5a9fff, // 호버 색상
            0x6ab0ff, // 테두리 색상
            () => GameState.upgradeAttackPower(),
            () => GameState.getAttackPowerUpgradeCost(),
            () => GameState.coins >= GameState.getAttackPowerUpgradeCost()
        );
        contentContainer.add(attackPowerCard);
        this.upgradeCards.push(attackPowerCard);
        (this as any).attackPowerCard = attackPowerCard;
        
        // 2. 공격속도 강화 카드
        const attackSpeedCardY = cardStartY + cardHeight + cardSpacing;
        const attackSpeedCurrent = GameState.attackSpeed;
        const attackSpeedNext = attackSpeedCurrent + 1;
        const attackSpeedCost = GameState.getAttackSpeedUpgradeCost();
        const isAttackSpeedMax = attackSpeedCurrent >= 15;
        
        const attackSpeedCard = this.createUpgradeCard(
            scene,
            cardX,
            attackSpeedCardY,
            cardWidth,
            cardHeight,
            '공격속도',
            isAttackSpeedMax ? `(${attackSpeedCurrent}/15) 최대 레벨` : `(${attackSpeedCurrent} -> ${attackSpeedNext})`,
            isAttackSpeedMax ? '' : `${NumberFormatter.formatNumber(attackSpeedCost)}`,
            0x50c878, // 버튼 색상
            0x60d888, // 호버 색상
            0x6ad888, // 테두리 색상
            () => {
                const result = GameState.upgradeAttackSpeed();
                if (result && (scene as any).setupAutoFire) {
                    (scene as any).setupAutoFire();
                }
                return result;
            },
            () => GameState.getAttackSpeedUpgradeCost(),
            () => GameState.coins >= GameState.getAttackSpeedUpgradeCost(),
            () => GameState.attackSpeed >= 15
        );
        contentContainer.add(attackSpeedCard);
        this.upgradeCards.push(attackSpeedCard);
        (this as any).attackSpeedCard = attackSpeedCard;
        
        // 3. 치명타 확률 강화 카드
        const critChanceCardY = cardStartY + (cardHeight + cardSpacing) * 2;
        const critChanceCurrent = GameState.critChance;
        const critChanceNext = critChanceCurrent + 1;
        const critChanceCost = GameState.getCritChanceUpgradeCost();
        const isCritChanceMax = critChanceCurrent >= 100;
        
        const critChanceCard = this.createUpgradeCard(
            scene,
            cardX,
            critChanceCardY,
            cardWidth,
            cardHeight,
            '치명타확률',
            isCritChanceMax ? `(${critChanceCurrent}%) 최대 레벨` : `(${critChanceCurrent}% -> ${critChanceNext}%)`,
            isCritChanceMax ? '' : `${critChanceCost}`,
            0x50c878, // 버튼 색상
            0x60d888, // 호버 색상
            0x6ad888, // 테두리 색상
            () => GameState.upgradeCritChance(),
            () => GameState.getCritChanceUpgradeCost(),
            () => GameState.coins >= GameState.getCritChanceUpgradeCost(),
            () => GameState.critChance >= 100
        );
        contentContainer.add(critChanceCard);
        this.upgradeCards.push(critChanceCard);
        (this as any).critChanceCard = critChanceCard;

        // 4. 치명타 데미지 강화 카드
        const critDamageCardY = cardStartY + (cardHeight + cardSpacing) * 3;
        const critDamageCurrent = GameState.critDamage;
        const critDamageNext = critDamageCurrent + 1;
        const critDamageCost = GameState.getCritDamageUpgradeCost();
        const isCritDamageMax = critDamageCurrent >= 100;
        
        const critDamageCard = this.createUpgradeCard(
            scene,
            cardX,
            critDamageCardY,
            cardWidth,
            cardHeight,
            '치명타데미지',
            isCritDamageMax ? `(${critDamageCurrent}%) 최대 레벨` : `(${critDamageCurrent}% -> ${critDamageNext}%)`,
            isCritDamageMax ? '' : `${critDamageCost}`,
            0x50c878, // 버튼 색상
            0x60d888, // 호버 색상
            0x6ad888, // 테두리 색상
            () => GameState.upgradeCritDamage(),
            () => GameState.getCritDamageUpgradeCost(),
            () => GameState.coins >= GameState.getCritDamageUpgradeCost(),
            () => GameState.critDamage >= 100
        );
        contentContainer.add(critDamageCard);
        this.upgradeCards.push(critDamageCard);
        (this as any).critDamageCard = critDamageCard;
        
        // 5. SP 구매 카드
        const spPurchaseCardY = cardStartY + (cardHeight + cardSpacing) * 4;
        const spPurchaseCurrent = GameState.spPurchaseCount;
        const spPurchaseNext = spPurchaseCurrent + 1;
        const spPurchaseCost = GameState.getSpPurchaseCost();
        const isSpPurchaseMax = spPurchaseCurrent >= 5;
        
        const spPurchaseCard = this.createUpgradeCard(
            scene,
            cardX,
            spPurchaseCardY,
            cardWidth,
            cardHeight,
            'SP 구매',
            isSpPurchaseMax ? `(${spPurchaseCurrent}/5) 최대 구매 완료` : `(${spPurchaseCurrent}/5 -> ${spPurchaseNext}/5)`,
            isSpPurchaseMax ? '' : `${NumberFormatter.formatNumber(spPurchaseCost)}`,
            0xffd700, // 버튼 색상
            0xffed4e, // 호버 색상
            0xffed4e, // 테두리 색상
            () => GameState.purchaseSp(),
            () => GameState.getSpPurchaseCost(),
            () => GameState.coins >= GameState.getSpPurchaseCost(),
            () => GameState.spPurchaseCount >= 5
        );
        contentContainer.add(spPurchaseCard);
        this.upgradeCards.push(spPurchaseCard);
        (this as any).spPurchaseCard = spPurchaseCard;
        
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
            this.coinText.setText(`코인: ${NumberFormatter.formatNumber(Math.floor(GameState.coins))}`);
        }
        
        // 공격 속도 텍스트 업데이트 (Stats 탭에만 표시)
        if (this.autoFireText && this.activeTabIndex === 0) {
            this.autoFireText.setText(`공격 속도: ${GameState.attackSpeed}/초`);
        }
        
        // 공격력 텍스트 업데이트 (Stats 탭에만 표시)
        if ((this as any).attackPowerText && this.activeTabIndex === 0) {
            (this as any).attackPowerText.setText(`공격력: ${NumberFormatter.formatNumber(GameState.getAttackPowerValue())}`);
        }
        
        // 치명타 확률 텍스트 업데이트 (Stats 탭에만 표시)
        if ((this as any).critChanceText && this.activeTabIndex === 0) {
            (this as any).critChanceText.setText(`치명타 확률: ${GameState.critChance}%`);
        }
        
        // 카드 업데이트 (구매 가능 여부 및 값) - Upgrade 탭일 때만
        if (this.activeTabIndex === 1) {
            // 공격력 카드 업데이트
            if ((this as any).attackPowerCard) {
                const cardData = (this as any).attackPowerCard.upgradeCardData;
                if (cardData) {
                    const currentStat = GameState.attackPower;
                    const nextStat = currentStat + 1;
                    const cost = cardData.getCost();
                    const canAfford = cardData.canAfford();
                    
                    cardData.value.setText(`(${NumberFormatter.formatNumber(currentStat)} -> ${NumberFormatter.formatNumber(nextStat)})`);
                    cardData.value.setColor(canAfford ? '#e0e0e0' : '#999999');
                    cardData.costValue.setText(`${NumberFormatter.formatNumber(cost)}`);
                    cardData.costValue.setColor(canAfford ? '#e0e0e0' : '#999999');
                    
                    // 버튼 색상 업데이트
                    const buttonX = cardData.button.x;
                    const buttonY = cardData.button.y;
                    const buttonWidth = cardData.button.width;
                    const buttonHeight = cardData.button.height;
                    const buttonRadius = 12;
                    
                    cardData.buttonBg.clear();
                    cardData.buttonBg.fillStyle(canAfford ? 0x4a90e2 : 0x555555, canAfford ? 1 : 0.8);
                    cardData.buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    cardData.buttonBg.lineStyle(2, canAfford ? 0x6ab0ff : 0x666666, canAfford ? 1 : 0.8);
                    cardData.buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                }
            }
            
            // 공격속도 카드 업데이트
            if ((this as any).attackSpeedCard) {
                const cardData = (this as any).attackSpeedCard.upgradeCardData;
                if (cardData) {
                    const currentStat = GameState.attackSpeed;
                    const isMaxLevel = cardData.isMaxLevel ? cardData.isMaxLevel() : false;
                    const cost = cardData.getCost();
                    const canAfford = !isMaxLevel && cardData.canAfford();
                    
                    if (isMaxLevel) {
                        cardData.value.setText(`(${currentStat}/15) 최대 레벨`);
                        cardData.value.setColor('#999999');
                        cardData.costValue.setText('');
                    } else {
                        const nextStat = currentStat + 1;
                        cardData.value.setText(`(${currentStat} -> ${nextStat})`);
                        cardData.value.setColor(canAfford ? '#e0e0e0' : '#999999');
                        cardData.costValue.setText(`${NumberFormatter.formatNumber(cost)}`);
                        cardData.costValue.setColor(canAfford ? '#e0e0e0' : '#999999');
                    }
                    
                    // 버튼 색상 업데이트
                    const buttonX = cardData.button.x;
                    const buttonY = cardData.button.y;
                    const buttonWidth = cardData.button.width;
                    const buttonHeight = cardData.button.height;
                    const buttonRadius = 12;
                    
                    cardData.buttonBg.clear();
                    cardData.buttonBg.fillStyle(canAfford ? 0x50c878 : 0x555555, canAfford ? 1 : 0.8);
                    cardData.buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    cardData.buttonBg.lineStyle(2, canAfford ? 0x6ad888 : 0x666666, canAfford ? 1 : 0.8);
                    cardData.buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                }
            }
            
            // 치명타 확률 카드 업데이트
            if ((this as any).critChanceCard) {
                const cardData = (this as any).critChanceCard.upgradeCardData;
                if (cardData) {
                    const currentStat = GameState.critChance;
                    const isMaxLevel = cardData.isMaxLevel ? cardData.isMaxLevel() : false;
                    const cost = cardData.getCost();
                    const canAfford = !isMaxLevel && cardData.canAfford();
                    
                    if (isMaxLevel) {
                        cardData.value.setText(`(${currentStat}%) 최대 레벨`);
                        cardData.value.setColor('#999999');
                        cardData.costValue.setText('');
                    } else {
                        const nextStat = currentStat + 1;
                        cardData.value.setText(`(${currentStat}% -> ${nextStat}%)`);
                        cardData.value.setColor(canAfford ? '#e0e0e0' : '#999999');
                        cardData.costValue.setText(`${NumberFormatter.formatNumber(cost)}`);
                        cardData.costValue.setColor(canAfford ? '#e0e0e0' : '#999999');
                    }
                    
                    // 버튼 색상 업데이트
                    const buttonX = cardData.button.x;
                    const buttonY = cardData.button.y;
                    const buttonWidth = cardData.button.width;
                    const buttonHeight = cardData.button.height;
                    const buttonRadius = 12;
                    
                    cardData.buttonBg.clear();
                    cardData.buttonBg.fillStyle(canAfford ? 0x50c878 : 0x555555, canAfford ? 1 : 0.8);
                    cardData.buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    cardData.buttonBg.lineStyle(2, canAfford ? 0x6ad888 : 0x666666, canAfford ? 1 : 0.8);
                    cardData.buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                }
            }

            // 치명타 데미지 카드 업데이트
            if ((this as any).critDamageCard) {
                const cardData = (this as any).critDamageCard.upgradeCardData;
                if (cardData) {
                    const currentStat = GameState.critDamage;
                    const isMaxLevel = cardData.isMaxLevel ? cardData.isMaxLevel() : false;
                    const cost = cardData.getCost();
                    const canAfford = !isMaxLevel && cardData.canAfford();
                    
                    if (isMaxLevel) {
                        cardData.value.setText(`(${currentStat}%) 최대 레벨`);
                        cardData.value.setColor('#999999');
                        cardData.costValue.setText('');
                    } else {
                        const nextStat = currentStat + 1;
                        cardData.value.setText(`(${currentStat}% -> ${nextStat}%)`);
                        cardData.value.setColor(canAfford ? '#e0e0e0' : '#999999');
                        cardData.costValue.setText(`${NumberFormatter.formatNumber(cost)}`);
                        cardData.costValue.setColor(canAfford ? '#e0e0e0' : '#999999');
                    }
                    
                    // 버튼 색상 업데이트
                    const buttonX = cardData.button.x;
                    const buttonY = cardData.button.y;
                    const buttonWidth = cardData.button.width;
                    const buttonHeight = cardData.button.height;
                    const buttonRadius = 12;
                    
                    cardData.buttonBg.clear();
                    cardData.buttonBg.fillStyle(canAfford ? 0x50c878 : 0x555555, canAfford ? 1 : 0.8);
                    cardData.buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    cardData.buttonBg.lineStyle(2, canAfford ? 0x6ad888 : 0x666666, canAfford ? 1 : 0.8);
                    cardData.buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                }
            }
            
            // SP 구매 카드 업데이트
            if ((this as any).spPurchaseCard) {
                const cardData = (this as any).spPurchaseCard.upgradeCardData;
                if (cardData) {
                    const currentCount = GameState.spPurchaseCount;
                    const isMaxLevel = cardData.isMaxLevel ? cardData.isMaxLevel() : false;
                    const cost = cardData.getCost();
                    const canPurchase = !isMaxLevel && cardData.canAfford();
                    
                    if (isMaxLevel) {
                        cardData.value.setText(`(${currentCount}/5) 최대 구매 완료`);
                        cardData.value.setColor('#999999');
                        cardData.costValue.setText('');
                    } else {
                        const nextCount = currentCount + 1;
                        cardData.value.setText(`(${currentCount}/5 -> ${nextCount}/5)`);
                        cardData.value.setColor(canPurchase ? '#e0e0e0' : '#999999');
                        cardData.costValue.setText(`${NumberFormatter.formatNumber(cost)}`);
                        cardData.costValue.setColor(canPurchase ? '#e0e0e0' : '#999999');
                    }
                    
                    // 버튼 색상 업데이트
                    const buttonX = cardData.button.x;
                    const buttonY = cardData.button.y;
                    const buttonWidth = cardData.button.width;
                    const buttonHeight = cardData.button.height;
                    const buttonRadius = 12;
                    
                    cardData.buttonBg.clear();
                    cardData.buttonBg.fillStyle(canPurchase ? 0xffd700 : 0x555555, canPurchase ? 1 : 0.8);
                    cardData.buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    cardData.buttonBg.lineStyle(2, canPurchase ? 0xffed4e : 0x666666, canPurchase ? 1 : 0.8);
                    cardData.buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                }
            }
        }

        // SP 표시 업데이트 - Skill 탭일 때만
        if (this.skillSpText && this.activeTabIndex === 2) {
            this.skillSpText.setText(`SP: ${NumberFormatter.formatNumber(GameState.sp)}`);
        }
        
        // 스킬 습득 버튼 상태 업데이트 - Skill 탭일 때만
        if (this.activeTabIndex === 2) {
            // 각 스킬 카드를 순회하며 버튼 상태 업데이트
            this.skillCards.forEach((card) => {
                const cardData = (card as any).skillCardData;
                // 버튼이 있는 카드만 업데이트 (습득하지 않은 스킬)
                if (cardData) {
                    const skillId = cardData.skillId;
                    const isLearned = GameState.isSkillLearned(skillId);
                    const skillConfig = SkillConfigs.find(s => s.id === skillId);
                    
                    if (!skillConfig) return;
                    
                    const canLearn = !isLearned && GameState.sp >= skillConfig.spCost;
                    const buttonBg = cardData.buttonBg;
                    const buttonText = cardData.buttonText;
                    const buttonWidth = cardData.buttonWidth;
                    const buttonHeight = cardData.buttonHeight;
                    const buttonRadius = cardData.buttonRadius;
                    const buttonX = cardData.buttonX;
                    const buttonY = cardData.buttonY;
                    
                    // 버튼 색상 업데이트
                    buttonBg.clear();
                    buttonBg.fillStyle(canLearn ? 0x50c878 : 0x555555, canLearn ? 1 : 0.8);
                    buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    buttonBg.lineStyle(2, canLearn ? 0x6ad888 : 0x666666, canLearn ? 1 : 0.8);
                    buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    
                    buttonText.setColor(canLearn ? '#ffffff' : '#999999');
                }
            });
        }
        
        // 화면 중앙 스킬 사용 버튼 쿨타임 및 지속시간 업데이트
        if (scene && this.skillUseCooldownTexts.length > 0) {
            const learnedSkills = GameState.learnedSkills;
            const now = scene.time.now;
            
            learnedSkills.forEach((skillId, index) => {
                if (index < this.skillUseCooldownTexts.length && index < this.skillUseCooldownMasks.length && index < this.skillUseCooldownStates.length) {
                    const cooldownText = this.skillUseCooldownTexts[index];
                    const cooldownMask = this.skillUseCooldownMasks[index];
                    const cooldownState = this.skillUseCooldownStates[index];
                    const skillConfig = SkillConfigs.find(s => s.id === skillId);
                    if (!skillConfig) return;
                    
                    const remaining = SkillManager.getRemainingCooldown(skillId, now);
                    const isInCooldown = remaining > 0;
                    
                    // Buff 스킬 지속시간 확인
                    const isBuffSkill = skillConfig.skillType === 2;
                    const buffRemaining = isBuffSkill ? GameState.getBuffRemainingDuration(skillId, now) : 0;
                    const isBuffActive = buffRemaining > 0;
                    
                    // 텍스트 업데이트: 지속시간이 우선, 없으면 쿨타임, 둘 다 없으면 준비 완료
                    let displayText = '준비 완료';
                    let displayColor = '#ffffff';
                    let displaySecond = -1;
                    
                    if (isBuffActive) {
                        displaySecond = Math.ceil(buffRemaining);
                        displayText = `${displaySecond}초`;
                        displayColor = '#ffff00'; // 노란색
                    } else if (isInCooldown) {
                        displaySecond = Math.ceil(remaining);
                        displayText = `${displaySecond}초`;
                        displayColor = '#ffcc00'; // 주황색
                    }
                    
                    // 최적화: 텍스트는 초 단위로 변경될 때만 업데이트
                    if (cooldownState.lastSecond !== displaySecond) {
                        cooldownState.lastSecond = displaySecond;
                        cooldownText.setText(displayText);
                        cooldownText.setColor(displayColor);
                    }
                    
                    // 쿨타임 및 지속시간 마스크 업데이트
                    if (skillConfig && index < this.skillUseButtons.length && index < this.skillUseButtonBgs.length) {
                        const useButton = this.skillUseButtons[index];
                        const buttonBg = this.skillUseButtonBgs[index];
                        const buttonX = useButton.x;
                        const buttonY = useButton.y;
                        const buttonRadius = useButton.radius;
                        
                        // Buff 스킬 지속시간 마스크 가져오기
                        const buffDurationMask = index < this.skillBuffDurationMasks.length ? this.skillBuffDurationMasks[index] : null;
                        
                        // 버튼 비활성화 처리 (지속시간 중일 때)
                        if (isBuffActive) {
                            // 버튼을 반투명하게 표시
                            useButton.setAlpha(0.5);
                            buttonBg.setAlpha(0.5);
                        } else {
                            // 정상 상태로 복원
                            useButton.setAlpha(1);
                            buttonBg.setAlpha(1);
                        }
                        
                        // 최적화: 쿨타임 상태가 변경될 때만 배경 업데이트
                        if (cooldownState.isInCooldown !== isInCooldown && !isBuffActive) {
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
                        
                        // Buff 스킬 지속시간 마스크 업데이트 (지속시간 중일 때만)
                        if (isBuffSkill && buffDurationMask) {
                            buffDurationMask.clear();
                            
                            if (isBuffActive && skillConfig.duration) {
                                // 지속시간 진행률 계산 (0~1, 남은 시간 / 전체 지속시간)
                                const progress = buffRemaining / skillConfig.duration;
                                // 채워져야 할 각도 (라디안) - 시계 반대 방향으로 채워짐
                                const angle = progress * Math.PI * 2;
                                
                                // 반투명한 노란색으로 표시
                                buffDurationMask.fillStyle(0xffff00, 0.35); // 노란색, 반투명
                                
                                // 원형 섹터 그리기 (시계 반대 방향으로 채워짐)
                                // 시작 각도: -90도 (위쪽에서 시작)
                                const startAngle = -Math.PI / 2;
                                
                                if (angle > 0) {
                                    buffDurationMask.beginPath();
                                    buffDurationMask.moveTo(buttonX, buttonY);
                                    // 시작점에서 원의 경계까지
                                    buffDurationMask.lineTo(
                                        buttonX + Math.cos(startAngle) * buttonRadius,
                                        buttonY + Math.sin(startAngle) * buttonRadius
                                    );
                                    // 원호 그리기 (시계 반대 방향)
                                    buffDurationMask.arc(
                                        buttonX, buttonY, buttonRadius,
                                        startAngle, startAngle - angle,
                                        true // 시계 반대 방향
                                    );
                                    // 중심으로 돌아오기
                                    buffDurationMask.lineTo(buttonX, buttonY);
                                    buffDurationMask.closePath();
                                    buffDurationMask.fillPath();
                                }
                            }
                        }
                        
                        // 쿨타임 마스크는 지속시간이 없을 때만 표시
                        cooldownMask.clear();
                        
                        if (remaining > 0 && !isBuffActive) {
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
