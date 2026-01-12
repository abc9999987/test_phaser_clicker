import Phaser from 'phaser';

// Phaser 게임 설정 (모바일 세로 해상도, 반응형)
export const GameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 390,
    height: 844,
    parent: 'game-container',
    backgroundColor: '#7ec8ff',
    scene: undefined, // GameScene에서 설정됨
    scale: {
        mode: Phaser.Scale.FIT, // 비율 유지하면서 화면에 맞춤 (여백 자동 처리)
        autoCenter: Phaser.Scale.CENTER_BOTH, // 좌우/상하 중앙 정렬
        width: 390,
        height: 844,
        min: {
            width: 320,
            height: 568 // iPhone SE 등 작은 화면
        }
        // max 제거: 큰 화면에서도 자동으로 스케일링
    }
};
