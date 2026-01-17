// HTML Input 필드 관리
import Phaser from 'phaser';
import { Responsive } from '../../../../../utils/Responsive';

export interface InputFieldConfig {
    type: 'text' | 'password';
    placeholder: string;
    label: string;
}

export const LoginInputField = {
    // HTML Input 요소 생성
    createHTMLInput(
        scene: Phaser.Scene,
        config: InputFieldConfig,
        popupX: number,
        popupY: number,
        inputY: number,
        inputWidth: number,
        inputHeight: number,
        gameWidth: number,
        gameHeight: number
    ): HTMLInputElement {
        const input = document.createElement('input');
        input.type = config.type;
        input.placeholder = config.placeholder;
        
        // 스타일 설정
        const fontSize = parseFloat(Responsive.getFontSize(scene, 14));
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        input.style.position = 'absolute';
        input.style.width = `${inputWidth * (screenWidth / gameWidth)}px`;
        input.style.height = `${inputHeight * (screenHeight / gameHeight)}px`;
        input.style.fontSize = `${fontSize}px`;
        input.style.padding = '5px 10px';
        input.style.border = 'none';
        input.style.borderRadius = '8px';
        input.style.backgroundColor = '#1a1a2a';
        input.style.color = '#ffffff';
        input.style.outline = 'none';
        
        // 위치 계산
        const inputX = (popupX - inputWidth / 2) * (screenWidth / gameWidth);
        const inputYPos = (popupY + inputY - inputHeight / 2) * (screenHeight / gameHeight);
        input.style.left = `${inputX}px`;
        input.style.top = `${inputYPos}px`;
        
        document.body.appendChild(input);
        return input;
    },
    
    // HTML Input 요소 제거
    removeHTMLInput(input: HTMLInputElement | null): void {
        if (input && input.parentNode) {
            input.parentNode.removeChild(input);
        }
    },
    
    // 입력 필드 배경 생성
    createInputBackground(
        scene: Phaser.Scene,
        _x: number,
        _y: number,
        width: number,
        height: number
    ): Phaser.GameObjects.Graphics {
        const bg = scene.add.graphics();
        bg.fillStyle(0x1a1a2a, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
        bg.lineStyle(2, 0x4a4a5a, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
        return bg;
    },
    
    // 입력 필드 라벨 생성
    createInputLabel(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string
    ): Phaser.GameObjects.Text {
        const labelFontSize = Responsive.getFontSize(scene, 16);
        const label = scene.add.text(x, y, text, {
            fontSize: labelFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${labelFontSize} Arial`
        });
        label.setOrigin(0, 0.5);
        return label;
    }
};
