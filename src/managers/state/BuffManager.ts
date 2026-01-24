// 버프 관리
import Phaser from 'phaser';
import { GameStateCore } from './GameStateCore';
import { Character } from '../../game/Character';
import { SkillStateManager } from './SkillStateManager';
import { GameState } from '../GameState';
import { EggGachaConfigs } from '../../config/eggGachaConfig';

export const BuffManager = {
    // 버프 활성화
    activateBuff(skillId: string, startTime: number, duration: number, scene?: Phaser.Scene): void {
        GameStateCore.activeBuffs[skillId] = {
            startTime: startTime,
            endTime: startTime + duration * 1000 // duration은 초 단위이므로 밀리초로 변환
        };
        
        // buff_attack_damage 버프일 경우 이펙트 표시
        if (skillId === 'buff_attack_damage' && scene) {
            Character.showBuffEffect(scene);
        }
    },
    
    // 버프 만료 여부 확인
    isBuffActive(skillId: string, currentTime: number): boolean {
        const buff = GameStateCore.activeBuffs[skillId];
        if (!buff) return false;
        return currentTime < buff.endTime;
    },
    
    // 버프 제거
    removeBuff(skillId: string): void {
        delete GameStateCore.activeBuffs[skillId];
        
        // buff_attack_damage 버프일 경우 이펙트 숨김
        if (skillId === 'buff_attack_damage') {
            Character.hideBuffEffect();
        }
    },
    
    // 활성 버프의 배수 가져오기 (데미지 증가용)
    getBuffMultiplier(skillId: string, currentTime: number): number {
        if (this.isBuffActive(skillId, currentTime)) {
            // 레벨에 따른 skillPower 반환
            return SkillStateManager.getSkillPower(skillId);
        }
        return 1;
    },
    
    // 버프 남은 지속시간 계산 (초 단위)
    getBuffRemainingDuration(skillId: string, currentTime: number): number {
        const buff = GameStateCore.activeBuffs[skillId];
        if (!buff) return 0;
        
        if (currentTime >= buff.endTime) return 0;
        
        const remaining = (buff.endTime - currentTime) / 1000; // 밀리초를 초로 변환
        return remaining > 0 ? remaining : 0;
    },

    hasPet(): boolean {
        return GameState.getEggGachaCount(EggGachaConfigs[0].id) > 0 ? true : false;
    }
};
