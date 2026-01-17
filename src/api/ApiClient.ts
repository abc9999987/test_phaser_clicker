// 공통 API 클라이언트
export class ApiError extends Error {
    status?: number;
    code?: string;

    constructor(message: string, status?: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

export const ApiClient = {
    // POST 요청
    async post<T>(
        url: string,
        data: any,
        options?: {
            timeout?: number;
            headers?: Record<string, string>;
        }
    ): Promise<T> {
        const timeout = options?.timeout || 10000; // 기본 10초
        const headers = {
            'Content-Type': 'application/json',
            ...options?.headers
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    // JSON 파싱 실패 시 기본 메시지 사용
                }
                throw new ApiError(errorMessage, response.status);
            }

            const result = await response.json();
            return result as T;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error instanceof ApiError) {
                throw error;
            }
            
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new ApiError('요청 시간이 초과되었습니다.', 408, 'TIMEOUT');
                }
                throw new ApiError(error.message || '네트워크 오류가 발생했습니다.', undefined, 'NETWORK_ERROR');
            }
            
            throw new ApiError('알 수 없는 오류가 발생했습니다.');
        }
    }
};
