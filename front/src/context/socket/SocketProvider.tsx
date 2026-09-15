import { useEffect, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../auth/useAuth';
import { SocketContext } from './SocketContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? window.location.origin;

export function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setSocket(null);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
}
