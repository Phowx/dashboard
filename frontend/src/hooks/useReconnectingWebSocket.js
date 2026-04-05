import { useEffect, useRef, useState } from 'react';

function getWebSocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

export function useReconnectingWebSocket({ onMessage, reconnectDelay = 2000 } = {}) {
  const [status, setStatus] = useState('disconnected');
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let socket = null;
    let reconnectTimer = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) {
        return;
      }

      setStatus('connecting');
      socket = new WebSocket(getWebSocketUrl());

      socket.onopen = () => {
        if (!isDisposed) {
          setStatus('connected');
        }
      };

      socket.onmessage = (event) => {
        onMessageRef.current?.(event);
      };

      socket.onclose = () => {
        if (isDisposed) {
          return;
        }

        setStatus('disconnected');
        reconnectTimer = window.setTimeout(connect, reconnectDelay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      isDisposed = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [reconnectDelay]);

  return status;
}
