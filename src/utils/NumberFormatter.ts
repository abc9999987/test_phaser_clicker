// 숫자 표기 변환 유틸리티
export const NumberFormatter = {
    // 상수 미리 계산
    해: 1e20,
    
    /**
     * 숫자를 한글/알파벳 단위로 변환
     * - 경(10^20)까지는 한글로 표기 (두 번째 단위까지만 표시)
     * - 경 이후부터는 알파벳으로 표기 (a, b, c, ..., z, aa, ab, ..., az, ba, bb, ..., bz)
     * 
     * @param num 변환할 숫자
     * @returns 변환된 문자열
     */
    formatNumber(num: number): string {
        if (num < 0) {
            return '-' + this.formatNumber(-num);
        }
        
        if (num === 0) {
            return '0';
        }
        
        // 경 단위 (10^20)까지는 한글 표기
        if (num < this.해) {
            return this.formatKorean(num);
        } else {
            return this.formatAlphabet(num);
        }
    },
    
    /**
     * 한글 단위로 변환 (경까지)
     * 천 단위까지는 숫자 그대로, 만 단위부터 단위 표시 (예: 7239 -> 7239, 17239 -> 1.7만)
     */
    formatKorean(num: number): string {
        // 천 단위(1000)까지는 그냥 숫자로 표시
        if (num < 1e4) {
            return Math.floor(num).toString();
        }
        
        // 단위 배열 (값이 큰 순서대로)
        const units = [
            { value: 1e20, name: '해' },      // 10^20
            { value: 1e16, name: '경' },      // 10^16
            { value: 1e12, name: '조' },      // 10^12
            { value: 1e8, name: '억' },       // 10^8
            { value: 1e4, name: '만' }        // 10^4
        ];
        
        // 가장 큰 단위 찾기
        for (let i = 0; i < units.length; i++) {
            const unit = units[i];
            if (num >= unit.value) {
                // 해당 단위로 나눈 값 계산
                const value = num / unit.value;
                
                // 소수점 1자리까지 표시하고 불필요한 .0 제거
                let formatted = value.toFixed(1);
                if (formatted.endsWith('.0')) {
                    formatted = formatted.slice(0, -2);
                }
                
                return formatted + unit.name;
            }
        }
        
        // 만 단위 이상이지만 units에 없는 경우 (이론적으로 발생하지 않아야 함)
        return Math.floor(num).toString();
    },
    
    /**
     * 알파벳 단위로 변환 (경 이후)
     * 가장 앞에 단위만 표시 (예: a, b, aa)
     */
    formatAlphabet(num: number): string {
        // 경을 기준으로 몇 배인지 계산
        const ratio = num / this.해;
        
        // ratio가 1 미만이면 경보다 작은 경우 (이론적으로는 발생하지 않아야 함)
        if (ratio < 1) {
            return this.formatKorean(num);
        }
        
        // ratio의 로그를 취해서 10^4 단위로 나눔
        // 예: ratio = 10^4 -> log10 = 4 -> index = 0 (a)
        //     ratio = 10^8 -> log10 = 8 -> index = 1 (b)
        const exponent = Math.floor(Math.log10(ratio));
        const alphabetIndex = Math.max(0, Math.floor(exponent / 4));
        
        // 알파벳 문자열 생성
        const alphabet = this.getAlphabetString(alphabetIndex);
        
        // 해당 단위의 값 계산
        // baseValue = 10^(alphabetIndex * 4) 대신 비트 시프트나 직접 계산 최적화
        // 하지만 10의 거듭제곱이므로 Math.pow 사용 (작은 값이므로 성능 영향 미미)
        const baseValue = Math.pow(10, alphabetIndex * 4);
        const value = ratio / baseValue;
        
        // 소수점 1자리까지 표시하고 불필요한 .0 제거
        let formatted = value.toFixed(1);
        if (formatted.endsWith('.0')) {
            formatted = formatted.slice(0, -2);
        }
        
        return formatted + alphabet;
    },
    
    /**
     * 알파벳 인덱스를 알파벳 문자열로 변환
     * 0 = a, 1 = b, ..., 25 = z, 26 = aa, 27 = ab, ...
     */
    getAlphabetString(index: number): string {
        if (index < 26) {
            // a-z (단일 문자)
            return String.fromCharCode(97 + index); // 'a' = 97
        } else {
            // aa, ab, ..., az, ba, bb, ... (두 글자)
            const offset = index - 26;
            const firstChar = Math.floor(offset / 26);
            const secondChar = offset % 26;
            // 문자열 연결 최적화
            return String.fromCharCode(97 + firstChar, 97 + secondChar);
        }
    }
};
