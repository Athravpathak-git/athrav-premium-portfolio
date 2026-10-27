'use client';

import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT_MS = 300 * 1000; // 5 minutes (300 seconds)
const HEARTBEAT_THROTTLE_MS = 30 * 1000; // 30 seconds
const STORAGE_SYNC_THROTTLE_MS = 1000; // 1 second
const CHECK_INTERVAL_MS = 1000; // 1 second

const STORAGE_KEY_LAST_ACTIVITY = 'athrav_admin_last_activity';
const STORAGE_KEY_LOGOUT_EVENT = 'athrav_admin_logout_event';
const CHANNEL_NAME = 'athrav_admin_inactivity_channel';

export function AdminInactivityTimer() {
  const lastActivityRef = useRef<number>(Date.now());
  const lastHeartbeatRef = useRef<number>(Date.now());
  const lastStorageSyncRef = useRef<number>(Date.now());
  const isLoggingOutRef = useRef<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastHeartbeatRef.current = now;
    lastStorageSyncRef.current = now;

    try {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, String(now));
    } catch {
      // Ignore localStorage access restrictions
    }

    // Initialize BroadcastChannel for cross-tab synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.onmessage = (event) => {
          if (!event?.data) return;
          if (event.data.type === 'ACTIVITY') {
            const timestamp = Number(event.data.timestamp);
            if (timestamp && timestamp > lastActivityRef.current) {
              lastActivityRef.current = timestamp;
            }
          } else if (event.data.type === 'LOGOUT') {
            handleRemoteLogout(event.data.reason || 'inactivity');
          }
        };
        channelRef.current = bc;
      } catch {
        // Fallback to storage event
      }
    }

    // Centralized logout handler
    const performLogout = async (reason = 'inactivity') => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;

      // Broadcast to other open admin tabs
      try {
        channelRef.current?.postMessage({ type: 'LOGOUT', reason });
      } catch {}

      try {
        localStorage.setItem(
          STORAGE_KEY_LOGOUT_EVENT,
          JSON.stringify({ reason, timestamp: Date.now() })
        );
      } catch {}

      try {
        localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
      } catch {}

      // Invalidate server session and clear cookies
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // Continue redirect even if network request fails
      }

      window.location.href = `/admin/login?reason=${reason}`;
    };

    // Handler when another tab signals a logout
    const handleRemoteLogout = (reason = 'inactivity') => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      try {
        localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
      } catch {}
      window.location.href = `/admin/login?reason=${reason}`;
    };

    // Heartbeat to refresh server-side sliding session
    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/auth/heartbeat', { method: 'POST' });
        if (!res.ok && res.status === 401) {
          // Server rejected session (already expired server-side)
          performLogout('inactivity');
        }
      } catch {
        // Network failure, will retry on next user activity
      }
    };

    // Activity event listener for meaningful user actions:
    // Clicks, keyboard input, scrolling, touch interactions, pointer events
    const onActivity = () => {
      if (isLoggingOutRef.current) return;
      const currentNow = Date.now();
      lastActivityRef.current = currentNow;

      // Sync across tabs via localStorage and BroadcastChannel (throttled)
      if (currentNow - lastStorageSyncRef.current >= STORAGE_SYNC_THROTTLE_MS) {
        lastStorageSyncRef.current = currentNow;
        try {
          localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, String(currentNow));
        } catch {}
        try {
          channelRef.current?.postMessage({ type: 'ACTIVITY', timestamp: currentNow });
        } catch {}
      }

      // Send rolling heartbeat to server (throttled to every 30s)
      if (currentNow - lastHeartbeatRef.current >= HEARTBEAT_THROTTLE_MS) {
        lastHeartbeatRef.current = currentNow;
        sendHeartbeat();
      }
    };

    // Storage event listener for multi-tab activity sync
    const onStorage = (e: StorageEvent) => {
      if (isLoggingOutRef.current) return;
      if (e.key === STORAGE_KEY_LAST_ACTIVITY && e.newValue) {
        const remoteTime = Number(e.newValue);
        if (remoteTime && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
        }
      } else if (e.key === STORAGE_KEY_LOGOUT_EVENT && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          handleRemoteLogout(payload.reason || 'inactivity');
        } catch {
          handleRemoteLogout('inactivity');
        }
      }
    };

    // Check if inactivity timeout (300 seconds) has been reached
    const checkTimeout = () => {
      if (isLoggingOutRef.current) return;
      const currentNow = Date.now();
      let storedTime = 0;
      try {
        storedTime = Number(localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY)) || 0;
      } catch {}

      const effectiveLastActivity = Math.max(lastActivityRef.current, storedTime);
      const idleTime = currentNow - effectiveLastActivity;

      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        performLogout('inactivity');
      }
    };

    // Check immediately on tab focus or wake-from-sleep
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTimeout();
      }
    };

    // Meaningful user activity events
    const interactionEvents = [
      'mousedown',
      'pointerdown',
      'keydown',
      'scroll',
      'touchstart',
      'wheel',
      'click',
    ] as const;

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, onActivity, { passive: true, capture: true });
    });

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', checkTimeout);
    document.addEventListener('visibilitychange', onVisibilityChange);

    const intervalId = setInterval(checkTimeout, CHECK_INTERVAL_MS);

    // Initial heartbeat to align server-side sliding window upon mount
    sendHeartbeat();

    return () => {
      clearInterval(intervalId);
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, onActivity, { capture: true });
      });
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', checkTimeout);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      try {
        channelRef.current?.close();
      } catch {}
    };
  }, []);

  return null;
}
