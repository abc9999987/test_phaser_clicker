// Lock 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';

export const LockTab = {
    // Lock 탭 내용 생성
    createLockTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        tabIndex: number,
        tabContents: Phaser.GameObjects.Container[]
    ): void {
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
        
        tabContents[tabIndex] = contentContainer;
    }
};
