import Phaser from 'phaser';

// 반응형 유틸리티
export const Responsive = {
    // 게임 기본 크기 (모바일 세로 해상도)
    baseWidth: 390,
    baseHeight: 844,
    
    // 현재 게임 크기 가져오기
    getGameSize(scene: Phaser.Scene): { width: number; height: number } {
        return {
            width: scene.scale.width,
            height: scene.scale.height
        };
    },
    
    // 비율 계산 (기본 크기 대비)
    // 세로 게임이므로 세로 비율을 우선시하되, 가로가 넓어도 적절히 스케일링
    getScale(scene: Phaser.Scene): { x: number; y: number; min: number; uniform: number } {
        const size = this.getGameSize(scene);
        const scaleX = size.width / this.baseWidth;
        const scaleY = size.height / this.baseHeight;
        const min = Math.min(scaleX, scaleY); // 비율 유지용 (세로 게임에 적합)
        
        // 균일한 스케일 (세로 비율 우선)
        const uniform = scaleY; // 세로 기준으로 스케일링
        
        return {
            x: scaleX,
            y: scaleY,
            min: min,
            uniform: uniform
        };
    },
    
    // 위치를 비율로 변환 (세로 게임 기준)
    getPosition(scene: Phaser.Scene, baseX: number, baseY: number): { x: number; y: number } {
        const size = this.getGameSize(scene);
        const scale = this.getScale(scene);
        
        // 세로 비율을 기준으로 위치 계산
        const scaleRatio = scale.uniform;
        const offsetX = (size.width - this.baseWidth * scaleRatio) / 2; // 좌우 여백
        
        return {
            x: baseX * scaleRatio + offsetX,
            y: baseY * scaleRatio
        };
    },
    
    // 크기를 비율로 변환 (균일한 스케일 사용)
    getSize(scene: Phaser.Scene, baseWidth: number, baseHeight: number): { width: number; height: number } {
        const scale = this.getScale(scene);
        return {
            width: baseWidth * scale.uniform,
            height: baseHeight * scale.uniform
        };
    },
    
    // 폰트 크기를 비율로 변환
    getFontSize(scene: Phaser.Scene, baseSize: number): string {
        const scale = this.getScale(scene);
        // 최소 폰트 크기 보장
        return Math.max(10, Math.floor(baseSize * scale.uniform)) + 'px';
    }
};
