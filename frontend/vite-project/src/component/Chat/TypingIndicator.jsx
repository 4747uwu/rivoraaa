// Add this component at the bottom of your file
const TypingIndicator = ({ users }) => {
  if (Object.keys(users).length === 0) return null;
  
  // Get the usernames of people typing
  const typingUsernames = Object.values(users).map(u => u.username);
  
  // Limit to showing max 2 users typing
  const displayNames = typingUsernames.slice(0, 2);
  const text = displayNames.length === 1 
    ? `${displayNames[0]} is typing...` 
    : displayNames.length === 2 
      ? `${displayNames[0]} and ${displayNames[1]} are typing...` 
      : `${displayNames[0]}, ${displayNames[1]} and ${typingUsernames.length - 2} others are typing...`;
      
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 ml-12">
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{text}</span>
    </div>
  );
};

export default TypingIndicator;