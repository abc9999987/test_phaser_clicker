import Phaser from 'phaser';
import { GameState } from '../managers/GameState';
import { SkillManager } from '../managers/SkillManager';
import { ArtifactConfigs } from '../config/artifactConfig';

// 투사체 타입 정의
export interface ProjectileType extends Phaser.GameObjects.Image {
    velocityX: number;
    velocityY: number;
    damage: number;
    projectileType: 'manual' | 'auto';
    isProjectile: boolean;
    isCrit: boolean; // 치명타 여부
}

// 투사체 관리 (오브젝트 풀링 방식 - 수동/자동 분리)
export const Projectile = {
    manualPool: [] as ProjectileType[],
    autoPool: [] as ProjectileType[],
    active: [] as ProjectileType[],
    poolSize: 30,
    scene: null as Phaser.Scene | null,
    
    // 색상 정의
    colors: {
        manual: 0xffff00,  // 노란색
        auto: 0x00ff00      // 초록색
    },
    
    // 풀 초기화
    init(scene: Phaser.Scene): void {
        this.scene = scene;
        this.manualPool = [];
        this.autoPool = [];
        this.active = [];
        
        // 수동 발사용 풀 생성 (무기 이미지 사용)
        for (let i = 0; i < this.poolSize; i++) {
            const projectile = scene.add.image(0, 0, 'weapon') as ProjectileType;
            projectile.setScale(0.15); // 적절한 크기로 조정
            projectile.setOrigin(0.5, 0.5);
            projectile.setFlipX(true); // x축 기준으로 뒤집기
            projectile.setDepth(10);
            projectile.setVisible(false);
            projectile.setActive(false);
            projectile.isProjectile = true;
            projectile.isCrit = false;
            projectile.projectileType = 'manual';
            this.manualPool.push(projectile);
        }
        
        // 자동 발사용 풀 생성 (무기 이미지 사용)
        for (let i = 0; i < this.poolSize; i++) {
            const projectile = scene.add.image(0, 0, 'weapon') as ProjectileType;
            projectile.setScale(0.15); // 적절한 크기로 조정
            projectile.setOrigin(0.5, 0.5);
            projectile.setFlipX(true); // x축 기준으로 뒤집기
            projectile.setDepth(10);
            projectile.setVisible(false);
            projectile.setActive(false);
            projectile.isProjectile = true;
            projectile.isCrit = false;
            projectile.projectileType = 'auto';
            this.autoPool.push(projectile);
        }
    },
    
    // 풀에서 투사체 가져오기
    getFromPool(type: 'manual' | 'auto'): ProjectileType {
        const pool = type === 'auto' ? this.autoPool : this.manualPool;
        
        // 사용 가능한 투사체 찾기
        for (let i = 0; i < pool.length; i++) {
            const projectile = pool[i];
            if (!projectile.active) {
                return projectile;
            }
        }
        // 풀이 부족하면 새로 생성 (동적 확장)
        if (!this.scene) {
            throw new Error('Scene not initialized');
        }
        const projectile = this.scene.add.image(0, 0, 'weapon') as ProjectileType;
        projectile.setScale(0.15);
        projectile.setOrigin(0.5, 0.5);
        projectile.setFlipX(true); // x축 기준으로 뒤집기
        projectile.setDepth(10);
        projectile.isProjectile = true;
        projectile.isCrit = false;
        projectile.projectileType = type;
        pool.push(projectile);
        return projectile;
    },
    
    // 투사체 생성 (풀에서 재사용)
    create(scene: Phaser.Scene, startX: number, startY: number, targetX: number, targetY: number, type: 'manual' | 'auto' = 'manual', imageKey: string = 'weapon'): ProjectileType | null {
        const projectile = this.getFromPool(type);
        
        // 투사체 이미지 설정 (항상 명시적으로 설정하여 이전 텍스처 초기화)
        projectile.setTexture(imageKey);
        
        // 투사체 활성화
        projectile.setPosition(startX, startY);
        projectile.setVisible(true);
        projectile.setActive(true);
        
        // 목표 지점까지의 거리와 각도 계산
        const dx = targetX - startX;
        const dy = targetY - startY;
        const angle = Math.atan2(dy, dx);
        
        // 속도 설정
        const speed = 400; // 픽셀/초
        
        // 투사체 회전 설정 (발사 방향으로)
        projectile.setRotation(angle);
        
        // 투사체 데이터 저장
        projectile.velocityX = Math.cos(angle) * speed;
        projectile.velocityY = Math.sin(angle) * speed;
        
        // 치명타 계산
        const critChance = GameState.critChance;
        const isCrit = Math.random() * 100 < critChance;
        const baseDamage = GameState.getAttackPowerValue();
        
        // 버프 배수 적용 (분노 스킬 등)
        let buffMultiplier = 1;
        const currentTime = scene.time.now;
        if (GameState.isBuffActive('buff_attack_damage', currentTime)) {
            // 레벨에 따른 skillPower 가져오기
            buffMultiplier = SkillManager.getSkillPower('buff_attack_damage');
        }

        let finalDamage = isCrit ? Math.round(baseDamage * (1.5 + (GameState.critDamage / 100))) : baseDamage;
        finalDamage = Math.round(finalDamage * buffMultiplier);    
        projectile.damage = finalDamage;
        projectile.isCrit = isCrit;
        projectile.projectileType = type;
        
        this.active.push(projectile);
        return projectile;
    },
    
    // 투사체 업데이트
    update(scene: Phaser.Scene, delta: number): void {
        const deltaSeconds = delta / 1000;
        
        for (let i = this.active.length - 1; i >= 0; i--) {
            const projectile = this.active[i];
            
            // 비활성화된 투사체는 건너뛰기
            if (!projectile.active) {
                this.active.splice(i, 1);
                continue;
            }
            
            // velocity가 0이면 풀로 반환 (멈춘 투사체 제거)
            if (projectile.velocityX === 0 && projectile.velocityY === 0) {
                this.returnToPool(projectile);
                continue;
            }
            
            // 위치 업데이트
            projectile.x += projectile.velocityX * deltaSeconds;
            projectile.y += projectile.velocityY * deltaSeconds;
            
            // 화면 밖으로 나가면 풀로 반환 (반응형)
            const gameWidth = scene.scale.width;
            const gameHeight = scene.scale.height;
            if (projectile.x < 0 || projectile.x > gameWidth || 
                projectile.y < 0 || projectile.y > gameHeight) {
                this.returnToPool(projectile);
            }
        }
    },
    
    // 투사체를 풀로 반환
    returnToPool(projectile: ProjectileType): void {
        const index = this.active.indexOf(projectile);
        if (index > -1) {
            this.active.splice(index, 1);
        }
        
        // 투사체가 유효하고 씬이 존재하는 경우에만 텍스처 복원
        if (projectile && projectile.scene && projectile.scene.sys) {
            // 투사체 비활성화
            projectile.setVisible(false);
            projectile.setActive(false);
            projectile.setPosition(0, 0);
            projectile.velocityX = 0;
            projectile.velocityY = 0;
            
            // 텍스처를 기본값으로 복원 (weapon2 등 다른 텍스처가 설정되었을 수 있음)
            try {
                projectile.setTexture('weapon');
            } catch (e) {
                // 텍스처 설정 실패 시 무시 (씬이 아직 완전히 초기화되지 않았을 수 있음)
                console.warn('Failed to reset projectile texture:', e);
            }
        } else {
            // 투사체가 유효하지 않으면 기본 속성만 초기화
            if (projectile) {
                projectile.velocityX = 0;
                projectile.velocityY = 0;
            }
        }
        
        // 풀에 이미 있으므로 추가할 필요 없음 (active 상태만 관리)
    },
    
    // 투사체 제거 (풀로 반환)
    remove(projectile: ProjectileType): void {
        this.returnToPool(projectile);
    },
    
    // 모든 투사체 제거
    clear(): void {
        // 모든 활성 투사체를 풀로 반환
        for (let i = this.active.length - 1; i >= 0; i--) {
            this.returnToPool(this.active[i]);
        }
    },
    
    // 풀 정리 (씬 종료 시)
    destroy(): void {
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
