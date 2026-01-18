import Phaser from 'phaser';

// 스프라이트시트 유틸리티
export const SpriteSheetUtils = {
    /**
     * n x m 그리드로 나뉜 스프라이트시트에서 프레임을 생성
     * @param scene Phaser Scene
     * @param spritesheetKey 스프라이트시트 이미지 키
     * @param imageWidth 전체 이미지 너비
     * @param imageHeight 전체 이미지 높이
     * @param gridWidth 가로 그리드 개수
     * @param gridHeight 세로 그리드 개수
     * @returns 생성된 프레임 키 배열 (왼쪽 위부터 오른쪽으로 읽기)
     */
    createSpriteSheetFrames(
        scene: Phaser.Scene,
        spritesheetKey: string,
        imageWidth: number,
        imageHeight: number,
        gridWidth: number,
        gridHeight: number
    ): string[] {
        const frameWidth = imageWidth / gridWidth;
        const frameHeight = imageHeight / gridHeight;
        const frameKeys: string[] = [];
        
        // Phaser의 spritesheet 로드를 사용하여 프레임 자동 생성
        // spritesheet은 이미 로드되어 있어야 함
        const texture = scene.textures.get(spritesheetKey);
        if (!texture) {
            console.error(`스프라이트시트를 찾을 수 없습니다: ${spritesheetKey}`);
            return [];
        }
        
        // 각 프레임을 수동으로 생성
        // 왼쪽 위부터 오른쪽으로 읽기 (행 우선 순서)
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const frameIndex = row * gridWidth + col;
                const frameKey = `${spritesheetKey}_${frameIndex}`;
                const x = col * frameWidth;
                const y = row * frameHeight;
                
                // 프레임 추가
                texture.add(frameKey, 0, x, y, frameWidth, frameHeight);
                frameKeys.push(frameKey);
            }
        }
        
        return frameKeys;
    },
    
    /**
     * 스프라이트시트를 로드하고 프레임을 생성하는 헬퍼 함수
     * @param scene Phaser Scene
     * @param spritesheetKey 스프라이트시트 이미지 키
     * @param imagePath 이미지 파일 경로
     * @param imageWidth 전체 이미지 너비
     * @param imageHeight 전체 이미지 높이
     * @param gridWidth 가로 그리드 개수
     * @param gridHeight 세로 그리드 개수
     * @param onLoadComplete 로드 완료 콜백 (선택)
     */
    loadAndCreateSpriteSheet(
        scene: Phaser.Scene,
        spritesheetKey: string,
        imagePath: string,
        imageWidth: number,
        imageHeight: number,
        gridWidth: number,
        gridHeight: number,
        onLoadComplete?: () => void
    ): void {
        // 이미지 로드
        scene.load.image(spritesheetKey, imagePath);
        
        // 로드 완료 이벤트 리스너
        scene.load.once('filecomplete-image-' + spritesheetKey, () => {
            // 프레임 생성
            SpriteSheetUtils.createSpriteSheetFrames(
                scene,
                spritesheetKey,
                imageWidth,
                imageHeight,
                gridWidth,
                gridHeight
            );
            
            if (onLoadComplete) {
                onLoadComplete();
            }
        });
    }
};
