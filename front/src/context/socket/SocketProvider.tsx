import { useEffect, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../auth/useAuth';
import { SocketContext } from './SocketContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? window.location.origin;

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const userId = user?.id;

  const socketRef = useRef<Socket | null>(null);
  const accessTokenRef = useRef(accessToken);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    accessTokenRef.current = accessToken;

    if (socketRef.current && accessToken) {
      socketRef.current.auth = {
        token: accessToken,
      };
    }
  }, [accessToken]);

  useEffect(() => {
    if (!userId || !accessTokenRef.current) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: accessTokenRef.current,
      },
      withCredentials: true,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
}
