// 메인 게임 씬
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
        // 에셋 로드
        AssetLoader.preload(this);
    }
    
    create() {
        // 저장된 게임 상태 로드
        GameState.load();
        
        // Phaser가 자동으로 preload 완료 후 create 호출하므로 바로 초기화
        this.initializeGame();
    }
    
    initializeGame() {
        // 투사체 풀 초기화
        Projectile.init(this);
        
        // 배경 생성
        Background.create(this);
        
        // 캐릭터 생성
        Character.create(this);
        
        // 적 생성
        Enemy.create(this, 200, 400);
        
        // UI 생성
        UIManager.create(this);
        
        // 자동 발사 타이머 설정 (로드된 상태 반영)
        this.setupAutoFire();
        
        // UI 업데이트 (로드된 상태 반영)
        UIManager.update();
        
        // 주기적 자동 저장 시작
        this.startAutoSave();
    }
    
    // 주기적 자동 저장 시작
    startAutoSave() {
        this.autoSaveTimer = this.time.addEvent({
            delay: 10000, // 5초마다
            callback: () => {
                GameState.save();
            },
            loop: true
        });
    }
    
    // 자동 발사 설정
    setupAutoFire() {
        // 기존 타이머가 있으면 제거
        if (this.autoFireTimer) {
            this.autoFireTimer.remove();
        }
        
        // 자동 발사가 활성화되어 있으면 타이머 시작
        if (GameState.autoFireRate > 0) {
            const fireInterval = 1000 / GameState.autoFireRate; // 초당 N회 = 1000ms / N
            
            this.autoFireTimer = this.time.addEvent({
                delay: fireInterval,
                callback: () => {
                    Character.fireProjectile(this, 'auto');
                },
                loop: true
            });
        }
    }
    
    update(time, delta) {
        // 캐릭터 업데이트
        Character.update(this);
        
        // 투사체 업데이트
        Projectile.update(this, delta);
        
        // 투사체와 enemy 충돌 감지
        // 배열을 복사하여 순회 (제거 시 인덱스 문제 방지)
        const projectilesToCheck = [...Projectile.active];
        for (let i = 0; i < projectilesToCheck.length; i++) {
            const projectile = projectilesToCheck[i];
            // 이미 제거된 투사체는 건너뛰기
            if (!projectile || !projectile.active) continue;
            
            if (Enemy.checkCollision(projectile)) {
                Enemy.onHit(this, projectile);
                Projectile.remove(projectile);
            }
        }
    }
}
