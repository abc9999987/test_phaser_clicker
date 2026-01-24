import Phaser from 'phaser';
import { SkillConfigs, SkillConfig } from '../config/gameConfig';
import { GameState } from './GameState';
import { Enemy } from '../game/Enemy';
import { Character } from '../game/Character';

// 스킬 쿨타임 및 사용 로직 관리
export const SkillManager = {
    // 마지막 사용 시각 (ms, scene.time.now 기준)
    lastUsedAt: {} as Record<string, number | undefined>,

    // 스킬 설정 가져오기
    getSkillConfig(skillId: string): SkillConfig | undefined {
        return SkillConfigs.find((s) => s.id === skillId);
    },
    
    // 스킬의 skillPower 가져오기 (레벨 반영)
    getSkillPower(skillId: string): number {
        return GameState.getSkillPower(skillId);
    },
    
    // 스킬 습득 시도
    tryLearnSkill(skillId: string): boolean {
        const config = this.getSkillConfig(skillId);
        if (!config) {
            return false;
        }
        
        // 이미 습득한 스킬이면 실패
        if (GameState.isSkillLearned(skillId)) {
            return false;
        }
        
        // SP가 부족하면 실패
        if (GameState.sp < config.spCost) {
            return false;
        }
        
        // SP 차감 및 스킬 습득
        if (GameState.spendSp(config.spCost)) {
            GameState.learnSkill(skillId);
            return true;
        }
        
        return false;
    },

    // 스킬 남은 쿨타임(초) 반환
    getRemainingCooldown(skillId: string, now: number): number {
        const config = this.getSkillConfig(skillId);
        if (!config) return 0;

        const lastUsed = this.lastUsedAt[skillId];
        if (lastUsed === undefined) return 0;

        const elapsed = (now - lastUsed) / 1000;
        
        const remaining = config.cooldown - elapsed;
        return remaining > 0 ? remaining : 0;
    },

    // 스킬 사용 가능 여부
    canUseSkill(skillId: string, now: number): boolean {
        // 쿨타임 체크
        if (this.getRemainingCooldown(skillId, now) > 0) {
            return false;
        }
        
        // BUFF 타입 스킬은 버프가 활성화되어 있으면 사용 불가
        const config = this.getSkillConfig(skillId);
        if (config && config.skillType === 2) { // BUFF 타입
            if (GameState.isBuffActive(skillId, now)) {
                return false;
            }
        }
        
        return true;
    },

    // 스킬 사용 시도
    tryUseSkill(scene: Phaser.Scene, skillId: string): boolean {
        const now = scene.time.now;
        const config = this.getSkillConfig(skillId);
        if (!config) {
            return false;
        }
        
        // 스킬을 습득하지 않았으면 사용 불가
        if (!GameState.isSkillLearned(skillId)) {
            return false;
        }

        if (!this.canUseSkill(skillId, now)) {
            return false;
        }

        // 스킬 타입에 따라 처리
        if (config.skillType === 2) { // BUFF 타입
            // 버프 스킬: 지속시간 동안 효과 적용
            if (config.duration) {
                GameState.activateBuff(skillId, now, config.duration, scene);
            }
            // 버프 스킬은 즉시 쿨타임을 적용하지 않고, 지속시간이 끝나면 쿨타임 적용
            // 마지막 사용 시간은 기록하지 않음 (지속시간 종료 시 기록)
        } else {
            // ATTACK 타입 스킬
            // 적이 없으면 사용 불가
            if (!Enemy.enemy) {
                return false;
            }

            // 붕어빵테오 스킬의 경우 특별한 애니메이션 처리
            if (skillId === 'big_k_fish_bread') {
                this.playBigKFishBreadAnimation(scene, config);
            } else {
                // 다른 스킬은 즉시 데미지 적용
                const damage = Math.round(GameState.getAttackPowerValue() * config.skillPower);
                Enemy.applyDamage(scene, damage, true); // 스킬 데미지로 표시
            }

            // 마지막 사용 시간 기록
            this.lastUsedAt[skillId] = now;
        }
        
        return true;
    },
    
    // 붕어빵테오 스킬 애니메이션
    playBigKFishBreadAnimation(scene: Phaser.Scene, config: SkillConfig): void {
        if (!Enemy.enemy || !Character.char) return;
        
        // 캐릭터 머리 위 위치 (캐릭터 위쪽)
        const startX = Character.char.x;
        const startY = Character.char.y - Character.char.height * Character.char.scaleY * 0.5 - 30;
        
        // 적 머리 위치 (적의 위쪽)
        const targetX = Enemy.enemy.x;
        const targetY = Enemy.enemy.y - Enemy.enemy.height * Enemy.enemy.scaleY * 0.5 - 20;
        
        // 데미지 계산
        const damage = Math.round(GameState.getAttackPowerValue() * config.skillPower);
        
        // 거대한 붕어빵 이미지 생성
        const fishBread = scene.add.image(startX, startY, 'weapon');
        const scale = 0.8;
        fishBread.setScale(scale);
        fishBread.setOrigin(0.5, 0.5);
        fishBread.setDepth(25); // 적 위에 표시
        
        // 회전 각도 계산 (적 방향으로)
        const angle = (Math.atan2(targetY - startY, targetX - startX) + Math.PI / 2) + 1;
        fishBread.setRotation(angle);
        
        // 1단계: 캐릭터 머리 위에 1초 동안 떠있기 (약간의 위아래 움직임)
        scene.tweens.add({
            targets: fishBread,
            y: startY - 10,
            duration: 500,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // 2단계: 퐉!! 하고 적 머리에 빠르게 꽂히기
                // 회전 각도 재계산 (적 방향으로)
                const finalAngle = Math.atan2(targetY - fishBread.y, targetX - fishBread.x) + Math.PI / 2 + 0.8;
                fishBread.setRotation(finalAngle);
                
                scene.tweens.add({
                    targets: fishBread,
                    x: targetX,
                    y: targetY,
                    duration: 300, // 빠르게 날아감
                    ease: 'Power3',
                    onComplete: () => {
                        // 적에게 도달했을 때 데미지 적용
                        Enemy.applyDamage(scene, damage, true); // 스킬 데미지로 표시
                        
                        // 꽂히는 효과 (스케일 증가 + 약간의 진동)
                        scene.tweens.add({
                            targets: fishBread,
                            scaleX: scale * 1.5,
                            scaleY: scale * 1.5,
                            duration: 25,
                            ease: 'Power2',
                            onComplete: () => {
                                // 페이드아웃
                                scene.tweens.add({
                                    targets: fishBread,
                                    alpha: 0,
                                    duration: 25,
                                    ease: 'Power2',
                                    onComplete: () => {
                                        fishBread.destroy();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

