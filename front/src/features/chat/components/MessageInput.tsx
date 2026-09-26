import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../Chat.module.css';
import Button from '../../../components/ui/Button';
import { SendIcon } from '../../../types/icons';

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
        className={`${styles.input} chat-message-input glass-panel w-full resize-none rounded-3xl py-2 pl-4 pr-12 text-sm outline-none border border-gray-700/50 focus:border-gray-500 transition-all shadow-sm leading-relaxed overflow-y-auto text-white`}
        placeholder={t('chat.placeholder')}
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
        <Button
          variant="icon"
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          aria-label="Send message"
        >
          <SendIcon className={`${styles.sendIcon} rtl-flip`} />
        </Button>
      </div>
    </div>
  );
}
