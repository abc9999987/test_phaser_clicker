import Phaser from 'phaser';

// 반응형 유틸리티
export const Responsive = {
    // 게임 기본 크기
    baseWidth: 800,
    baseHeight: 600,
    
    // 현재 게임 크기 가져오기
    getGameSize(scene: Phaser.Scene): { width: number; height: number } {
        return {
            width: scene.scale.width,
            height: scene.scale.height
        };
    },
    
    // 비율 계산 (기본 크기 대비)
    getScale(scene: Phaser.Scene): { x: number; y: number; min: number } {
        const size = this.getGameSize(scene);
        return {
            x: size.width / this.baseWidth,
            y: size.height / this.baseHeight,
            min: Math.min(size.width / this.baseWidth, size.height / this.baseHeight)
        };
    },
    
    // 위치를 비율로 변환
    getPosition(scene: Phaser.Scene, baseX: number, baseY: number): { x: number; y: number } {
        const scale = this.getScale(scene);
        return {
            x: baseX * scale.x,
            y: baseY * scale.y
        };
    },
    
    // 크기를 비율로 변환
    getSize(scene: Phaser.Scene, baseWidth: number, baseHeight: number): { width: number; height: number } {
        const scale = this.getScale(scene);
        return {
            width: baseWidth * scale.min,
            height: baseHeight * scale.min
        };
    },
    
    // 폰트 크기를 비율로 변환
    getFontSize(scene: Phaser.Scene, baseSize: number): string {
        const scale = this.getScale(scene);
        return Math.max(12, Math.floor(baseSize * scale.min)) + 'px';
    }
};
