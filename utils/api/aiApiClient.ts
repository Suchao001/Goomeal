import { BaseApiClient } from "./baseClient";

export class AiApiClient extends BaseApiClient {

    async suggestFood(payload?: any) {
        try {
            const response = await this.axiosInstance.post('/api/ai/suggest-food', payload || {});
            return {
                success: true,
                data: response.data,
                message: response.data.message
            };
        } catch (error) {
            const errorInfo = this.getErrorInfo(error);
            return {
                success: false,
                error: errorInfo.message,
                shouldLogout: errorInfo.shouldLogout
            };
        }
    }

}