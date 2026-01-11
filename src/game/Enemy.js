// 적 관리
const Enemy = {
    enemy: null,
    
    // 적 생성
    create(scene, x, y) {
        this.enemy = scene.add.image(x, y, 'enemy');
        this.enemy.setScale(1.5);
        return this.enemy;
    },
    
    // 투사체와의 충돌 감지
    checkCollision(projectile) {
        if (!this.enemy || !projectile) return false;
        
        // 간단한 원형 충돌 감지
        const dx = projectile.x - this.enemy.x;
        const dy = projectile.y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // enemy 반지름 (스케일 고려)
        const enemyRadius = (this.enemy.width * this.enemy.scaleX) / 2;
        // projectile 반지름
        const projectileRadius = projectile.radius || 5;
        
        return distance < (enemyRadius + projectileRadius);
    },
    
    // 적이 맞았을 때 처리
    onHit(scene, projectile) {
        // 골드 지급
        const damage = projectile.damage || GameState.coinsPerClick;
        GameState.addCoins(damage);
        GameState.clickCount++;
        
        // UI 업데이트
        if (UIManager.update) {
            UIManager.update();
        }
        
        // 적이 맞았을 때 효과 (빨간색 깜빡임)
        scene.tweens.add({
            targets: this.enemy,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
        
        // 코인 파티클 효과 (enemy 위치에서)
        Effects.createCoinParticle(scene, this.enemy.x, this.enemy.y, damage);
    }
};
