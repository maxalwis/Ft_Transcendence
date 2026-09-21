import { useEffect } from 'react';
import { useSocket } from '../../../context/socket/useSocket';
import type { Message } from '../components/Chat';

export function useChatSocket(onNewMessage: (msg: Message) => void) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on('message:new', onNewMessage);
    return () => {
      socket.off('message:new', onNewMessage);
    };
  }, [socket, isConnected, onNewMessage]);
}
