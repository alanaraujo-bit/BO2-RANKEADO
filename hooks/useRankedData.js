import { useEffect, useState, useCallback } from 'react';

// Hook que fornece uma camada de acesso a RankedData/localStorage
export default function useRankedData(pollInterval = 3000) {
  const readRaw = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.RankedData) {
        try { window.RankedData.loadFromStorage && window.RankedData.loadFromStorage(); } catch (e) {}
        return {
          currentUser: window.RankedData.currentUser,
          players: window.RankedData.players,
          matches: window.RankedData.matches,
          pendingConfirmations: window.RankedData.pendingConfirmations,
          currentSeason: window.RankedData.currentSeason
        };
      }
      const raw = typeof window !== 'undefined' ? localStorage.getItem('bo2ranked') : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('useRankedData: error reading', e);
      return null;
    }
  }, []);

  const saveRaw = useCallback((newData) => {
    try {
      if (typeof window !== 'undefined' && window.RankedData) {
        try {
          window.RankedData.players = newData.players || window.RankedData.players || {};
          window.RankedData.matches = newData.matches || window.RankedData.matches || [];
          window.RankedData.pendingConfirmations = newData.pendingConfirmations || window.RankedData.pendingConfirmations || [];
          window.RankedData.currentUser = newData.currentUser || window.RankedData.currentUser;
          window.RankedData.currentSeason = newData.currentSeason || window.RankedData.currentSeason;
          window.RankedData.save && window.RankedData.save();
          // notify
          typeof window !== 'undefined' && window.dispatchEvent && window.dispatchEvent(new CustomEvent('rankeddata:change'));
          return true;
        } catch (e) {
          console.warn('useRankedData: failed saving via RankedData, falling back', e);
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('bo2ranked', JSON.stringify(newData));
        typeof window !== 'undefined' && window.dispatchEvent && window.dispatchEvent(new CustomEvent('rankeddata:change'));
        return true;
      }
      return false;
    } catch (e) {
      console.error('useRankedData: error saving', e);
      return false;
    }
  }, []);

  const getPlayer = useCallback((username) => {
    try {
      if (typeof window !== 'undefined' && window.RankedData && window.RankedData.getPlayer) return window.RankedData.getPlayer(username);
      const raw = readRaw();
      return raw && raw.players ? raw.players[username] : null;
    } catch (e) {
      console.error('useRankedData: getPlayer error', e);
      return null;
    }
  }, [readRaw]);

  const updatePlayer = useCallback((username, updates) => {
    try {
      if (typeof window !== 'undefined' && window.RankedData && window.RankedData.updatePlayer) {
        const ok = window.RankedData.updatePlayer(username, updates);
        window.RankedData.save && window.RankedData.save();
        typeof window !== 'undefined' && window.dispatchEvent && window.dispatchEvent(new CustomEvent('rankeddata:change'));
        return ok;
      }
      const raw = readRaw() || {};
      raw.players = raw.players || {};
      raw.players[username] = { ...(raw.players[username] || {}), ...(updates || {}) };
      saveRaw(raw);
      return true;
    } catch (e) {
      console.error('useRankedData: updatePlayer error', e);
      return false;
    }
  }, [readRaw, saveRaw]);

  const confirmMatch = useCallback((matchId) => {
    try {
      if (typeof window !== 'undefined' && window.RankedData && typeof window.RankedData.confirmMatch === 'function') {
        return window.RankedData.confirmMatch(matchId);
      }
      const raw = readRaw();
      if (!raw) return false;
      raw.pendingConfirmations = (raw.pendingConfirmations || []).filter(pc => (pc.matchId || pc.match?.id) !== matchId);
      if (Array.isArray(raw.matches)) {
        const mi = raw.matches.findIndex(m => m.id === matchId || m.matchId === matchId);
        if (mi !== -1) raw.matches[mi].confirmed = true;
      }
      saveRaw(raw);
      return true;
    } catch (e) {
      console.error('useRankedData: confirmMatch error', e);
      return false;
    }
  }, [readRaw, saveRaw]);

  const read = useCallback(() => readRaw(), [readRaw]);

  const save = useCallback((d) => saveRaw(d), [saveRaw]);

  // reactive state
  const [state, setState] = useState(() => readRaw());

  useEffect(() => {
    const refresh = () => setState(readRaw());
    refresh();
    const id = setInterval(refresh, pollInterval);
    const onChange = () => refresh();
    if (typeof window !== 'undefined') window.addEventListener('rankeddata:change', onChange);
    return () => {
      clearInterval(id);
      if (typeof window !== 'undefined') window.removeEventListener('rankeddata:change', onChange);
    };
  }, [pollInterval, readRaw]);

  return {
    state,
    read,
    save,
    getPlayer,
    updatePlayer,
    confirmMatch,
    subscribe: (cb) => {
      if (typeof window === 'undefined') return () => {};
      const listener = () => cb(readRaw());
      window.addEventListener('rankeddata:change', listener);
      return () => window.removeEventListener('rankeddata:change', listener);
    }
  };
}
