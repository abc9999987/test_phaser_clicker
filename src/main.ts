import Phaser from 'phaser';
import './styles/main.css';
import { GameConfig } from './config/gameConfig';
import { LoadingScene } from './scenes/LoadingScene';
import { GameScene } from './scenes/GameScene';
import { GoldDungeonScene } from './scenes/dungeons/GoldDungeonScene';
import { ArtifactDungeonScene } from './scenes/dungeons/ArtifactDungeonScene';
import { MeatDungeonScene } from './scenes/dungeons/FeedDungeonScene';
import { GemDungeonScene } from './scenes/dungeons/GemDungeonScene';

// 게임 진입점
// Phaser 게임 초기화

// 게임 설정에 씬 추가 (LoadingScene을 첫 번째로)
const config: Phaser.Types.Core.GameConfig = { 
    ...GameConfig,
    scene: [LoadingScene, GameScene, GoldDungeonScene, ArtifactDungeonScene, MeatDungeonScene, GemDungeonScene]
};

// 게임 시작
new Phaser.Game(config);
