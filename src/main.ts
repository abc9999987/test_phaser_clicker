import Phaser from 'phaser';
import './styles/main.css';
import { GameConfig } from './config/gameConfig';
import { GameScene } from './scenes/GameScene';
import { GoldDungeonScene } from './scenes/dungeons/GoldDungeonScene';
import { ArtifactDungeonScene } from './scenes/dungeons/ArtifactDungeonScene';
import { MeatDungeonScene } from './scenes/dungeons/FeedDungeonScene';

// 게임 진입점
// Phaser 게임 초기화

// 게임 설정에 씬 추가
const config: Phaser.Types.Core.GameConfig = { 
    ...GameConfig,
    scene: [GameScene, GoldDungeonScene, ArtifactDungeonScene, MeatDungeonScene]
};

// 게임 시작
new Phaser.Game(config);
