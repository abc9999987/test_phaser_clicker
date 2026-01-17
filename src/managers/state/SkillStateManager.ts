// 스킬 상태 관리 (GameState 내부)
import { GameStateCore } from './GameStateCore';
import { SkillConfigs } from '../../config/gameConfig';
import { SpManager } from './SpManager';

export const SkillStateManager = {
    // 스킬 습득 여부 확인
    isSkillLearned(skillId: string): boolean {
        return GameStateCore.learnedSkills.includes(skillId);
    },
    
    // 스킬 습득
    learnSkill(skillId: string): boolean {
        if (!this.isSkillLearned(skillId)) {
            GameStateCore.learnedSkills.push(skillId);
            // 습득 시 레벨 1로 초기화
            GameStateCore.skillLevels[skillId] = 1;
            GameStateCore.save();
            return true;
        }
        return false;
    },
    
    // 스킬 레벨 가져오기
    getSkillLevel(skillId: string): number {
        return GameStateCore.skillLevels[skillId] || 1; // 기본값 1
    },
    
    // 스킬 레벨 업그레이드
    upgradeSkill(skillId: string): boolean {
        // 스킬을 습득하지 않았으면 실패
        if (!this.isSkillLearned(skillId)) {
            return false;
        }
        
        // SkillConfig에서 maxLevel 확인
        const config = SkillConfigs.find((s) => s.id === skillId);
        if (!config) {
            return false;
        }
        
        const currentLevel = this.getSkillLevel(skillId);
        const maxLevel = config.maxLevel || 1;
        
        // 최대 레벨에 도달했으면 실패
        if (currentLevel >= maxLevel) {
            return false;
        }
        
        // SP 소모 (spUpgradeCost가 있으면 사용, 없으면 기본 3)
        const spCost = config.spUpgradeCost || 3;
        if (GameStateCore.sp >= spCost && SpManager.spendSp(spCost)) {
            GameStateCore.skillLevels[skillId] = currentLevel + 1;
            GameStateCore.save();
            return true;
        }
        
        return false;
    },
    
    // 스킬의 skillPower 가져오기 (레벨 반영)
    getSkillPower(skillId: string): number {
        const config = SkillConfigs.find((s) => s.id === skillId);
        if (!config) {
            return 1;
        }
        
        // buff_attack_damage 스킬의 경우 레벨에 따라 skillPower 변경
        if (skillId === 'buff_attack_damage') {
            const level = this.getSkillLevel(skillId);
            // 레벨 1: 3, 레벨 2: 4, 레벨 3: 5
            return 2 + level;
        }
        
        // 다른 스킬은 기본 skillPower 반환
        return config.skillPower;
    },
    
    // 스킬 자동 사용 토글
    toggleSkillAutoUse(skillId: string): boolean {
        GameStateCore.skillAutoUse[skillId] = !this.isSkillAutoUse(skillId);
        GameStateCore.debouncedSave();
        return GameStateCore.skillAutoUse[skillId];
    },
    
    // 스킬 자동 사용 여부 확인
    isSkillAutoUse(skillId: string): boolean {
        return GameStateCore.skillAutoUse[skillId] === true;
    }
};
