import Phaser from 'phaser';
import { SkillConfigs, SkillConfig } from '../config/gameConfig';
import { GameState } from './GameState';
import { Enemy } from '../game/Enemy';

// 스킬 쿨타임 및 사용 로직 관리
export const SkillManager = {
    // 마지막 사용 시각 (ms, scene.time.now 기준)
    lastUsedAt: {} as Record<string, number | undefined>,

    // 스킬 설정 가져오기
    getSkillConfig(skillId: string): SkillConfig | undefined {
        return SkillConfigs.find((s) => s.id === skillId);
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
        return this.getRemainingCooldown(skillId, now) <= 0;
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

        // 적이 없으면 사용 불가
        if (!Enemy.enemy) {
            return false;
        }

        // 데미지 계산: 유저 공격력 * 배수
        const damage = GameState.getAttackPowerValue() * config.damageMultiplier;

        // 적에게 데미지 적용
        Enemy.applyDamage(scene, damage);

        // 마지막 사용 시간 기록
        this.lastUsedAt[skillId] = now;
        return true;
    }
};

