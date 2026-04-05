import React, { createContext, useContext, useState } from 'react';
import { useReconnectingWebSocket } from '../hooks/useReconnectingWebSocket';

const LiveMetricsContext = createContext({
  liveMetrics: null,
  wsStatus: 'disconnected',
});

export function LiveMetricsProvider({ children }) {
  const [liveMetrics, setLiveMetrics] = useState(null);

  const wsStatus = useReconnectingWebSocket({
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'metrics' && message.data) {
          setLiveMetrics(message.data);
        }
      } catch (error) {
        console.error('Error parsing live metrics message:', error);
      }
    },
  });

  return (
    <LiveMetricsContext.Provider value={{ liveMetrics, wsStatus }}>
      {children}
    </LiveMetricsContext.Provider>
  );
}

export function useLiveMetrics() {
  return useContext(LiveMetricsContext);
}
