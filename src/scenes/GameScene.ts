import Phaser from 'phaser';
import { AssetLoader } from '../managers/AssetLoader';
import { GameState } from '../managers/GameState';
import { Projectile } from '../game/Projectile';
import { Background } from '../game/Background';
import { Character } from '../game/Character';
import { Enemy } from '../game/Enemy';
import { UIManager } from '../ui/UIManager';

// 메인 게임 씬
export class GameScene extends Phaser.Scene {
    autoSaveTimer?: Phaser.Time.TimerEvent;
    autoFireTimer?: Phaser.Time.TimerEvent;
    
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload(): void {
        // 에셋 로드
        AssetLoader.preload(this);
    }
    
    create(): void {
        // 저장된 게임 상태 로드
        GameState.load();
        
        // Phaser가 자동으로 preload 완료 후 create 호출하므로 바로 초기화
        this.initializeGame();
    }
    
    initializeGame(): void {
        // 투사체 풀 초기화
        Projectile.init(this);
        
        // 배경 생성
        Background.create(this);
        
        // 캐릭터 생성
        Character.create(this);
        
        // 적 생성 (위쪽 절반 영역에 배치)
        const enemyX = this.scale.width * 0.25;
        const enemyY = this.scale.height * 0.33;
        Enemy.create(this, enemyX, enemyY);
        
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
    startAutoSave(): void {
        this.autoSaveTimer = this.time.addEvent({
            delay: 10000, // 10초마다
            callback: () => {
                GameState.save();
            },
            loop: true
        });
    }
    
    // 자동 발사 설정
    setupAutoFire(): void {
        // 기존 타이머가 있으면 제거
        if (this.autoFireTimer) {
            this.autoFireTimer.remove();
        }
        
        // 공격 속도가 활성화되어 있으면 타이머 시작
        if (GameState.attackSpeed > 0) {
            const fireInterval = 1000 / GameState.attackSpeed; // 초당 N회 = 1000ms / N
            
            this.autoFireTimer = this.time.addEvent({
                delay: fireInterval,
                callback: () => {
                    Character.fireProjectile(this, 'auto');
                },
                loop: true
            });
        }
    }
    
    update(_time: number, delta: number): void {
        // 캐릭터 업데이트
        Character.update(this);
        
        // 투사체 업데이트
        Projectile.update(this, delta);
        
        // HP 바 위치 업데이트
        if (Enemy.enemy && Enemy.hpBar) {
            Enemy.updateHpBarPosition();
        }
        
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
