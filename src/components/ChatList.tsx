import React from 'react';
import { Chat } from '../screens/Home';
import ChatItem from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat }) => {
  return (
    <div className="flex-1">
      <div className="flex flex-col gap-2 p-6 overflow-y-auto">
        {chats.map((chat, index) => (
       <div key={index} onClick={() => onSelectChat(chat)}>
        <ChatItem chat={chat} onSelect={onSelectChat}/>
       </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;