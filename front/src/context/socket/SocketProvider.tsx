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
  // Vrai quand le serveur a coupé le socket parce que l'access token a expiré :
  // il faut se reconnecter dès qu'on a un token rafraîchi.
  const sessionExpiredRef = useRef(false);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    accessTokenRef.current = accessToken;

    if (socketRef.current && accessToken) {
      socketRef.current.auth = {
        token: accessToken,
      };

      if (sessionExpiredRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
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
      sessionExpiredRef.current = false;
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Le serveur coupe le socket à l'expiration de l'access token. Le front
    // le rafraîchit 1 min avant : on se reconnecte donc avec le token à jour.
    // Si le refresh n'a pas encore eu lieu (onglet en veille), la reconnexion
    // échoue et l'effet sur accessToken la relancera au prochain refresh.
    newSocket.on('session:expired', () => {
      sessionExpiredRef.current = true;
      newSocket.once('disconnect', () => newSocket.connect());
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
