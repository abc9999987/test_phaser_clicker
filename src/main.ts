import Phaser from 'phaser';
import './styles/main.css';
import { GameConfig } from './config/gameConfig';
import { GameScene } from './scenes/GameScene';
import { GoldDungeonScene } from './scenes/dungeons/GoldDungeonScene';
import { EquipmentDungeonScene } from './scenes/dungeons/EquipmentDungeonScene';

// 게임 진입점
// Phaser 게임 초기화

// 게임 설정에 씬 추가
const config: Phaser.Types.Core.GameConfig = { 
    ...GameConfig,
    scene: [GameScene, GoldDungeonScene, EquipmentDungeonScene]
};

// 게임 시작
new Phaser.Game(config);
