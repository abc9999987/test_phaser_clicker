// 스테이지 관리
import { GameStateCore } from './GameStateCore';

export const StageManager = {
    // 스테이지 문자열 반환 (예: "1-5")
    getStageString(): string {
        return `${GameStateCore.chapter}-${GameStateCore.stage}`;
    },
    
    // 현재 스테이지 번호 계산 (챕터와 스테이지를 합친 전체 번호)
    getTotalStageNumber(): number {
        return (GameStateCore.chapter - 1) * 20 + GameStateCore.stage;
    },
    
    // 보스 스테이지인지 확인 (10번째 적 = killsInCurrentStage === 9)
    isBossStage(): boolean {
        // 보스 스킵이 체크되어 있으면 보스 스테이지가 아님
        if (GameStateCore.skipBossStage) {
            return false;
        }
        return GameStateCore.killsInCurrentStage === 9;
    },
    
    // 스테이지별 적 체력 계산
    getEnemyHp(): number {
        const totalStage = this.getTotalStageNumber();
        // 1-1: 10, 이후 1.5배씩 증가
        // 0.5배로 감소
        let baseHp = Math.floor(10 * Math.pow(1.5, totalStage - 1) * 0.25);
        
        // 보스 스테이지면 체력 2배
        if (this.isBossStage()) {
            baseHp *= 4;
        }
        
        return baseHp;
    },
    
    // 스테이지별 골드 보상 (적 체력 * 2)
    getEnemyGoldReward(): number {
        return this.getEnemyHp() * 2;
    },
    
    // 적 처치 시 호출 (스테이지 진행 처리)
    onEnemyDefeated(): void {
        GameStateCore.killsInCurrentStage++;
        
        if (GameStateCore.skipBossStage) {
            // 보스 스킵이 체크되어 있으면 처치 카운트만 초기화 (스테이지는 변경하지 않음)
            GameStateCore.killsInCurrentStage = 0;
            GameStateCore.save();
            return;
        }
        
        // 10마리 처치 시 다음 스테이지로
        if (GameStateCore.killsInCurrentStage >= 10) {
            GameStateCore.killsInCurrentStage = 0;
            GameStateCore.stage++;
            
            // 1-20 이후 2-1로
            if (GameStateCore.stage > 20) {
                GameStateCore.stage = 1;
                GameStateCore.chapter++;
            }
            
            GameStateCore.save(); // 스테이지 변경 시 저장
        }
    },
    
    // 보스 타이머 만료 시 호출 (처치 카운트만 초기화)
    onBossTimerExpired(): void {
        GameStateCore.killsInCurrentStage = 0;
        GameStateCore.save();
    }
};
