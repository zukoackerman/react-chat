import React from "react";
import { Message } from "../screens/Home";

interface MessageItemProps {
  message: Message;
  currentUser: { id: number };
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUser }) => {
  const isCurrentUser = currentUser.id === message.sender_id;

  return (
    <div className={`flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 rounded-2xl ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageItem;