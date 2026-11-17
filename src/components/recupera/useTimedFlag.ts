import { useState, useRef, useEffect, useCallback } from 'react';

export function useTimedFlag(duracaoMs = 3000): [boolean, () => void, () => void] {
  const [ativo, setAtivo] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const limpar = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAtivo(false);
  }, []);

  const disparar = useCallback(() => {
    setAtivo(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setAtivo(false), duracaoMs);
  }, [duracaoMs]);

  return [ativo, disparar, limpar];
}

export function useTimedValue<T>(duracaoMs = 4000): [T | null, (val: T | null, customMs?: number) => void] {
  const [valor, setValor] = useState<T | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const definir = useCallback(
    (val: T | null, customMs?: number) => {
      setValor(val);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (val !== null) {
        timerRef.current = window.setTimeout(() => setValor(null), customMs ?? duracaoMs);
      }
    },
    [duracaoMs]
  );

  return [valor, definir];
}
