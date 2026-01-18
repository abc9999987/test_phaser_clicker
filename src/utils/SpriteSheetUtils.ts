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
        // 프레임 크기 계산 (정수로 반올림하여 정확도 확보)
        const frameWidth = Math.floor(imageWidth / gridWidth);
        const frameHeight = Math.floor(imageHeight / gridHeight);
        const frameKeys: string[] = [];
        
        console.log(`[스프라이트시트] 프레임 크기 계산: ${frameWidth}x${frameHeight} (전체: ${imageWidth}x${imageHeight}, 그리드: ${gridWidth}x${gridHeight})`);
        
        // Phaser의 spritesheet 로드를 사용하여 프레임 자동 생성
        // spritesheet은 이미 로드되어 있어야 함
        const texture = scene.textures.get(spritesheetKey);
        if (!texture) {
            console.error(`스프라이트시트를 찾을 수 없습니다: ${spritesheetKey}`);
            return [];
        }
        
        // 각 프레임을 수동으로 생성
        // 왼쪽 위부터 오른쪽으로 읽기 (행 우선 순서)
        // Phaser 3에서 프레임을 추가할 때는 소스 인덱스를 올바르게 지정해야 함
        const sourceIndex = 0; // 이미지가 하나의 소스이므로 0
        
        // 텍스처 소스 정보 확인
        if (texture.source && texture.source.length > 0) {
            const source = texture.source[sourceIndex];
            if (source) {
                console.log(`[스프라이트시트] 텍스처 소스 정보:`, {
                    width: source.width,
                    height: source.height,
                    realWidth: source.realWidth,
                    realHeight: source.realHeight
                });
            }
        }
        
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                const frameIndex = row * gridWidth + col;
                const frameKey = `${spritesheetKey}_${frameIndex}`;
                const x = col * frameWidth;
                const y = row * frameHeight;
                
                // 프레임 추가 (Phaser 3: texture.add(key, sourceIndex, x, y, width, height))
                // Phaser 3.60+ 버전에서는 add 대신 addFrame이나 다른 방법 사용 가능
                try {
                    // 방법 1: texture.add() 사용 (기본 방법)
                    // 매개변수 순서: add(name, sourceIndex, x, y, width, height)
                    texture.add(frameKey, sourceIndex, x, y, frameWidth, frameHeight);
                    
                    // 프레임이 제대로 추가되었는지 즉시 확인
                    const addedFrame = texture.get(frameKey);
                    if (addedFrame) {
                        // 프레임 정보 확인 (디버깅용 - 첫 번째 프레임만)
                        if (frameIndex === 0) {
                            console.log(`[스프라이트시트] 프레임 추가 확인:`, {
                                key: frameKey,
                                name: addedFrame.name,
                                sourceIndex: addedFrame.sourceIndex,
                                cutX: addedFrame.cutX,
                                cutY: addedFrame.cutY,
                                cutWidth: addedFrame.cutWidth,
                                cutHeight: addedFrame.cutHeight,
                                realWidth: addedFrame.width,
                                realHeight: addedFrame.height
                            });
                        }
                        frameKeys.push(frameKey);
                    } else {
                        console.warn(`[스프라이트시트] 프레임 추가 후 확인 실패: ${frameKey}`);
                    }
                } catch (error) {
                    console.error(`[스프라이트시트] 프레임 추가 실패: ${frameKey}`, error);
                    // 에러가 발생해도 다음 프레임 시도 계속
                }
            }
        }
        
        // 디버깅: 첫 번째 프레임만 로그 출력
        if (frameKeys.length > 0) {
            console.log(`[스프라이트시트] ${spritesheetKey}: 총 ${frameKeys.length}개 프레임 생성 완료`);
            console.log(`[스프라이트시트] 첫 번째 프레임 키: ${frameKeys[0]}`);
            // 첫 번째 프레임이 실제로 생성되었는지 확인
            try {
                const firstFrame = texture.get(frameKeys[0]);
                if (firstFrame) {
                    console.log(`[스프라이트시트] 첫 번째 프레임 확인 성공:`, firstFrame.name);
                } else {
                    console.warn(`[스프라이트시트] 첫 번째 프레임 확인 실패: ${frameKeys[0]}`);
                }
            } catch (e) {
                console.warn(`[스프라이트시트] 프레임 확인 중 오류:`, e);
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
