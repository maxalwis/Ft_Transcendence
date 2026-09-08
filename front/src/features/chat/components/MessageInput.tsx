import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../Chat.module.css';

type MessageInputProps = {
  onSend: (text: string) => void;
  maxHeight?: number;
};

export default function MessageInput({ onSend, maxHeight = 160 }: MessageInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (!input) {
        // Reset directly to base height when input is completely empty
        textarea.style.height = '38px';
        textarea.style.overflowY = 'hidden';
        return;
      }

      // Calculate expanded scrollHeight accurately
      textarea.style.height = '0px';
      const scrollHeight = textarea.scrollHeight;

      if (maxHeight) {
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [input, maxHeight]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');

    // Explicitly collapse height immediately on submit
    if (textareaRef.current) {
      textareaRef.current.style.height = '38px';
      textareaRef.current.style.overflowY = 'hidden';
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <div className={styles.container}>
      <textarea
        ref={textareaRef}
        rows={1}
        className="chat-message-input glass-panel w-full resize-none rounded-3xl py-2 pl-4 pr-12 text-sm outline-none border border-gray-700/50 focus:border-gray-500 transition-all shadow-sm leading-relaxed overflow-y-auto text-white"
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
      <div className={`${styles.buttonWrapper} ${!hasText ? styles.hidden : ''}`}>
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className={`${styles.sendIcon} rtl-flip`}
            aria-hidden="true"
          >
            <path d="M476.59,227.05l-.16-.07L49.35,49.84A23.56,23.56,0,0,0,27.14,52,24.65,24.65,0,0,0,16,72.59V185.88a24,24,0,0,0,19.52,23.57l232.93,43.07a4,4,0,0,1,0,7.86L35.53,303.45A24,24,0,0,0,16,327V440.31A23.57,23.57,0,0,0,26.59,460a23.94,23.94,0,0,0,13.22,4,24.55,24.55,0,0,0,9.52-1.93L476.4,285.94l.19-.09a32,32,0,0,0,0-58.8Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
