// 배경 생성
const Background = {
    // 배경 객체들 생성
    create(scene) {
        // 배경 - 하늘
        const sky = scene.add.image(400, 150, 'sky');
        sky.setScale(1.5);
        sky.setDepth(-2);
        
        // 배경 - 땅
        const ground = scene.add.image(400, 500, 'ground');
        ground.setScale(1.2);
        ground.setDepth(-1);
        
        return { sky, ground };
    }
};
