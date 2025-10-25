import { useAlerts } from "../../../hooks/useAlerts";
import { useCallback, useState } from "react";
import { useChatApi } from "../services/ChatServices";
import type { ChatResponse, Message } from "../types/index";

/**
 * Hook encargado de manejar la lógica del chat:
 * - Comunicación con el backend.
 * - Control de estados (mensajes, carga).
 * - Manejo de errores.
 */
export const useChatOperations = () => {
  const chatApi = useChatApi(); // Servicio de API para obtener respuesta del backend.
  const { showError } = useAlerts(); // Hook para mostrar alertas en caso de error.

  // Estado que almacena la conversación completa.
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi! How can I help you today?" },
  ]);

  // Estado que controla si se está esperando respuesta del backend.
  const [loading, setLoading] = useState(false);

  /**
   * Envía la pregunta del usuario al backend y actualiza los mensajes.
   */
  const askQuestion = useCallback(
    async (question: string): Promise<ChatResponse | null> => {
      if (!question.trim()) return null; // Evita enviar mensajes vacíos.

      try {
        // Agrega el mensaje del usuario al historial
        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setLoading(true);

        // Llamada a la API del chat
        const result = await chatApi.getResponse(question);

        // Agrega la respuesta del asistente
        if (result) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: result.response ?? "No response" },
          ]);
        }

        return result;
      } catch (error) {
        // Manejo de error en caso de fallo del backend
        showError("Chat Failed", "Unable to get chat response.");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ There was an error getting a response." },
        ]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [chatApi, showError]
  );

  return {
    askQuestion, // Función para preguntar
    messages, // Lista de mensajes
    loading, // Estado de carga
  };
};
