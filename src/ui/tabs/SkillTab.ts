// Skill 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { SkillManager } from '../../managers/SkillManager';
import { SkillConfigs } from '../../config/gameConfig';
import { NumberFormatter } from '../../utils/NumberFormatter';
import { SkillUseButtonsState } from '../common/SkillUseButtons';

export interface SkillTabState {
    skillCards: Phaser.GameObjects.Container[];
    skillSpText: Phaser.GameObjects.Text | null;
    skillUseButtonsState: SkillUseButtonsState;
}

export const SkillTab = {
    // Skill 탭 내용 생성
    createSkillTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        tabIndex: number,
        state: SkillTabState,
        tabContents: Phaser.GameObjects.Container[]
    ): void {
        // 기존 탭 컨텐츠 제거
        if (tabContents[tabIndex]) {
            tabContents[tabIndex].destroy();
            tabContents[tabIndex] = null as any;
        }
        
        // 기존 스킬 카드들 제거
        state.skillCards.forEach(card => card.destroy());
        state.skillCards = [];
        
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
        state.skillSpText = scene.add.text(gameWidth / 2, spY, `SP: ${NumberFormatter.formatNumber(GameState.sp)}`, {
            fontSize: spFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `600 ${spFontSize} Arial`,
            stroke: '#b8860b',
            strokeThickness: 1
        });
        state.skillSpText.setOrigin(0.5);
        contentContainer.add(state.skillSpText);

        // 스킬 카드 영역 (세로 배치)
        const skillCardStartY = spY + uiAreaHeight * 0.15;
        const skillCardWidth = gameWidth * 0.95;
        const skillCardHeight = uiAreaHeight * 0.15;
        const skillCardSpacing = uiAreaHeight * 0.02;
        const cardX = gameWidth / 2;

        // 각 스킬에 대해 카드 생성
        SkillConfigs.forEach((skillConfig, index) => {
            const cardY = skillCardStartY + index * (skillCardHeight + skillCardSpacing);
            const skillCard = SkillTab.createSkillCard(scene, skillConfig, cardX, cardY, skillCardWidth, skillCardHeight);
            contentContainer.add(skillCard);
            state.skillCards.push(skillCard);
        });

        tabContents[tabIndex] = contentContainer;
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

        const centerY = 0;
        const itemSpacing = padding * 1.5;
        
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

        const buttonWidth = !isLearned ? width * 0.15 : 0;
        const buttonAreaWidth = buttonWidth + padding;
        
        // 2. descText
        const descFontSize = Responsive.getFontSize(scene, 10);
        const nameTextWidth = nameText.width;
        const descX = nameX + nameTextWidth + itemSpacing;
        
        const currentSkillPower = isLearned ? SkillManager.getSkillPower(skillConfig.id) : skillConfig.skillPower;
        const currentLevel = isLearned ? GameState.getSkillLevel(skillConfig.id) : 1;
        const maxLevel = skillConfig.maxLevel || 1;
        
        let descTextContent = `×${currentSkillPower} | ${skillConfig.cooldown}초`;
        if (skillConfig.skillType === 2 && skillConfig.duration) {
            descTextContent = `×${currentSkillPower} | ${skillConfig.duration}초 지속 | ${skillConfig.cooldown}초 쿨타임`;
            if (skillConfig.id === 'buff_anchovy_shot') {
                descTextContent = `투사체 ×${currentSkillPower}배 | ${skillConfig.duration}초 지속 | ${skillConfig.cooldown}초 쿨타임`;
            }
        }
        const descText = scene.add.text(descX, centerY, descTextContent, {
            fontSize: descFontSize,
            color: '#b0b0b0',
            fontFamily: 'Arial',
            font: `400 ${descFontSize} Arial`
        });
        descText.setOrigin(0, 0.5);
        const maxDescWidth = width / 2 - descX - buttonAreaWidth - itemSpacing * 2;
        if (descText.width > maxDescWidth && maxDescWidth > 0) {
            descText.setWordWrapWidth(maxDescWidth);
        }
        cardContainer.add(descText);

        // 3. statusText
        const statusFontSize = Responsive.getFontSize(scene, 12);
        let statusText: Phaser.GameObjects.Text;
        
        if (isLearned) {
            const statusX = width / 2 - padding;
            let statusTextContent = '';
            if (!skillConfig.maxLevel || currentLevel >= maxLevel) {
                statusTextContent = '✓ 습득 완료';
            }
            statusText = scene.add.text(statusX, centerY, statusTextContent, {
                fontSize: statusFontSize,
                color: '#4ade80',
                fontFamily: 'Arial',
                font: `500 ${statusFontSize} Arial`
            });
            statusText.setOrigin(1, 0.5);
        } else {
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

        // 4. 레벨 업그레이드 버튼 또는 습득 버튼
        if (isLearned && skillConfig.maxLevel && skillConfig.maxLevel > 1 && currentLevel < maxLevel) {
            const buttonWidth = width * 0.15;
            const buttonHeight = height * 0.5;
            const buttonRadius = 8;
            const buttonX = width / 2 - padding * 0.5 - buttonWidth / 2;
            const buttonY = centerY;
            
            const levelTextX = buttonX - buttonWidth / 2 - itemSpacing;
            const levelText = scene.add.text(levelTextX, centerY, `Lv.${currentLevel}/${maxLevel}`, {
                fontSize: statusFontSize,
                color: '#4ade80',
                fontFamily: 'Arial',
                font: `500 ${statusFontSize} Arial`
            });
            levelText.setOrigin(1, 0.5);
            cardContainer.add(levelText);
            
            const buttonBg = scene.add.graphics();
            const canUpgrade = GameState.sp >= (skillConfig.spUpgradeCost || 0);
            buttonBg.fillStyle(canUpgrade ? 0xff6b35 : 0x555555, canUpgrade ? 1 : 0.8);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, canUpgrade ? 0xff8b55 : 0x666666, canUpgrade ? 1 : 0.8);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.setDepth(100);
            cardContainer.add(buttonBg);
            
            const upgradeButton = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x000000, 0);
            upgradeButton.setInteractive({ useHandCursor: true });
            upgradeButton.setDepth(101);
            
            const skillId = skillConfig.id;
            upgradeButton.on('pointerdown', () => {
                if (GameState.upgradeSkill(skillId)) {
                    // UI 업데이트는 외부에서 처리
                    if ((scene as any).refreshSkillTab) {
                        (scene as any).refreshSkillTab();
                    }
                }
            });
            
            upgradeButton.on('pointerover', () => {
                if (canUpgrade) {
                    buttonBg.clear();
                    buttonBg.fillStyle(0xff8b55, 1);
                    buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    buttonBg.lineStyle(2, 0xffab75, 1);
                    buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                }
            });
            
            upgradeButton.on('pointerout', () => {
                buttonBg.clear();
                buttonBg.fillStyle(canUpgrade ? 0xff6b35 : 0x555555, canUpgrade ? 1 : 0.8);
                buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                buttonBg.lineStyle(2, canUpgrade ? 0xff8b55 : 0x666666, canUpgrade ? 1 : 0.8);
                buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            });
            
            cardContainer.add(upgradeButton);
            
            const buttonTextFontSize = Responsive.getFontSize(scene, 11);
            const buttonText = scene.add.text(buttonX, buttonY, `SP ${skillConfig.spUpgradeCost}`, {
                fontSize: buttonTextFontSize,
                color: canUpgrade ? '#ffffff' : '#999999',
                fontFamily: 'Arial',
                font: `600 ${buttonTextFontSize} Arial`
            });
            buttonText.setOrigin(0.5);
            buttonText.setDepth(102);
            cardContainer.add(buttonText);
        } else if (!isLearned) {
            const buttonWidth = width * 0.15;
            const buttonHeight = height * 0.5;
            const buttonRadius = 8;
            const buttonX = width / 2 - padding * 0.5 - buttonWidth / 2;
            const buttonY = centerY;

            const buttonBg = scene.add.graphics();
            const canLearn = GameState.sp >= skillConfig.spCost;
            buttonBg.fillStyle(canLearn ? 0x50c878 : 0x555555, canLearn ? 1 : 0.8);
            buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.lineStyle(2, canLearn ? 0x6ad888 : 0x666666, canLearn ? 1 : 0.8);
            buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
            buttonBg.setDepth(100);
            cardContainer.add(buttonBg);

            const learnButton = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x000000, 0);
            learnButton.setInteractive({ useHandCursor: true });
            learnButton.setDepth(101);
            
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
            buttonText.setDepth(102);
            cardContainer.add(buttonText);
            
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
    
    
    // Skill 탭 업데이트
    update(
        _scene: Phaser.Scene,
        state: SkillTabState,
        activeTabIndex: number
    ): void {
        // SP 표시 업데이트
        if (state.skillSpText && activeTabIndex === 2) {
            state.skillSpText.setText(`SP: ${NumberFormatter.formatNumber(GameState.sp)}`);
        }
        
        // 스킬 습득 버튼 상태 업데이트
        if (activeTabIndex === 2) {
            state.skillCards.forEach((card) => {
                const cardData = (card as any).skillCardData;
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
                    
                    buttonBg.clear();
                    buttonBg.fillStyle(canLearn ? 0x50c878 : 0x555555, canLearn ? 1 : 0.8);
                    buttonBg.fillRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    buttonBg.lineStyle(2, canLearn ? 0x6ad888 : 0x666666, canLearn ? 1 : 0.8);
                    buttonBg.strokeRoundedRect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, buttonRadius);
                    
                    buttonText.setColor(canLearn ? '#ffffff' : '#999999');
                }
            });
        }
        
    }
};
