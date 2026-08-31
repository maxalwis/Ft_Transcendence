import { useEffect } from 'react';
import { useSocket } from '../../../context/socket/SocketContext';
import type { Message } from '../components/Chat';

export function useChatSocket(eventId: string, onNewMessage: (msg: Message) => void) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('event:join', eventId);
    socket.on('message:new', onNewMessage);

    return () => {
      socket.emit('event:leave', eventId);
      socket.off('message:new', onNewMessage);
    };
  }, [socket, isConnected, eventId, onNewMessage]);
}
