import type { ChatResponse } from '../types/index';
import { useApiChat } from '../../../hooks/useApiChat';

// Hook personalizado para la API de documentos
export const useChatApi = () => {
  const { GET } = useApiChat();

  const chatApi = {
    // Obtener todos los documentos--------------------------------------------------------------------
    getResponse: async (question:string): Promise<ChatResponse> => {
      const result = await GET<ChatResponse>('/mini-llama?question='+question);

      if (!result.success) {
        throw new Error(result.error.message || `Error fetching documents: ${result.error.statusCode}`);
      }

      return result.data;
    }
  };

  return chatApi;
};