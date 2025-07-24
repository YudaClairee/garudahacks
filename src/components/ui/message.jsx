import { Bot, User } from "lucide-react";

export function Message({ message }) {
  const isAI = message.sender === "ai";
  
  return (
    <div className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI && (
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-indigo-600" />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isAI ? 'order-2' : 'order-1'}`}>
        <div className={`p-3 rounded-lg ${
          isAI 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-indigo-600 text-white'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {message.timestamp.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
      
      {!isAI && (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-600" />
        </div>
      )}
    </div>
  );
}
