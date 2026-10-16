import { useState, useCallback } from 'react';

export interface GeolocationState {
  coords: { latitude: number; longitude: number } | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: false,
    error: null,
  });

  const getPosition = useCallback((options?: PositionOptions) => {
    if (!navigator.geolocation) {
      setState({
        coords: null,
        loading: false,
        error: 'Geolocalização não é suportada pelo seu navegador.',
      });
      return Promise.reject('Not supported');
    }

    setState((prev: GeolocationState) => ({ ...prev, loading: true, error: null }));

    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState({
            coords,
            loading: false,
            error: null,
          });
          resolve(coords);
        },
        (error) => {
          let errorMsg = 'Falha ao obter localização.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Permissão de geolocalização negada pelo usuário.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Informações de localização indisponíveis.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Tempo limite esgotado ao obter localização.';
              break;
          }
          setState({
            coords: null,
            loading: false,
            error: errorMsg,
          });
          reject(errorMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
          ...options,
        }
      );
    });
  }, []);

  return { ...state, getPosition };
}
