// 유물 던전 관리 (일일 제한 시스템)
import { GameStateCore } from './GameStateCore';
import { DungeonSweepManager } from './DungeonSweepManager';

// 유물 던전 관리 (일일 제한 시스템)
// 기존 단일 전용 구조를 유지하면서, 내부 구현은 공통 DungeonSweepManager를 사용하도록 마이그레이션
export const ArtifactDungeonManager = {
    // 유물 던전 ID 및 기본 설정
    DUNGEON_ID: 'artifact_dungeon',
    DAILY_ATTEMPT_LIMIT: 5,
    MIN_SWEEP_LEVEL: 2,
    
    // 날짜 체크 및 일일 리셋 처리
    checkAndResetDailyAttempts(): void {
        // 공통 매니저에서 처리
        DungeonSweepManager.checkAndResetDailyAttempts(this.DUNGEON_ID, this.DAILY_ATTEMPT_LIMIT);

        // --- 기존 데이터에서 새 구조로의 1회성 마이그레이션 ---
        // 아직 dungeonSweepStates에 artifact_dungeon 데이터가 없고,
        // 예전 구조의 값이 존재하면 한 번만 옮겨준다.
        if (GameStateCore.artifactDungeonLastResetDate || GameStateCore.artifactDungeonUsedAttempts || GameStateCore.artifactDungeonSweepCount) {
            const states = GameStateCore.dungeonSweepStates || {};
            if (!states[this.DUNGEON_ID]) {
                states[this.DUNGEON_ID] = {
                    lastResetDate: GameStateCore.artifactDungeonLastResetDate,
                    usedAttempts: GameStateCore.artifactDungeonUsedAttempts,
                    lastResetTimestamp: GameStateCore.artifactDungeonLastResetTimestamp,
                    sweepCount: GameStateCore.artifactDungeonSweepCount
                };
                GameStateCore.dungeonSweepStates = states;
                GameStateCore.save();
            }
        }
    },
    
    // 남은 도전 횟수 반환
    getRemainingAttempts(): number {
        this.checkAndResetDailyAttempts();
        return DungeonSweepManager.getRemainingAttempts(this.DUNGEON_ID, this.DAILY_ATTEMPT_LIMIT);
    },
    
    // 입장 가능 여부 확인 (입장 버튼은 항상 가능, 횟수 차감 안 함)
    canEnterArtifactDungeon(): boolean {
        // 입장 버튼은 항상 활성화 (횟수 차감 없음)
        return true;
    },
    
    // 소탕 가능 여부 확인 (횟수 > 0 && 층수 >= MIN_SWEEP_LEVEL)
    canSweepArtifactDungeon(dungeonLevel: number): boolean {
        this.checkAndResetDailyAttempts();
        return DungeonSweepManager.canSweep(this.DUNGEON_ID, dungeonLevel, this.MIN_SWEEP_LEVEL, this.DAILY_ATTEMPT_LIMIT);
    },
    
    // 소탕 횟수 차감
    useSweepAttempt(): boolean {
        this.checkAndResetDailyAttempts();
        return DungeonSweepManager.useSweepAttempt(this.DUNGEON_ID, this.DAILY_ATTEMPT_LIMIT);
    },
    
    // 소탕 횟수 증가 (누적 통계)
    incrementSweepCount(): void {
        this.checkAndResetDailyAttempts();
        DungeonSweepManager.incrementSweepCount(this.DUNGEON_ID);
    },
    
    // 소탕 횟수 조회
    getSweepCount(): number {
        this.checkAndResetDailyAttempts();
        return DungeonSweepManager.getSweepCount(this.DUNGEON_ID);
    }
};
