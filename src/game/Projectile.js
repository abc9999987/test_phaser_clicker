// 투사체 관리 (오브젝트 풀링 방식 - 수동/자동 분리)
const Projectile = {
    manualPool: [],        // 수동 발사용 풀 (노란색)
    autoPool: [],          // 자동 발사용 풀 (초록색)
    active: [],            // 활성화된 투사체들
    poolSize: 30,          // 각 풀 크기
    scene: null,
    
    // 색상 정의
    colors: {
        manual: 0xffff00,  // 노란색
        auto: 0x00ff00      // 초록색
    },
    
    // 풀 초기화
    init(scene) {
        this.scene = scene;
        this.manualPool = [];
        this.autoPool = [];
        this.active = [];
        
        // 수동 발사용 풀 생성 (노란색)
        for (let i = 0; i < this.poolSize; i++) {
            const projectile = scene.add.circle(0, 0, 5, this.colors.manual);
            projectile.setDepth(10);
            projectile.setVisible(false);
            projectile.setActive(false);
            projectile.isProjectile = true;
            projectile.projectileType = 'manual';
            this.manualPool.push(projectile);
        }
        
        // 자동 발사용 풀 생성 (초록색)
        for (let i = 0; i < this.poolSize; i++) {
            const projectile = scene.add.circle(0, 0, 5, this.colors.auto);
            projectile.setDepth(10);
            projectile.setVisible(false);
            projectile.setActive(false);
            projectile.isProjectile = true;
            projectile.projectileType = 'auto';
            this.autoPool.push(projectile);
        }
    },
    
    // 풀에서 투사체 가져오기
    getFromPool(type) {
        const pool = type === 'auto' ? this.autoPool : this.manualPool;
        
        // 사용 가능한 투사체 찾기
        for (let i = 0; i < pool.length; i++) {
            const projectile = pool[i];
            if (!projectile.active) {
                return projectile;
            }
        }
        // 풀이 부족하면 새로 생성 (동적 확장)
        const color = type === 'auto' ? this.colors.auto : this.colors.manual;
        const projectile = this.scene.add.circle(0, 0, 5, color);
        projectile.setDepth(10);
        projectile.isProjectile = true;
        projectile.projectileType = type;
        pool.push(projectile);
        return projectile;
    },
    
    // 투사체 생성 (풀에서 재사용)
    create(scene, startX, startY, targetX, targetY, type = 'manual') {
        const projectile = this.getFromPool(type);
        
        // 투사체 활성화
        projectile.setPosition(startX, startY);
        projectile.setVisible(true);
        projectile.setActive(true);
        
        // 목표 지점까지의 거리와 각도 계산
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // 속도 설정
        const speed = 400; // 픽셀/초
        
        // 투사체 데이터 저장
        projectile.velocityX = Math.cos(angle) * speed;
        projectile.velocityY = Math.sin(angle) * speed;
        projectile.damage = GameState.coinsPerClick;
        projectile.projectileType = type;
        
        this.active.push(projectile);
        return projectile;
    },
    
    // 투사체 업데이트
    update(scene, delta) {
        const deltaSeconds = delta / 1000;
        
        for (let i = this.active.length - 1; i >= 0; i--) {
            const projectile = this.active[i];
            
            // 비활성화된 투사체는 건너뛰기
            if (!projectile.active) {
                this.active.splice(i, 1);
                continue;
            }
            
            // 위치 업데이트
            projectile.x += projectile.velocityX * deltaSeconds;
            projectile.y += projectile.velocityY * deltaSeconds;
            
            // 화면 밖으로 나가면 풀로 반환
            if (projectile.x < 0 || projectile.x > 800 || 
                projectile.y < 0 || projectile.y > 600) {
                this.returnToPool(projectile);
            }
        }
    },
    
    // 투사체를 풀로 반환
    returnToPool(projectile) {
        const index = this.active.indexOf(projectile);
        if (index > -1) {
            this.active.splice(index, 1);
        }
        
        // 투사체 비활성화
        projectile.setVisible(false);
        projectile.setActive(false);
        projectile.setPosition(0, 0);
        projectile.velocityX = 0;
        projectile.velocityY = 0;
        // 풀에 이미 있으므로 추가할 필요 없음 (active 상태만 관리)
    },
    
    // 투사체 제거 (풀로 반환)
    remove(projectile) {
        this.returnToPool(projectile);
    },
    
    // 모든 투사체 제거
    clear() {
        // 모든 활성 투사체를 풀로 반환
        for (let i = this.active.length - 1; i >= 0; i--) {
            this.returnToPool(this.active[i]);
        }
    },
    
    // 풀 정리 (씬 종료 시)
    destroy() {
        this.clear();
        
        // 수동 발사 풀 정리
        this.manualPool.forEach(p => {
            if (p && p.destroy) {
                p.destroy();
            }
        });
        
        // 자동 발사 풀 정리
        this.autoPool.forEach(p => {
            if (p && p.destroy) {
                p.destroy();
            }
        });
        
        this.manualPool = [];
        this.autoPool = [];
        this.active = [];
    }
};
