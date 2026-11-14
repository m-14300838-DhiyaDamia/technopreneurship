import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { tokenStore, API_BASE, runtime } from '../api/client.js';

/**
 * Authenticated Socket.IO connection that follows the login token.
 * In the Apps Script edition there is no realtime server: the hook returns a
 * null socket and `connected: false`, and screens fall back to polling.
 */
export function useSocket(enabled = true) {
  const ref = useRef(null);
  const [connected, setConnected] = useState(false);
  const realtime = runtime.mode !== 'apps-script';
  useEffect(() => {
    if (!enabled || !realtime) return undefined;
    const socket = io(API_BASE || undefined, { auth: { token: tokenStore.get() }, transports: ['websocket', 'polling'], reconnectionDelayMax: 10000 });
    ref.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    return () => { socket.disconnect(); ref.current = null; };
  }, [enabled, realtime]);
  return { socketRef: ref, connected, realtime };
}
