import Phaser from 'phaser';

// 에셋 로더
interface ImageItem {
    key: string;
    path: string;
}

export const AssetLoader = {
    // 모든 에셋 로드 (Phaser 기본 로더 사용)
    preload(scene: Phaser.Scene): void {
        // SVG 파일 로드 (이미지로 로드)
        scene.load.image('sky', 'assets/sky.svg');
        scene.load.image('ground', 'assets/ground.svg');
        scene.load.image('enemy', 'assets/enemy/enemy.svg');
        
        // PNG 이미지 로드
        scene.load.image('char', 'assets/character/snow_raccoon_dog.png');
        scene.load.image('weapon', 'assets/weapon/wp1.png');
        scene.load.image('weapon2', 'assets/weapon/wp2.png');
        // 버프 이펙트 프레임들 로드
        scene.load.image('buff_1_effect_1', 'assets/effect/buff_1_effect_1.png');
        scene.load.image('buff_1_effect_2', 'assets/effect/buff_1_effect_2.png');
        scene.load.image('buff_1_effect_3', 'assets/effect/buff_1_effect_3.png');
        
        // 골드 던전 보스 애니메이션 프레임 로드
        scene.load.image('gold_boss_1', 'assets/enemy/gold_boss_1.png');
        scene.load.image('gold_boss_2', 'assets/enemy/gold_boss_2.png');
        scene.load.image('gold_boss_3', 'assets/enemy/gold_boss_3.png');
        scene.load.image('gold_boss_4', 'assets/enemy/gold_boss_4.png');

        // 먹이 던전(고기 던전) 보스 이미지 로드
        scene.load.image('meat_boss', 'assets/enemy/meat_boss.png');

        // 유물 이미지 로드
        scene.load.image('artifact_01', 'assets/artifact/artifact_01.png');
        scene.load.image('artifact_02', 'assets/artifact/artifact_02.png');
        scene.load.image('artifact_03', 'assets/artifact/artifact_03.png');
        scene.load.image('artifact_04', 'assets/artifact/artifact_04.png');
        scene.load.image('artifact_05', 'assets/artifact/artifact_05.png');
        
        // 유물 스프라이트시트 로드 (1024x1024, 4x3 그리드 = 12개 프레임)
        scene.load.image('item_gold_set', 'assets/item/item_gold_set.png');
        
        // 로드 완료 후 프레임 생성 (create 단계에서 처리하도록 변경 필요 시)
        // 프레임 생성을 create 단계로 이동하거나, preload 완료 이벤트에서 처리
    },
    
    // 스프라이트 애니메이션 로드
    loadSpriteAnimation(scene: Phaser.Scene, key: string, frameCount: number): void {
        // 각 프레임 로드
        for (let i = 0; i <= frameCount; i++) {
            const frameNum = i.toString().padStart(2, '0');
            scene.load.image(`${key}_${i}`, `assets/character/character_b_sprite/character_b-animation_${frameNum}.png`);
        }
    },
    
    // 스프라이트 애니메이션 생성
    createSpriteAnimation(scene: Phaser.Scene, key: string, frameCount: number, frameRate: number = 10): void {
        const frames: Phaser.Types.Animations.AnimationFrame[] = [];
        for (let i = 0; i <= frameCount; i++) {
            frames.push({ key: `${key}_${i}` });
        }
        
        scene.anims.create({
            key: `${key}_anim`,
            frames: frames,
            frameRate: frameRate,
            repeat: -1 // 무한 반복
        });
    },
    
    // 일반 PNG 이미지 로드 (유동적으로 사용 가능)
    // 사용 예: AssetLoader.loadPNGImage(scene, 'myImage', 'assets/images/myImage.png');
    loadPNGImage(scene: Phaser.Scene, key: string, imagePath: string): void {
        scene.load.image(key, imagePath);
    },
    
    // 여러 PNG 이미지 한번에 로드
    // 사용 예: AssetLoader.loadPNGImages(scene, [
    //   { key: 'image1', path: 'assets/images/img1.png' },
    //   { key: 'image2', path: 'assets/images/img2.png' }
    // ]);
    loadPNGImages(scene: Phaser.Scene, imageList: ImageItem[]): void {
        imageList.forEach(item => {
            scene.load.image(item.key, item.path);
        });
    },
};
