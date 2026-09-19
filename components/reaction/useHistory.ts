import { useCallback, useRef, useState } from 'react';

/** Small undo/redo store. `set` records history, `patch` updates without recording (for live drags). */
export function useHistory<T>(initial: T, limit = 60) {
  const [state, setState] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const current = useRef<T>(initial);
  const dragBase = useRef<T | null>(null);
  const [, bump] = useState(0);

  const commit = useCallback(
    (next: T | ((prev: T) => T)) => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(current.current) : next;
      if (value === current.current) return;
      past.current.push(current.current);
      if (past.current.length > limit) past.current.shift();
      future.current = [];
      current.current = value;
      setState(value);
    },
    [limit],
  );

  /** Live update; call `endDrag` afterwards to store a single history entry. */
  const patch = useCallback((next: T | ((prev: T) => T)) => {
    if (dragBase.current === null) dragBase.current = current.current;
    const value = typeof next === 'function' ? (next as (p: T) => T)(current.current) : next;
    current.current = value;
    setState(value);
  }, []);

  const endDrag = useCallback(() => {
    if (dragBase.current === null) return;
    if (dragBase.current !== current.current) {
      past.current.push(dragBase.current);
      if (past.current.length > limit) past.current.shift();
      future.current = [];
    }
    dragBase.current = null;
    bump((n) => n + 1);
  }, [limit]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(current.current);
    current.current = prev;
    setState(prev);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(current.current);
    current.current = next;
    setState(next);
  }, []);

  return {
    state,
    get: () => current.current,
    commit,
    patch,
    endDrag,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
