// 유물 던전 관리 (일일 제한 시스템)
import { GameStateCore } from './GameStateCore';

export const ArtifactDungeonManager = {
    // 일일 제한 횟수
    DAILY_ATTEMPT_LIMIT: 5,
    
    // 한국 시간(UTC+9) 기준 날짜 문자열 반환 (YYYY-MM-DD)
    getKoreaDateString(): string {
        const now = new Date();
        // UTC 시간에 9시간 추가하여 한국 시간 계산
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
    
    // 날짜 체크 및 일일 리셋 처리
    checkAndResetDailyAttempts(): void {
        const currentKoreaDate = this.getKoreaDateString();
        const currentKoreaTimestamp = this.getKoreaTimestamp();
        
        // 저장된 마지막 리셋 날짜가 없거나 오늘 날짜와 다르면 리셋
        if (!GameStateCore.artifactDungeonLastResetDate || 
            GameStateCore.artifactDungeonLastResetDate !== currentKoreaDate) {
            
            // 시간 조작 방지: 마지막 리셋 시간보다 현재 시간이 이전이면 조작으로 간주
            if (GameStateCore.artifactDungeonLastResetTimestamp && 
                currentKoreaTimestamp < GameStateCore.artifactDungeonLastResetTimestamp) {
                console.warn('[유물 던전] 시간 조작 감지: 리셋하지 않음');
                return;
            }
            
            // 일일 리셋
            GameStateCore.artifactDungeonLastResetDate = currentKoreaDate;
            GameStateCore.artifactDungeonUsedAttempts = 0;
            GameStateCore.artifactDungeonLastResetTimestamp = currentKoreaTimestamp;
            GameStateCore.save();
            console.log(`[유물 던전] 일일 리셋 완료: ${currentKoreaDate}`);
        }
    },
    
    // 남은 도전 횟수 반환
    getRemainingAttempts(): number {
        this.checkAndResetDailyAttempts();
        return Math.max(0, this.DAILY_ATTEMPT_LIMIT - (GameStateCore.artifactDungeonUsedAttempts || 0));
    },
    
    // 입장 가능 여부 확인 (입장 버튼은 항상 가능, 횟수 차감 안 함)
    canEnterArtifactDungeon(): boolean {
        // 입장 버튼은 항상 활성화 (횟수 차감 없음)
        return true;
    },
    
    // 소탕 가능 여부 확인 (횟수 > 0 && 층수 >= 2)
    canSweepArtifactDungeon(dungeonLevel: number): boolean {
        this.checkAndResetDailyAttempts();
        const remainingAttempts = this.getRemainingAttempts();
        return remainingAttempts > 0 && dungeonLevel >= 2;
    },
    
    // 소탕 횟수 차감
    useSweepAttempt(): boolean {
        this.checkAndResetDailyAttempts();
        
        const currentAttempts = GameStateCore.artifactDungeonUsedAttempts || 0;
        if (currentAttempts >= this.DAILY_ATTEMPT_LIMIT) {
            return false; // 횟수 초과
        }
        
        GameStateCore.artifactDungeonUsedAttempts = currentAttempts + 1;
        GameStateCore.save(); // 즉시 저장
        return true;
    }
};
