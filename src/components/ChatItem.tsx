import React from 'react';
import { Chat } from '../screens/Home';

interface ChatItemProps {
  chat: Chat;
  onSelect: (chat: Chat) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onSelect }) => {
  const handleClick = () => {
    onSelect(chat);
  };

  return (
    <div
      className="p-4 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-gray-100"
      onClick={handleClick}
    >
      <div className="flex px-4">
        <div className="mr-4 overflow-hidden rounded-full w-10 h-10">
      <img src={chat.jobfinder_profile_image} alt="Profile" width='100%' />
      </div>
      <div>
        <p className="text-lg font-semibold">{chat.jobfinder_name?? "unknown"}</p>
        {chat.last_message !==""&& (
          <p className="text-sm text-gray-500">{chat.last_message}</p>
        )}
        <p className="text-xs text-gray-400">
          {chat.last_message_timestamp.toDate().toLocaleString()}
        </p>
      </div>
      </div>
   
    </div>
  );
};

export default ChatItem;