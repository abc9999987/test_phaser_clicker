// 화면 중앙 스킬 사용 버튼 및 Auto 버튼 관리
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { SkillManager } from '../../managers/SkillManager';
import { SkillConfigs } from '../../config/gameConfig';

// 스킬 사용 버튼 상태 인터페이스
export interface SkillUseButtonsState {
    skillUseButtons: Phaser.GameObjects.Arc[];
    skillUseButtonBgs: Phaser.GameObjects.Graphics[];
    skillUseButtonIcons: Phaser.GameObjects.Image[];
    skillUseButtonTexts: Phaser.GameObjects.Text[];
    skillUseCooldownTexts: Phaser.GameObjects.Text[];
    skillUseCooldownMasks: Phaser.GameObjects.Graphics[];
    skillUseCooldownStates: { isInCooldown: boolean; lastSecond: number }[];
    skillBuffDurationMasks: (Phaser.GameObjects.Graphics | null)[];
    skillAutoButtons: Phaser.GameObjects.Rectangle[];
    skillAutoButtonBgs: Phaser.GameObjects.Graphics[];
    skillAutoButtonTexts: Phaser.GameObjects.Text[];
}

export const SkillUseButtons = {
    // 화면 중앙에 습득한 스킬 사용 버튼 생성
    createSkillUseButtons(
        scene: Phaser.Scene,
        state: SkillUseButtonsState
    ): void {
        SkillUseButtons.removeSkillUseButtons(state);
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const centerY = gameHeight * 0.45;
        const rightX = gameWidth * 0.9;
        
        const learnedSkills = GameState.learnedSkills;
        if (learnedSkills.length === 0) {
            return;
        }
        
        const buttonRadius = gameWidth * 0.06;
        const buttonSpacing = buttonRadius * 2.4;
        
        learnedSkills.forEach((skillId, index) => {
            const skillConfig = SkillConfigs.find(s => s.id === skillId);
            if (!skillConfig) {
                return;
            }
            
            const buttonX = rightX - index * buttonSpacing;
            const buttonY = centerY;
            
            const buttonBg = scene.add.graphics();
            buttonBg.fillStyle(0x4a4a4a, 1);
            buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
            buttonBg.lineStyle(3, 0xffffff, 1);
            buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
            buttonBg.setDepth(15);
            state.skillUseButtonBgs.push(buttonBg);
            
            const useButton = scene.add.circle(buttonX, buttonY, buttonRadius, 0x000000, 0);
            useButton.setInteractive({ useHandCursor: true });
            useButton.setDepth(16);
            
            useButton.on('pointerdown', () => {
                if ((scene as any).useSkill) {
                    (scene as any).useSkill(skillId);
                }
            });
            
            useButton.on('pointerover', () => {
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
            
            state.skillUseButtons.push(useButton);
            
            if (skillConfig.id === 'buff_attack_damage') {
                const labelFontSize = Responsive.getFontSize(scene, 12);
                const labelText = scene.add.text(buttonX, buttonY, 'Buff', {
                    fontSize: labelFontSize,
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    font: `600 ${labelFontSize} Arial`
                });
                labelText.setOrigin(0.5);
                labelText.setDepth(16);
            } else if (skillConfig.id === 'buff_anchovy_shot') {
                const iconSize = buttonRadius * 1.2;
                const skillIcon = scene.add.image(buttonX, buttonY, 'weapon2');
                skillIcon.setDisplaySize(iconSize, iconSize);
                skillIcon.setOrigin(0.5, 0.5);
                skillIcon.setDepth(16);
                state.skillUseButtonIcons.push(skillIcon);
            } else {
                const iconSize = buttonRadius * 1.2;
                const skillIcon = scene.add.image(buttonX, buttonY, 'weapon');
                skillIcon.setDisplaySize(iconSize, iconSize);
                skillIcon.setOrigin(0.5, 0.5);
                skillIcon.setDepth(16);
                state.skillUseButtonIcons.push(skillIcon);
            }
            
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
            state.skillUseCooldownTexts.push(cooldownText);
            
            const cooldownMask = scene.add.graphics();
            cooldownMask.setDepth(17);
            state.skillUseCooldownMasks.push(cooldownMask);
            
            if (skillConfig.skillType === 2) {
                const buffDurationMask = scene.add.graphics();
                buffDurationMask.setDepth(18);
                state.skillBuffDurationMasks.push(buffDurationMask);
            } else {
                state.skillBuffDurationMasks.push(null);
            }
            
            state.skillUseCooldownStates.push({ isInCooldown: false, lastSecond: -1 });
        });
        
        if (learnedSkills.length > 0) {
            const leftmostButtonX = rightX - (learnedSkills.length - 1) * buttonSpacing * 0.5;
            const autoButtonWidth = gameWidth * 0.12;
            const autoButtonHeight = gameWidth * 0.08;
            const autoButtonX = leftmostButtonX - buttonRadius * 4 - autoButtonWidth / 2;
            const autoButtonY = centerY;
            const autoButtonRadius = 8;
            
            const hasAnyAutoOn = learnedSkills.some(skillId => GameState.isSkillAutoUse(skillId));
            
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
            state.skillAutoButtonBgs.push(autoButtonBg);
            
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
                const currentState = learnedSkills.some(skillId => GameState.isSkillAutoUse(skillId));
                const newState = !currentState;
                
                learnedSkills.forEach(skillId => {
                    const currentSkillState = GameState.isSkillAutoUse(skillId);
                    if (currentSkillState !== newState) {
                        GameState.toggleSkillAutoUse(skillId);
                    }
                });
                
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
                
                if (state.skillAutoButtonTexts.length > 0) {
                    state.skillAutoButtonTexts[0].setColor(newState ? '#ffffff' : '#cccccc');
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
            
            state.skillAutoButtons.push(autoButton);
            
            const autoFontSize = Responsive.getFontSize(scene, 12);
            const autoText = scene.add.text(autoButtonX, autoButtonY, 'Auto', {
                fontSize: autoFontSize,
                color: hasAnyAutoOn ? '#ffffff' : '#cccccc',
                fontFamily: 'Arial',
                font: `600 ${autoFontSize} Arial`
            });
            autoText.setOrigin(0.5);
            autoText.setDepth(16);
            state.skillAutoButtonTexts.push(autoText);
        }
    },
    
    // 스킬 사용 버튼 제거
    removeSkillUseButtons(state: SkillUseButtonsState): void {
        state.skillUseButtons.forEach(btn => btn.destroy());
        state.skillUseButtonBgs.forEach(bg => bg.destroy());
        state.skillUseButtonIcons.forEach(icon => icon.destroy());
        state.skillUseButtonTexts.forEach(text => text.destroy());
        state.skillUseCooldownTexts.forEach(text => text.destroy());
        state.skillUseCooldownMasks.forEach(mask => mask.destroy());
        state.skillBuffDurationMasks.forEach(mask => {
            if (mask) mask.destroy();
        });
        state.skillAutoButtons.forEach(btn => btn.destroy());
        state.skillAutoButtonBgs.forEach(bg => bg.destroy());
        state.skillAutoButtonTexts.forEach(text => text.destroy());
        
        state.skillUseButtons = [];
        state.skillUseButtonBgs = [];
        state.skillUseButtonIcons = [];
        state.skillUseButtonTexts = [];
        state.skillUseCooldownTexts = [];
        state.skillUseCooldownMasks = [];
        state.skillBuffDurationMasks = [];
        state.skillUseCooldownStates = [];
        state.skillAutoButtons = [];
        state.skillAutoButtonBgs = [];
        state.skillAutoButtonTexts = [];
    },
    
    // 스킬 사용 버튼 업데이트 (쿨타임 및 지속시간)
    updateSkillUseButtons(
        scene: Phaser.Scene,
        state: SkillUseButtonsState
    ): void {
        // 스킬 사용 버튼이 생성되지 않은 경우(던전 씬 등) 업데이트하지 않음
        if (!scene || state.skillUseCooldownTexts.length === 0 || state.skillUseButtons.length === 0) {
            return;
        }
        
        const learnedSkills = GameState.learnedSkills;
        const now = scene.time.now;
        
        learnedSkills.forEach((skillId, index) => {
            // 배열 범위 체크 및 null 체크
            if (index >= state.skillUseButtons.length || 
                index >= state.skillUseButtonBgs.length ||
                index >= state.skillUseCooldownTexts.length || 
                index >= state.skillUseCooldownMasks.length || 
                index >= state.skillUseCooldownStates.length) {
                return;
            }
            
            const useButton = state.skillUseButtons[index];
            const buttonBg = state.skillUseButtonBgs[index];
            const cooldownText = state.skillUseCooldownTexts[index];
            const cooldownMask = state.skillUseCooldownMasks[index];
            const cooldownState = state.skillUseCooldownStates[index];
            
            // 모든 필수 요소가 존재하는지 확인
            if (!useButton || !buttonBg || !cooldownText || !cooldownMask || !cooldownState) {
                return;
            }
            
            // useButton이 파괴되었는지 확인 (scene이 있는지 체크)
            if (!useButton.scene || !buttonBg.scene) {
                return;
            }
            
            const skillConfig = SkillConfigs.find(s => s.id === skillId);
            if (!skillConfig) return;
            
            const remaining = SkillManager.getRemainingCooldown(skillId, now);
            const isInCooldown = remaining > 0;
            
            const isBuffSkill = skillConfig.skillType === 2;
            const buffRemaining = isBuffSkill ? GameState.getBuffRemainingDuration(skillId, now) : 0;
            const isBuffActive = buffRemaining > 0;
            
            let displayText = '준비 완료';
            let displayColor = '#ffffff';
            let displaySecond = -1;
            
            if (isBuffActive) {
                displaySecond = Math.ceil(buffRemaining);
                displayText = `${displaySecond}초`;
                displayColor = '#ffff00';
            } else if (isInCooldown) {
                displaySecond = Math.ceil(remaining);
                displayText = `${displaySecond}초`;
                displayColor = '#ffcc00';
            }
            
            if (cooldownState.lastSecond !== displaySecond) {
                cooldownState.lastSecond = displaySecond;
                cooldownText.setText(displayText);
                cooldownText.setColor(displayColor);
            }
            
            const buttonX = useButton.x;
            const buttonY = useButton.y;
            const buttonRadius = useButton.radius;
            
            const buffDurationMask = index < state.skillBuffDurationMasks.length ? state.skillBuffDurationMasks[index] : null;
            
            if (isBuffActive) {
                useButton.setAlpha(0.5);
                buttonBg.setAlpha(0.5);
            } else {
                useButton.setAlpha(1);
                buttonBg.setAlpha(1);
            }
            
            if (cooldownState.isInCooldown !== isInCooldown && !isBuffActive) {
                cooldownState.isInCooldown = isInCooldown;
                if (isInCooldown) {
                    buttonBg.clear();
                    buttonBg.fillStyle(0x4a4a4a, 1);
                    buttonBg.fillCircle(buttonX, buttonY, buttonRadius);
                    buttonBg.lineStyle(3, 0xffffff, 1);
                    buttonBg.strokeCircle(buttonX, buttonY, buttonRadius);
                }
            }
            
            if (isBuffSkill && buffDurationMask) {
                buffDurationMask.clear();
                
                if (isBuffActive && skillConfig.duration) {
                    const progress = buffRemaining / skillConfig.duration;
                    const angle = progress * Math.PI * 2;
                    const startAngle = -Math.PI / 2;
                    
                    buffDurationMask.fillStyle(0xffff00, 0.35);
                    
                    if (angle > 0) {
                        buffDurationMask.beginPath();
                        buffDurationMask.moveTo(buttonX, buttonY);
                        buffDurationMask.lineTo(
                            buttonX + Math.cos(startAngle) * buttonRadius,
                            buttonY + Math.sin(startAngle) * buttonRadius
                        );
                        buffDurationMask.arc(
                            buttonX, buttonY, buttonRadius,
                            startAngle, startAngle - angle,
                            true
                        );
                        buffDurationMask.lineTo(buttonX, buttonY);
                        buffDurationMask.closePath();
                        buffDurationMask.fillPath();
                    }
                }
            }
            
            cooldownMask.clear();
            
            if (remaining > 0 && !isBuffActive) {
                const progress = remaining / skillConfig.cooldown;
                const angle = progress * Math.PI * 2;
                const startAngle = -Math.PI / 2;
                
                cooldownMask.fillStyle(0x000000, 0.6);
                
                if (angle > 0) {
                    cooldownMask.beginPath();
                    cooldownMask.moveTo(buttonX, buttonY);
                    cooldownMask.lineTo(
                        buttonX + Math.cos(startAngle) * buttonRadius,
                        buttonY + Math.sin(startAngle) * buttonRadius
                    );
                    cooldownMask.arc(
                        buttonX, buttonY, buttonRadius,
                        startAngle, startAngle + angle,
                        false
                    );
                    cooldownMask.lineTo(buttonX, buttonY);
                    cooldownMask.closePath();
                    cooldownMask.fillPath();
                }
            }
        });
    }
};
