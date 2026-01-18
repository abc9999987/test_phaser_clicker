import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { DungeonConfig } from '../../config/dungeonConfig';

// 던전 보스 렌더링 (생성)
export const DungeonBossRenderer = {
    // 보스 생성
    createBoss(
        scene: Phaser.Scene,
        dungeonConfig: DungeonConfig,
        gameWidth: number,
        gameHeight: number
    ): Phaser.GameObjects.Image | Phaser.GameObjects.Sprite {
        const scale = Responsive.getScale(scene);
        const baseScale = 0.75 * scale.uniform;
        
        // 보스 위치 (위쪽 절반 영역 중앙)
        let x = gameWidth * 0.15;
        let y = gameHeight * 0.33;
        
        // 골드 던전 보스인 경우 애니메이션 사용
        // 장비 던전도 골드 던전과 동일한 보스 이미지/애니메이션 사용 (나중에 리소스 변경 예정)
        if (dungeonConfig.id === 'gold_dungeon' || dungeonConfig.id === 'equipment_dungeon') {
            y = gameHeight * 0.29;
            return this.createAnimatedBoss(scene, x, y, baseScale);
        } else {
            return this.createDefaultBoss(scene, x, y, baseScale);
        }
    },
    
    // 애니메이션 보스 생성 (골드/장비 던전)
    createAnimatedBoss(
        scene: Phaser.Scene,
        x: number,
        y: number,
        baseScale: number
    ): Phaser.GameObjects.Sprite {
        // 골드 보스 애니메이션 생성 (아직 생성되지 않았으면)
        if (!scene.anims.exists('gold_boss_anim')) {
            scene.anims.create({
                key: 'gold_boss_anim',
                frames: [
                    { key: 'gold_boss_1' },
                    { key: 'gold_boss_2' },
                    { key: 'gold_boss_4' }
                ],
                frameRate: 4, // 초당 4프레임
                repeat: -1 // 무한 반복
            });
        }
        
        // 스프라이트로 보스 생성
        const goldBoss = scene.add.sprite(x, y, 'gold_boss_1') as Phaser.GameObjects.Sprite;
        goldBoss.play('gold_boss_anim');
        
        // 골드/장비 던전 보스는 크기를 1/4로 (기본 2배의 1/2 = 1/4)
        goldBoss.setScale(baseScale * 0.5);
        
        return goldBoss;
    },
    
    // 기본 보스 생성 (다른 던전)
    createDefaultBoss(
        scene: Phaser.Scene,
        x: number,
        y: number,
        baseScale: number
    ): Phaser.GameObjects.Image {
        const boss = scene.add.image(x, y, 'enemy');
        // 보스 색상 변경 (빨간색 틴트)
        boss.setTint(0xff4444);
        
        // 다른 던전 보스는 크기 2배
        boss.setScale(baseScale * 2);
        
        return boss;
    }
};
