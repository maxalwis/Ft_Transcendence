import { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="relative flex w-full items-end">
      <textarea
        ref={textareaRef}
        rows={1}
        className="glass-panel w-full resize-none rounded-3xl py-2 pl-4 pr-12 text-sm outline-none border border-gray-700/50 focus:border-gray-500 transition-all shadow-sm leading-relaxed overflow-y-auto text-white"
        placeholder="Type a message..."
        maxLength={150}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      {input.trim().length > 0 && (
        <button
          type="button"
          className="absolute right-2 bottom-2 flex w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs"
          onClick={handleSend}
        >
          ➤
        </button>
      )}
    </div>
  );
}
