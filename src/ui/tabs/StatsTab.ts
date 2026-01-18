// Stats 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { NumberFormatter } from '../../utils/NumberFormatter';

export interface StatsTabState {
    autoFireText: Phaser.GameObjects.Text | null;
    attackPowerText: Phaser.GameObjects.Text | null;
    critChanceText: Phaser.GameObjects.Text | null;
    critDamageText: Phaser.GameObjects.Text | null;
}

export const StatsTab = {
    // Stats 탭 내용 생성 (내 정보)
    createStatsTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        state: StatsTabState,
        tabContents: Phaser.GameObjects.Container[]
    ): void {
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

        state.autoFireText = scene.add.text(gameWidth * 0.1, attackSpeedY, `공격 속도: ${GameState.getAttackSpeedValue()}/초`, {
            fontSize: attackSpeedFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${attackSpeedFontSize} Arial`
        });
        contentContainer.add(state.autoFireText);
        
        // 공격력 텍스트
        const attackPowerFontSize = Responsive.getFontSize(scene, 20);
        const attackPowerY = attackSpeedY + uiAreaHeight * 0.06;
        state.attackPowerText = scene.add.text(gameWidth * 0.1, attackPowerY, `공격력: ${NumberFormatter.formatNumber(GameState.getAttackPowerValue())}`, {
            fontSize: attackPowerFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${attackPowerFontSize} Arial`
        });
        contentContainer.add(state.attackPowerText);
        
        // 치명타 확률 텍스트
        const critChanceFontSize = Responsive.getFontSize(scene, 20);
        const critChanceY = attackPowerY + uiAreaHeight * 0.06;
        state.critChanceText = scene.add.text(gameWidth * 0.1, critChanceY, `치명타 확률: ${GameState.getCritChanceValue()}%`, {
            fontSize: critChanceFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${critChanceFontSize} Arial`
        });
        contentContainer.add(state.critChanceText);

        // 치명타 데미지 텍스트
        const critDamageFontSize = Responsive.getFontSize(scene, 20);
        const critDamageY = critChanceY + uiAreaHeight * 0.06;
        state.critDamageText = scene.add.text(gameWidth * 0.1, critDamageY, `치명타 데미지: ${GameState.getCritDamageValue()}%`, {
            fontSize: critDamageFontSize,
            color: '#e0e0e0',
            fontFamily: 'Arial',
            font: `500 ${critDamageFontSize} Arial`
        });
        contentContainer.add(state.critDamageText);
        
        tabContents[0] = contentContainer;
    },
    
    // Stats 탭 업데이트
    update(
        state: StatsTabState,
        activeTabIndex: number
    ): void {
        // 공격 속도 텍스트 업데이트 (Stats 탭에만 표시)
        if (state.autoFireText && activeTabIndex === 0) {
            state.autoFireText.setText(`공격 속도: ${GameState.getAttackSpeedValue()}/초`);
        }
        
        // 공격력 텍스트 업데이트 (Stats 탭에만 표시)
        if (state.attackPowerText && activeTabIndex === 0) {
            state.attackPowerText.setText(`공격력: ${NumberFormatter.formatNumber(GameState.getAttackPowerValue())}`);
        }
        
        // 치명타 확률 텍스트 업데이트 (Stats 탭에만 표시)
        if (state.critChanceText && activeTabIndex === 0) {
            state.critChanceText.setText(`치명타 확률: ${GameState.getCritChanceValue()}%`);
        }

        // 치명타 데미지 텍스트 업데이트 (Stats 탭에만 표시)
        if (state.critDamageText && activeTabIndex === 0) {
            state.critDamageText.setText(`치명타 데미지: ${GameState.getCritDamageValue()}%`);
        }
    }
};
