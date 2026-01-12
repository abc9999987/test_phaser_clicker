import Phaser from 'phaser';
import { GameConfig } from './config/gameConfig';
import { GameScene } from './scenes/GameScene';

// 게임 진입점
// Phaser 게임 초기화

// 게임 설정에 씬 추가
const config: Phaser.Types.Core.GameConfig = { 
    ...GameConfig,
    scene: GameScene
};

// 게임 시작
new Phaser.Game(config);
