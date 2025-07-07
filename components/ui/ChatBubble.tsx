import React from "react";

interface ChatBubbleProps {
  message: {
    scheme_name: string;
    description: string;
    apply_link?: string;
  };
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  return (
    <div className="max-w-xs sm:max-w-md md:max-w-lg mx-auto my-3 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-green-100 dark:border-green-800 flex flex-col items-center text-center">
      <div className="font-semibold text-lg text-green-700 dark:text-green-300 mb-1">
        {message.scheme_name}
      </div>
      <div className="text-gray-700 dark:text-gray-200 text-sm mb-3">
        {message.description}
      </div>
      {message.apply_link && (
        <a
          href={message.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2 inline-block transition"
        >
          Apply Now
        </a>
      )}
    </div>
  );
};

export default ChatBubble;
