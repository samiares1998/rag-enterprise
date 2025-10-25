import Chat from "../features/chat/components/ChatText"
import { useChatOperations } from "../features/chat/hooks/ChatOperations";


export default function ChatFunction() {

  const {
    askQuestion,
  } = useChatOperations();

  return (
    <Chat
    askQuestion={askQuestion}
    />
  );

}




