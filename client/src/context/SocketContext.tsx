import React, { createContext, useContext, useEffect, useState } from 'react';
import { PokeEvent } from '../types';
import { useSound } from './SoundContext';
import { useAuth } from './AuthContext';

interface SocketContextType {
  isConnected: boolean;
  activePoke: PokeEvent | null;
  dismissPoke: () => void;
  sendLovePoke: (targetId: string, pokeType: 'kiss' | 'hug' | 'poke' | 'miss_you', message?: string) => Promise<void>;
  lastEvent: { type: string; payload: any } | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [activePoke, setActivePoke] = useState<PokeEvent | null>(null);
  const [lastEvent, setLastEvent] = useState<{ type: string; payload: any } | null>(null);

  const { playPokeSound } = useSound();
  const { currentPartner, refreshPartners } = useAuth();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastEvent(data);

            if (data.type === 'LOVE_POKE') {
              const poke = data.payload as PokeEvent;
              // If target is current user or viewing couple screen
              if (!currentPartner || poke.targetPartnerId === currentPartner.id) {
                setActivePoke(poke);
                playPokeSound(poke.pokeType);
              }
            } else if (data.type === 'PARTNER_UPDATED') {
              refreshPartners();
            }
          } catch (e) {
            console.error('WebSocket parse error:', e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        console.warn('Socket connect failed, will retry:', err);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [currentPartner, playPokeSound, refreshPartners]);

  const dismissPoke = () => {
    setActivePoke(null);
  };

  const sendLovePoke = async (targetId: string, pokeType: 'kiss' | 'hug' | 'poke' | 'miss_you', message?: string) => {
    if (!currentPartner) return;
    try {
      await fetch(`/api/partners/${targetId}/poke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentPartner.id,
          pokeType,
          message
        })
      });
      playPokeSound(pokeType);
    } catch (e) {
      console.error('Failed to send poke:', e);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        activePoke,
        dismissPoke,
        sendLovePoke,
        lastEvent
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
