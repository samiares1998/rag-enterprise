import { useState, useRef, useEffect } from "react";
import { useChatOperations } from "../hooks/ChatOperations";

/**
 * Componente de chat encargado únicamente de la interfaz visual:
 * - Mostrar mensajes.
 * - Capturar input del usuario.
 * - Invocar funciones del hook de lógica.
 */
export default function Chat() {
  // Extrae la lógica desde el hook personalizado
  const { askQuestion, messages, loading } = useChatOperations();

  // Estado local para controlar el texto del input
  const [input, setInput] = useState("");

  // Referencia al final del contenedor para hacer scroll automático
  const endRef = useRef<HTMLDivElement | null>(null);

  // Efecto para mantener el scroll al último mensaje
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Envía la pregunta escrita por el usuario
   */
  const handleSend = async () => {
    if (!input.trim()) return; // Evita enviar si está vacío
    await askQuestion(input); // Llama al hook para enviar la pregunta
    setInput(""); // Limpia el input
  };

  return (
    <div className="flex flex-col h-[70vh] bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">💬 Chat</h1>
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-sm text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Mensaje de carga */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-sm text-sm bg-gray-200 text-gray-800 rounded-bl-none">
              Assistant is typing...
            </div>
          </div>
        )}

        {/* Ancla para scroll automático */}
        <div ref={endRef} />
      </div>

      {/* Input para enviar mensajes */}
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => !loading && e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition shadow-sm ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
