// components/ChatBubble.tsx
import { format } from 'date-fns';

interface ChatBubbleProps {
    message: string;
    isSender: boolean;
    timestamp: string;
  }
  
  export const ChatBubble = ({ message, isSender, timestamp }: ChatBubbleProps) => (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-md p-4 rounded-lg ${
        isSender 
          ? 'bg-blue-600 text-white ml-12' 
          : 'bg-gray-100 text-gray-800 mr-12'
      }`}>
        <p className="mb-1">{message}</p>
        <time className="text-xs opacity-75">
  {format(new Date(timestamp), 'HH:mm • MM/dd/yyyy')}
</time>
      </div>
    </div>
  );