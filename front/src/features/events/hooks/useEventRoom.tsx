import { useEffect } from 'react';
import { useSocket } from '../../../context/socket/SocketContext';

export function useEventRoom(eventId: string) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.emit('event:join', eventId);
    return () => { socket.emit('event:leave', eventId); };
  }, [socket, isConnected, eventId]);
}
