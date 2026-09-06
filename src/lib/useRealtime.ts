'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from './store';
import { API_BASE_URL } from './api';
import type { InAppNotification } from '../types';

export function useRealtime() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('helpdesk_token');
    if (!token) return;

    let isSubscribed = true;

    function connect() {
      if (!isSubscribed) return;

      const currentToken = localStorage.getItem('helpdesk_token');
      if (!currentToken) return;

      const streamUrl = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(currentToken)}`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        // SSE handshake verified
      });

      es.addEventListener('notification', (event) => {
        try {
          const data: InAppNotification = JSON.parse(event.data);
          // Show live toast notification
          toast(data.title, {
            description: data.message,
          });

          // Invalidate notification queries so bell counter and popover update live
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } catch (err) {
          console.error('[Realtime] Failed to parse notification:', err);
        }
      });

      es.addEventListener('ticket_created', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (user?.role === 'admin') {
            toast.info(`New Ticket #${data.ticketId}`, {
              description: data.title,
            });
          }
          // Invalidate ticket list and analytics cache
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        } catch (err) {
          console.error('[Realtime] Failed to parse ticket_created event:', err);
        }
      });

      es.addEventListener('ticket_updated', (event) => {
        try {
          const data = JSON.parse(event.data);
          // Invalidate ticket list, specific ticket detail, and analytics cache in real time
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
          queryClient.invalidateQueries({ queryKey: ['ticket', data.id] });
          if (data.ticketId) {
            queryClient.invalidateQueries({ queryKey: ['ticket', data.ticketId] });
          }
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        } catch (err) {
          console.error('[Realtime] Failed to parse ticket_updated event:', err);
        }
      });

      es.addEventListener('ticket_deleted', () => {
        try {
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        } catch (err) {
          console.error('[Realtime] Failed to parse ticket_deleted event:', err);
        }
      });

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        if (isSubscribed) {
          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };
    }

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, queryClient]);
}
