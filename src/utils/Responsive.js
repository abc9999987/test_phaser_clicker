// 반응형 유틸리티
const Responsive = {
    // 게임 기본 크기
    baseWidth: 800,
    baseHeight: 600,
    
    // 현재 게임 크기 가져오기
    getGameSize(scene) {
        return {
            width: scene.scale.width,
            height: scene.scale.height
        };
    },
    
    // 비율 계산 (기본 크기 대비)
    getScale(scene) {
        const size = this.getGameSize(scene);
        return {
            x: size.width / this.baseWidth,
            y: size.height / this.baseHeight,
            min: Math.min(size.width / this.baseWidth, size.height / this.baseHeight)
        };
    },
    
    // 위치를 비율로 변환
    getPosition(scene, baseX, baseY) {
        const scale = this.getScale(scene);
        return {
            x: baseX * scale.x,
            y: baseY * scale.y
        };
    },
    
    // 크기를 비율로 변환
    getSize(scene, baseWidth, baseHeight) {
        const scale = this.getScale(scene);
        return {
            width: baseWidth * scale.min,
            height: baseHeight * scale.min
        };
    },
    
    // 폰트 크기를 비율로 변환
    getFontSize(scene, baseSize) {
        const scale = this.getScale(scene);
        return Math.max(12, Math.floor(baseSize * scale.min)) + 'px';
    }
};
