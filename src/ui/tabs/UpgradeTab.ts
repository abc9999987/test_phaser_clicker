// Upgrade 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { NumberFormatter } from '../../utils/NumberFormatter';

export interface UpgradeTabState {
    upgradeCards: Phaser.GameObjects.Container[];
    attackPowerCard: Phaser.GameObjects.Container | null;
    attackSpeedCard: Phaser.GameObjects.Container | null;
    critChanceCard: Phaser.GameObjects.Container | null;
    critDamageCard: Phaser.GameObjects.Container | null;
    spPurchaseCard: Phaser.GameObjects.Container | null;
}

export const UpgradeTab = {
    // Upgrade 탭 내용 생성
    createUpgradeTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        tabIndex: number,
        state: UpgradeTabState,
        tabContents: Phaser.GameObjects.Container[]
    ): void {
        const contentContainer = scene.add.container(0, 0);
        
        const cardStartY = uiAreaStartY + uiAreaHeight * 0.15;
        const cardWidth = gameWidth * 0.95;
        const cardHeight = uiAreaHeight * 0.12;
        const cardSpacing = uiAreaHeight * 0.02;
        const cardX = gameWidth / 2;
        
        state.upgradeCards.forEach(card => card.destroy());
        state.upgradeCards = [];
        
        // 1. 공격력 강화 카드
        const attackPowerCardY = cardStartY;
        const attackPowerCurrent = GameState.attackPower;
        const attackPowerNext = attackPowerCurrent + 1;
        const attackPowerCost = GameState.getAttackPowerUpgradeCost();
        
        const attackPowerCard = UpgradeTab.createUpgradeCard(
            scene,
            cardX,
            attackPowerCardY,
            cardWidth,
            cardHeight,
            '공격력',
            `(${NumberFormatter.formatNumber(attackPowerCurrent)} -> ${NumberFormatter.formatNumber(attackPowerNext)})`,
            `${NumberFormatter.formatNumber(attackPowerCost)}`,
            0x4a90e2,
            0x5a9fff,
            0x6ab0ff,
            () => GameState.upgradeAttackPower(),
            () => GameState.getAttackPowerUpgradeCost(),
            () => GameState.coins >= GameState.getAttackPowerUpgradeCost(),
            undefined,
            state
        );
        contentContainer.add(attackPowerCard);
        state.upgradeCards.push(attackPowerCard);
        state.attackPowerCard = attackPowerCard;
        
        // 2. 공격속도 강화 카드
        const attackSpeedCardY = cardStartY + cardHeight + cardSpacing;
        const attackSpeedCurrent = GameState.attackSpeed;
        const attackSpeedNext = attackSpeedCurrent + 1;
        const attackSpeedCost = GameState.getAttackSpeedUpgradeCost();
        const isAttackSpeedMax = attackSpeedCurrent >= 15;
        
        const attackSpeedCard = UpgradeTab.createUpgradeCard(
            scene,
            cardX,
            attackSpeedCardY,
            cardWidth,
            cardHeight,
            '공격속도',
            isAttackSpeedMax ? `(${attackSpeedCurrent}/15) 최대 레벨` : `(${attackSpeedCurrent} -> ${attackSpeedNext})`,
            isAttackSpeedMax ? '' : `${NumberFormatter.formatNumber(attackSpeedCost)}`,
            0x50c878,
            0x60d888,
            0x6ad888,
            () => {
                const result = GameState.upgradeAttackSpeed();
                if (result && (scene as any).setupAutoFire) {
                    (scene as any).setupAutoFire();
                }
                return result;
            },
            () => GameState.getAttackSpeedUpgradeCost(),
            () => GameState.coins >= GameState.getAttackSpeedUpgradeCost(),
            () => GameState.attackSpeed >= 15,
            state
        );
        contentContainer.add(attackSpeedCard);
        state.upgradeCards.push(attackSpeedCard);
        state.attackSpeedCard = attackSpeedCard;
        
        // 3. 치명타 확률 강화 카드
        const critChanceCardY = cardStartY + (cardHeight + cardSpacing) * 2;
        const critChanceCurrent = GameState.critChance;
        const critChanceNext = critChanceCurrent + 1;
        const critChanceCost = GameState.getCritChanceUpgradeCost();
        const isCritChanceMax = critChanceCurrent >= 100;
        
        const critChanceCard = UpgradeTab.createUpgradeCard(
            scene,
            cardX,
            critChanceCardY,
            cardWidth,
            cardHeight,
            '치명타확률',
            isCritChanceMax ? `(${critChanceCurrent}%) 최대 레벨` : `(${critChanceCurrent}% -> ${critChanceNext}%)`,
            isCritChanceMax ? '' : `${critChanceCost}`,
            0x50c878,
            0x60d888,
            0x6ad888,
            () => GameState.upgradeCritChance(),
            () => GameState.getCritChanceUpgradeCost(),
            () => GameState.coins >= GameState.getCritChanceUpgradeCost(),
            () => GameState.critChance >= 100,
            state
        );
        contentContainer.add(critChanceCard);
        state.upgradeCards.push(critChanceCard);
        state.critChanceCard = critChanceCard;

        // 4. 치명타 데미지 강화 카드
        const critDamageCardY = cardStartY + (cardHeight + cardSpacing) * 3;
        const critDamageCurrent = GameState.critDamage;
        const critDamageNext = critDamageCurrent + 1;
        const critDamageCost = GameState.getCritDamageUpgradeCost();
        const isCritDamageMax = critDamageCurrent >= 100;
        
        const critDamageCard = UpgradeTab.createUpgradeCard(
            scene,
            cardX,
            critDamageCardY,
            cardWidth,
            cardHeight,
            '치명타데미지',
            isCritDamageMax ? `(${critDamageCurrent}%) 최대 레벨` : `(${critDamageCurrent}% -> ${critDamageNext}%)`,
            isCritDamageMax ? '' : `${critDamageCost}`,
            0x50c878,
            0x60d888,
            0x6ad888,
            () => GameState.upgradeCritDamage(),
            () => GameState.getCritDamageUpgradeCost(),
            () => GameState.coins >= GameState.getCritDamageUpgradeCost(),
            () => GameState.critDamage >= 100,
            state
        );
        contentContainer.add(critDamageCard);
        state.upgradeCards.push(critDamageCard);
        state.critDamageCard = critDamageCard;
        
        // 5. SP 구매 카드
        const spPurchaseCardY = cardStartY + (cardHeight + cardSpacing) * 4;
        const spPurchaseCurrent = GameState.spPurchaseCount;
        const spPurchaseNext = spPurchaseCurrent + 1;
        const spPurchaseCost = GameState.getSpPurchaseCost();
        const isSpPurchaseMax = spPurchaseCurrent >= 5;
        
        const spPurchaseCard = UpgradeTab.createUpgradeCard(
            scene,
            cardX,
            spPurchaseCardY,
            cardWidth,
            cardHeight,
            'SP 구매',
            isSpPurchaseMax ? `(${spPurchaseCurrent}/10) 최대 구매 완료` : `(${spPurchaseCurrent}/10 -> ${spPurchaseNext}/10)`,
            isSpPurchaseMax ? '' : `${NumberFormatter.formatNumber(spPurchaseCost)}`,
            0xffd700,
            0xffed4e,
            0xffed4e,
            () => GameState.purchaseSp(),
            () => GameState.getSpPurchaseCost(),
            () => GameState.coins >= GameState.getSpPurchaseCost(),
            () => GameState.spPurchaseCount >= 10,
            state
        );
        contentContainer.add(spPurchaseCard);
        state.upgradeCards.push(spPurchaseCard);
        state.spPurchaseCard = spPurchaseCard;
        
        tabContents[tabIndex] = contentContainer;
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
        isMaxLevel: (() => boolean) | undefined,
        state: UpgradeTabState
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        const cardRadius = 12;
        const padding = 10;
        const buttonRadius = 12;
        const x1ButtonWidth = 50;
        const x1ButtonHeight = 35;
        
        const cardBg = scene.add.graphics();
        cardBg.fillStyle(0x2a2a3a, 0.95);
        cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardBg.lineStyle(2, 0x4a4a5a, 0.8);
        cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
        cardContainer.add(cardBg);
        
        const centerY = 0;
        const startX = -width / 2 + padding;
        const centerX = 0;
        const buttonSpacing = 5;
        const maxButtonWidth = 50;
        const maxButtonHeight = 35;
        const maxButtonX = width / 2 - padding - maxButtonWidth / 2;
        const buttonX = maxButtonX - maxButtonWidth / 2 - buttonSpacing - x1ButtonWidth / 2;
        
        const labelFontSize = Responsive.getFontSize(scene, 18);
        const labelY = centerY - 8;
        
        const label = scene.add.text(startX, labelY, labelText, {
            fontSize: labelFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${labelFontSize} Arial`
        });
        label.setOrigin(0, 0.5);
        cardContainer.add(label);
        
        const costLabel = scene.add.text(centerX, labelY, '비용', {
            fontSize: labelFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${labelFontSize} Arial`
        });
        costLabel.setOrigin(0.5, 0.5);
        cardContainer.add(costLabel);
        
        const valueFontSize = Responsive.getFontSize(scene, 14);
        const valueY = centerY + 8;
        
        const value = scene.add.text(startX, valueY, valueText, {
            fontSize: valueFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${valueFontSize} Arial`
        });
        value.setOrigin(0, 0.5);
        cardContainer.add(value);
        
        const costValue = scene.add.text(centerX, valueY, costText, {
            fontSize: valueFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${valueFontSize} Arial`
        });
        costValue.setOrigin(0.5, 0.5);
        cardContainer.add(costValue);
        
        const buttonBg = scene.add.graphics();
        const canAffordNow = isMaxLevel ? !isMaxLevel() && canAfford() : canAfford();
        buttonBg.fillStyle(canAffordNow ? buttonColor : 0x555555, canAffordNow ? 1 : 0.8);
        buttonBg.fillRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        buttonBg.lineStyle(2, canAffordNow ? buttonBorderColor : 0x666666, canAffordNow ? 1 : 0.8);
        buttonBg.strokeRoundedRect(buttonX - x1ButtonWidth / 2, centerY - x1ButtonHeight / 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        cardContainer.add(buttonBg);
        
        const buttonShadow = scene.add.graphics();
        buttonShadow.fillStyle(0x000000, 0.2);
        buttonShadow.fillRoundedRect(buttonX - x1ButtonWidth / 2 + 2, centerY - x1ButtonHeight / 2 + 2, x1ButtonWidth, x1ButtonHeight, buttonRadius);
        buttonShadow.setDepth(-1);
        cardContainer.add(buttonShadow);
        
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
        
        const x1ButtonFontSize = Responsive.getFontSize(scene, 14);
        const buttonText = scene.add.text(buttonX, centerY, 'x1', {
            fontSize: x1ButtonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${x1ButtonFontSize} Arial`
        });
        buttonText.setOrigin(0.5);
        cardContainer.add(buttonText);
        
        const maxButtonBg = scene.add.graphics();
        maxButtonBg.fillStyle(canAffordNow ? 0xff6b35 : 0x555555, canAffordNow ? 1 : 0.8);
        maxButtonBg.fillRoundedRect(maxButtonX - maxButtonWidth / 2, centerY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
        maxButtonBg.lineStyle(2, canAffordNow ? 0xff8c5a : 0x666666, canAffordNow ? 1 : 0.8);
        maxButtonBg.strokeRoundedRect(maxButtonX - maxButtonWidth / 2, centerY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
        cardContainer.add(maxButtonBg);
        
        const maxButtonShadow = scene.add.graphics();
        maxButtonShadow.fillStyle(0x000000, 0.2);
        maxButtonShadow.fillRoundedRect(maxButtonX - maxButtonWidth / 2 + 2, centerY - maxButtonHeight / 2 + 2, maxButtonWidth, maxButtonHeight, buttonRadius);
        maxButtonShadow.setDepth(-1);
        cardContainer.add(maxButtonShadow);
        
        const maxButton = scene.add.rectangle(maxButtonX, centerY, maxButtonWidth, maxButtonHeight, 0x000000, 0);
        maxButton.setInteractive({ useHandCursor: true });
        maxButton.on('pointerdown', () => {
            // onUpdate 콜백은 외부에서 설정
            if ((scene as any).onUpgradeUpdate) {
                UpgradeTab.performMaxUpgrade(scene, cardContainer, state, (scene as any).onUpgradeUpdate);
            } else {
                UpgradeTab.performMaxUpgrade(scene, cardContainer, state);
            }
        });
        maxButton.on('pointerover', () => {
            maxButtonBg.clear();
            const maxed = isMaxLevel ? isMaxLevel() : false;
            if (!maxed) {
                maxButtonBg.fillStyle(0xff8c5a, 1);
                maxButtonBg.lineStyle(2, 0xffa680, 1);
            } else {
                maxButtonBg.fillStyle(0x555555, 0.8);
                maxButtonBg.lineStyle(2, 0x666666, 0.8);
            }
            maxButtonBg.fillRoundedRect(maxButtonX - maxButtonWidth / 2, centerY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
            maxButtonBg.strokeRoundedRect(maxButtonX - maxButtonWidth / 2, centerY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
        });
        maxButton.on('pointerout', () => {
            maxButtonBg.clear();
            const maxed = isMaxLevel ? isMaxLevel() : false;
            const canAffordNow = !maxed && canAfford();
            maxButtonBg.fillStyle(canAffordNow ? 0xff6b35 : 0x555555, canAffordNow ? 1 : 0.8);
            maxButtonBg.lineStyle(2, canAffordNow ? 0xff8c5a : 0x666666, canAffordNow ? 1 : 0.8);
            maxButtonBg.fillRoundedRect(maxButtonX - maxButtonWidth / 2, centerY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
            maxButtonBg.strokeRoundedRect(maxButtonX - maxButtonWidth / 2, centerY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
        });
        cardContainer.add(maxButton);
        
        const maxButtonFontSize = Responsive.getFontSize(scene, 14);
        const maxButtonText = scene.add.text(maxButtonX, centerY, 'max', {
            fontSize: maxButtonFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${maxButtonFontSize} Arial`
        });
        maxButtonText.setOrigin(0.5);
        cardContainer.add(maxButtonText);
        
        (cardContainer as any).upgradeCardData = {
            label,
            costLabel,
            value,
            costValue,
            button,
            buttonBg,
            buttonText,
            maxButton,
            maxButtonBg,
            maxButtonText,
            onUpgrade,
            getCost,
            canAfford,
            isMaxLevel
        };
        
        return cardContainer;
    },
    
    // 모든 업그레이드 버튼 비활성화
    disableAllUpgradeButtons(state: UpgradeTabState): void {
        state.upgradeCards.forEach((card) => {
            const cardData = (card as any).upgradeCardData;
            if (cardData) {
                if (cardData.button) {
                    cardData.button.disableInteractive();
                    cardData.button.setAlpha(0.5);
                }
                if (cardData.maxButton) {
                    cardData.maxButton.disableInteractive();
                    cardData.maxButton.setAlpha(0.5);
                }
                if (cardData.buttonBg) {
                    cardData.buttonBg.setAlpha(0.5);
                }
                if (cardData.maxButtonBg) {
                    cardData.maxButtonBg.setAlpha(0.5);
                }
            }
        });
    },
    
    // 모든 업그레이드 버튼 활성화
    enableAllUpgradeButtons(state: UpgradeTabState): void {
        state.upgradeCards.forEach((card) => {
            const cardData = (card as any).upgradeCardData;
            if (cardData) {
                if (cardData.button) {
                    cardData.button.setInteractive({ useHandCursor: true });
                    cardData.button.setAlpha(1);
                }
                if (cardData.maxButton) {
                    cardData.maxButton.setInteractive({ useHandCursor: true });
                    cardData.maxButton.setAlpha(1);
                }
                if (cardData.buttonBg) {
                    cardData.buttonBg.setAlpha(1);
                }
                if (cardData.maxButtonBg) {
                    cardData.maxButtonBg.setAlpha(1);
                }
            }
        });
    },
    
    // 카드의 max 버튼 업데이트
    updateMaxButton(cardData: any, canAfford: boolean, isMaxed: boolean, buttonColor: number, buttonBorderColor: number): void {
        if (!cardData.maxButton || !cardData.maxButtonBg) return;
        
        const maxButtonX = cardData.maxButton.x;
        const maxButtonY = cardData.maxButton.y;
        const maxButtonWidth = cardData.maxButton.width;
        const maxButtonHeight = cardData.maxButton.height;
        const buttonRadius = 12;
        
        cardData.maxButtonBg.clear();
        const canClick = !isMaxed && canAfford;
        cardData.maxButtonBg.fillStyle(canClick ? buttonColor : 0x555555, canClick ? 1 : 0.8);
        cardData.maxButtonBg.fillRoundedRect(maxButtonX - maxButtonWidth / 2, maxButtonY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
        cardData.maxButtonBg.lineStyle(2, canClick ? buttonBorderColor : 0x666666, canClick ? 1 : 0.8);
        cardData.maxButtonBg.strokeRoundedRect(maxButtonX - maxButtonWidth / 2, maxButtonY - maxButtonHeight / 2, maxButtonWidth, maxButtonHeight, buttonRadius);
    },
    
    // Max 업그레이드 수행
    performMaxUpgrade(scene: Phaser.Scene, targetCard: Phaser.GameObjects.Container, state: UpgradeTabState, onUpdate?: () => void): void {
        const cardData = (targetCard as any).upgradeCardData;
        if (!cardData) return;
        
        if (cardData.isMaxLevel && cardData.isMaxLevel()) {
            return;
        }
        
        UpgradeTab.disableAllUpgradeButtons(state);
        
        let upgradeCount = 0;
        const maxIterations = 100000;
        const batchSize = 100;
        
        const performUpgradeBatch = () => {
            let batchCount = 0;
            
            while (batchCount < batchSize && upgradeCount < maxIterations) {
                if (cardData.isMaxLevel && cardData.isMaxLevel()) {
                    UpgradeTab.enableAllUpgradeButtons(state);
                    if (onUpdate) onUpdate();
                    return;
                }
                
                if (!cardData.canAfford()) {
                    UpgradeTab.enableAllUpgradeButtons(state);
                    if (onUpdate) onUpdate();
                    return;
                }
                
                const success = cardData.onUpgrade();
                if (success) {
                    upgradeCount++;
                    batchCount++;
                } else {
                    UpgradeTab.enableAllUpgradeButtons(state);
                    if (onUpdate) onUpdate();
                    return;
                }
            }
            
            if (onUpdate) onUpdate();
            
            if (upgradeCount < maxIterations) {
                scene.time.delayedCall(0, performUpgradeBatch);
            } else {
                UpgradeTab.enableAllUpgradeButtons(state);
                if (onUpdate) onUpdate();
            }
        };
        
        performUpgradeBatch();
    },
    
    // Upgrade 탭 업데이트
    update(
        _scene: Phaser.Scene,
        state: UpgradeTabState,
        activeTabIndex: number
    ): void {
        if (activeTabIndex !== 1) return;
        
        // 공격력 카드 업데이트
        if (state.attackPowerCard) {
            const cardData = (state.attackPowerCard as any).upgradeCardData;
            if (cardData) {
                const currentStat = GameState.attackPower;
                const nextStat = currentStat + 1;
                const cost = cardData.getCost();
                const canAfford = cardData.canAfford();
                
                cardData.value.setText(`(${NumberFormatter.formatNumber(currentStat)} -> ${NumberFormatter.formatNumber(nextStat)})`);
                cardData.value.setColor(canAfford ? '#e0e0e0' : '#999999');
                cardData.costValue.setText(`${NumberFormatter.formatNumber(cost)}`);
                cardData.costValue.setColor(canAfford ? '#e0e0e0' : '#999999');
                
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
                
                UpgradeTab.updateMaxButton(cardData, canAfford, false, 0xff6b35, 0xff8c5a);
            }
        }
        
        // 공격속도 카드 업데이트
        if (state.attackSpeedCard) {
            const cardData = (state.attackSpeedCard as any).upgradeCardData;
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
                
                UpgradeTab.updateMaxButton(cardData, canAfford, isMaxLevel, 0xff6b35, 0xff8c5a);
            }
        }
        
        // 치명타 확률 카드 업데이트
        if (state.critChanceCard) {
            const cardData = (state.critChanceCard as any).upgradeCardData;
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
                
                UpgradeTab.updateMaxButton(cardData, canAfford, isMaxLevel, 0xff6b35, 0xff8c5a);
            }
        }

        // 치명타 데미지 카드 업데이트
        if (state.critDamageCard) {
            const cardData = (state.critDamageCard as any).upgradeCardData;
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
                
                UpgradeTab.updateMaxButton(cardData, canAfford, isMaxLevel, 0xff6b35, 0xff8c5a);
            }
        }
        
        // SP 구매 카드 업데이트
        if (state.spPurchaseCard) {
            const cardData = (state.spPurchaseCard as any).upgradeCardData;
            if (cardData) {
                const currentCount = GameState.spPurchaseCount;
                const isMaxLevel = cardData.isMaxLevel ? cardData.isMaxLevel() : false;
                const cost = cardData.getCost();
                const canPurchase = !isMaxLevel && cardData.canAfford();
                
                if (isMaxLevel) {
                    cardData.value.setText(`(${currentCount}/10) 최대 구매 완료`);
                    cardData.value.setColor('#999999');
                    cardData.costValue.setText('');
                } else {
                    const nextCount = currentCount + 1;
                    cardData.value.setText(`(${currentCount}/10 -> ${nextCount}/10)`);
                    cardData.value.setColor(canPurchase ? '#e0e0e0' : '#999999');
                    cardData.costValue.setText(`${NumberFormatter.formatNumber(cost)}`);
                    cardData.costValue.setColor(canPurchase ? '#e0e0e0' : '#999999');
                }
                
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
                
                UpgradeTab.updateMaxButton(cardData, canPurchase, isMaxLevel, 0xff6b35, 0xff8c5a);
            }
        }
    }
};
