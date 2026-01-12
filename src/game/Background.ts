import Phaser from 'phaser';
import { Responsive } from '../utils/Responsive';

// 배경 생성
export const Background = {
    // 배경 객체들 생성
    create(scene: Phaser.Scene): { sky: Phaser.GameObjects.Image; ground: Phaser.GameObjects.Image } {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 배경 - 하늘 (위쪽 절반 영역에 배치)
        const sky = scene.add.image(gameWidth / 2, gameHeight * 0.125, 'sky');
        sky.setScale(scale.uniform * 1.5);
        sky.setDepth(-2);
        
        // 배경 - 땅 (위쪽 절반 영역에 배치)
        const ground = scene.add.image(gameWidth / 2, gameHeight * 0.4, 'ground');
        ground.setScale(scale.uniform * 1.2);
        ground.setDepth(-1);
        
        return { sky, ground };
    }
};
