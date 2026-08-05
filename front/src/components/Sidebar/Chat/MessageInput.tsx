import { useState, useRef, useEffect } from "react";

type Message = {
	id: number;
	user: string;
	text: string;
};

type MessageInputProps = {
	messages: Message[];
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export default function MessageInput({ messages, setMessages }: MessageInputProps) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize the textarea based on its content height
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // Reset height to recalculate
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max height of ~120px (~5 lines)
        }
    }, [input]);

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: prevMessages.length + 1,
                text: input.trim(),
                user: "Me",
            },
        ]);
        setInput("");

        // Reset textarea height manually after clearing
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasText = input.trim().length > 0;

    return (
        <div className="relative flex w-full items-end">
            <textarea
                ref={textareaRef}
                rows={1}
                className="glassmorphism-element w-full resize-none rounded-3xl py-2 pl-4 pr-12 text-sm outline-none border border-gray-700/50 focus:border-gray-500 transition-all shadow-sm leading-relaxed overflow-y-auto"
                placeholder="Type a message..."
                maxLength={150}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            
            {hasText && (
                <button
                    type="button"
                    className="absolute right-2 bottom-2 flex w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs"
                    onClick={handleSend}
                    aria-label="Send message"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-4 h-4 translate-x-px"
                    >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.93.75.75 0 0 0 0-1.214A60.519 60.519 0 0 0 3.478 2.404Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}
