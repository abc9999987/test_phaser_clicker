// 캐릭터 생성 및 관리
const Character = {
    char: null,
    
    // 캐릭터 생성
    create(scene) {
        // 캐릭터 생성 (preload에서 이미 로드됨)
        this.char = scene.add.image(600, 400, 'char');
        this.char.setScale(0.12, 0.12);
        this.char.setOrigin(0.5, 0.5);
        this.char.setInteractive({ useHandCursor: true });
        
        // 클릭 이벤트
        this.char.on('pointerdown', () => {
            this.onCharacterClick(scene);
        });
        
        return this.char;
    },
    
    // 캐릭터 클릭 핸들러
    onCharacterClick(scene) {
        // 클릭 애니메이션
        Effects.playClickAnimation(scene, this.char);
        
        // enemy가 있으면 투사체 발사
        this.fireProjectile(scene);
    },
    
    // 투사체 발사
    fireProjectile(scene, type = 'manual') {
        if (Enemy.enemy) {
            const projectile = Projectile.create(
                scene, 
                this.char.x, 
                this.char.y, 
                Enemy.enemy.x, 
                Enemy.enemy.y,
                type
            );
            // 투사체 데미지를 현재 클릭 강화 수준으로 설정
            if (projectile) {
                projectile.damage = GameState.coinsPerClick;
            }
        }
    },
    
    // 캐릭터 업데이트 (부드러운 움직임)
    update(scene) {
        if (this.char) {
            this.char.y = 400 + Math.sin(scene.time.now / 1000) * 5;
        }
    }
};
