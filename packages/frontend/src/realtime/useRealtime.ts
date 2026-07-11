import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from 'react';
import { getRealtimeManager } from './index.js';
import type { Channel, ConnectionState, ConnectionStatus, RealtimeEvent } from './types.js';
export function useRealtimeConnection(): ConnectionState {
  const [state, setState] = useState<ConnectionState>(() => getRealtimeManager().getState());
  useEffect(() => {
    const dispose = getRealtimeManager().onConnectionState(setState);
    return dispose;
  }, []);
  return state;
}
export function useConnectionStatus(): ConnectionStatus {
  const statusRef = useRef<ConnectionStatus>(getRealtimeManager().getState().status);
  const subscribe = useCallback((callback: () => void) => {
    const dispose = getRealtimeManager().onStatusChange((status) => {
      statusRef.current = status;
      callback();
    });
    return dispose;
  }, []);
  const getSnapshot = useCallback(() => statusRef.current, []);
  const getServerSnapshot = useCallback(() => statusRef.current, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
export function useIsConnected(): boolean {
  return useConnectionStatus() === 'connected';
}
export function useChannel(
  channel: Channel,
  types?: string[],
  onEvent?: (data: unknown, event: RealtimeEvent) => void,
): { lastEvent: RealtimeEvent | null; isSubscribed: boolean } {
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  useEffect(() => {
    const rt = getRealtimeManager();
    const dispose = rt.subscribe(channel, (event) => {
      setLastEvent(event);
      if (onEvent) {
        onEvent(event.payload, event);
      }
    }, types);
    return dispose;
  }, [channel, types, onEvent]);
  return { lastEvent, isSubscribed: true };
}
export function useRealtimeEvent(
  eventType: string,
  handler: (event: RealtimeEvent) => void,
  deps: unknown[] = [],
): void {
  const stableHandler = useCallback(handler, deps);
  useEffect(() => {
    return getRealtimeManager().onEvent(eventType, stableHandler);
  }, [eventType, stableHandler]);
}
const autoConnectState = { connected: false };
export function useRealtimeAutoConnect(shouldConnect = true): void {
  useEffect(() => {
    if (!shouldConnect || autoConnectState.connected) return;
    autoConnectState.connected = true;
    getRealtimeManager().connect();
    return () => {
      autoConnectState.connected = false;
    };
  }, [shouldConnect]);
}
