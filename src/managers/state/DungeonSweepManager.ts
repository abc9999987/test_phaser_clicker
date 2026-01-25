// 던전 공통 소탕 관리 (일일 제한 시스템)
import { GameStateCore } from './GameStateCore';

export interface DungeonSweepState {
    lastResetDate?: string | null;        // YYYY-MM-DD (한국 시간 기준)
    usedAttempts?: number;               // 오늘 사용한 소탕 횟수
    lastResetTimestamp?: number | null;  // 마지막 리셋 시간 (한국 시간 기준)
    sweepCount?: number;                 // 누적 소탕 횟수
}

export const DungeonSweepManager = {
    // 기본 일일 소탕 횟수
    DEFAULT_DAILY_LIMIT: 5,

    // 한국 시간(UTC+9) 기준 날짜 문자열 반환 (YYYY-MM-DD)
    getKoreaDateString(): string {
        const now = new Date();
        const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const year = koreaTime.getUTCFullYear();
        const month = String(koreaTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(koreaTime.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 한국 시간(UTC+9) 기준 timestamp 반환
    getKoreaTimestamp(): number {
        const now = new Date();
        return now.getTime() + (9 * 60 * 60 * 1000); // UTC+9
    },

    // 내부적으로 던전별 상태 객체 가져오기 (없으면 초기화)
    getState(dungeonId: string): DungeonSweepState {
        if (!GameStateCore.dungeonSweepStates) {
            GameStateCore.dungeonSweepStates = {};
        }
        if (!GameStateCore.dungeonSweepStates[dungeonId]) {
            GameStateCore.dungeonSweepStates[dungeonId] = {
                lastResetDate: null,
                usedAttempts: 0,
                lastResetTimestamp: null,
                sweepCount: 0
            };
        }
        return GameStateCore.dungeonSweepStates[dungeonId];
    },

    // 날짜 체크 및 일일 리셋 처리 (던전별)
    checkAndResetDailyAttempts(dungeonId: string, _dailyLimit?: number): void {
        const state = this.getState(dungeonId);
        const currentKoreaDate = this.getKoreaDateString();
        const currentKoreaTimestamp = this.getKoreaTimestamp();

        // 저장된 마지막 리셋 날짜가 없거나 오늘 날짜와 다르면 리셋
        if (!state.lastResetDate || state.lastResetDate !== currentKoreaDate) {
            // 시간 조작 방지: 마지막 리셋 시간보다 현재 시간이 이전이면 조작으로 간주
            if (state.lastResetTimestamp && currentKoreaTimestamp < state.lastResetTimestamp) {
                console.warn(`[던전 소탕] 시간 조작 감지 (${dungeonId}): 리셋하지 않음`);
                return;
            }

            state.lastResetDate = currentKoreaDate;
            state.usedAttempts = 0;
            state.lastResetTimestamp = currentKoreaTimestamp;
            GameStateCore.debouncedSave();
        }
    },

    // 남은 소탕 횟수 반환
    getRemainingAttempts(dungeonId: string, dailyLimit?: number): number {
        const limit = dailyLimit ?? this.DEFAULT_DAILY_LIMIT;
        this.checkAndResetDailyAttempts(dungeonId, limit);
        const state = this.getState(dungeonId);
        const used = state.usedAttempts || 0;
        return Math.max(0, limit - used);
    },

    // 소탕 가능 여부 확인 (횟수 > 0 && 층수 >= 최소 레벨)
    canSweep(dungeonId: string, dungeonLevel: number, minLevel: number = 2, dailyLimit?: number): boolean {
        const remainingAttempts = this.getRemainingAttempts(dungeonId, dailyLimit);
        return remainingAttempts > 0 && dungeonLevel >= minLevel;
    },

    // 소탕 횟수 차감
    useSweepAttempt(dungeonId: string, dailyLimit?: number): boolean {
        const limit = dailyLimit ?? this.DEFAULT_DAILY_LIMIT;
        this.checkAndResetDailyAttempts(dungeonId, limit);
        const state = this.getState(dungeonId);
        const used = state.usedAttempts || 0;

        if (used >= limit) {
            return false; // 횟수 초과
        }

        state.usedAttempts = used + 1;
        GameStateCore.save(); // 즉시 저장
        return true;
    },

    // 소탕 횟수 증가 (누적 통계)
    incrementSweepCount(dungeonId: string): void {
        const state = this.getState(dungeonId);
        state.sweepCount = (state.sweepCount || 0) + 1;
        GameStateCore.save(); // 즉시 저장
    },

    // 누적 소탕 횟수 조회
    getSweepCount(dungeonId: string): number {
        const state = this.getState(dungeonId);
        return state.sweepCount || 0;
    }
};

