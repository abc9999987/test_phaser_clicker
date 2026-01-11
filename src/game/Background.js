// 배경 생성
const Background = {
    // 배경 객체들 생성
    create(scene) {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const scale = Responsive.getScale(scene);
        
        // 배경 - 하늘 (반응형)
        const sky = scene.add.image(gameWidth / 2, gameHeight * 0.25, 'sky');
        sky.setScale(scale.x * 1.5, scale.y * 1.5);
        sky.setDepth(-2);
        
        // 배경 - 땅 (반응형)
        const ground = scene.add.image(gameWidth / 2, gameHeight * 0.83, 'ground');
        ground.setScale(scale.x * 1.2, scale.y * 1.2);
        ground.setDepth(-1);
        
        return { sky, ground };
    }
};
