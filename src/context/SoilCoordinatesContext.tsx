// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SoilSample } from '../types/agronomy';
import { SoilSamplingPoint, PlotBoundary } from '../types/soilSampling';

export interface SoilCoordinatesContextType {
  pointsMap: Record<string, SoilSamplingPoint[]>;
  boundariesMap: Record<string, Record<string, PlotBoundary>>;
  getPointsForFarm: (farmId: string) => SoilSamplingPoint[];
  getBoundariesForFarm: (farmId: string) => Record<string, PlotBoundary>;
  savePointsForFarm: (farmId: string, updatedPoints: SoilSamplingPoint[]) => void;
  saveBoundariesForFarm: (farmId: string, updatedBoundaries: Record<string, PlotBoundary>) => void;
  updatePointCoordinates: (farmId: string, pointIdOrCode: string, lat: number, lng: number) => void;
  addOrUpdatePoint: (farmId: string, pointData: Partial<SoilSamplingPoint> & { lat: number; lng: number }) => SoilSamplingPoint;
  deletePoint: (farmId: string, pointId: string) => void;
  syncSamplesWithCoordinates: (samples: SoilSample[], farmId: string) => SoilSample[];
  notifyCoordinatesChanged: () => void;
}

const SoilCoordinatesContext = createContext<SoilCoordinatesContextType | undefined>(undefined);

export const SoilCoordinatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pointsMap, setPointsMap] = useState<Record<string, SoilSamplingPoint[]>>({});
  const [boundariesMap, setBoundariesMap] = useState<Record<string, Record<string, PlotBoundary>>>({});
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(Date.now());

  // Function to load farm data from localStorage
  const loadFarmDataFromStorage = useCallback((farmId: string) => {
    if (!farmId) return;
    try {
      const savedPoints = localStorage.getItem(`geaagro_soil_sampling_points_${farmId}`);
      if (savedPoints) {
        const parsedPoints: SoilSamplingPoint[] = JSON.parse(savedPoints);
        setPointsMap(prev => ({ ...prev, [farmId]: parsedPoints }));
      }
      const savedBoundaries = localStorage.getItem(`geaagro_plot_boundaries_${farmId}`);
      if (savedBoundaries) {
        const parsedBoundaries = JSON.parse(savedBoundaries);
        setBoundariesMap(prev => ({ ...prev, [farmId]: parsedBoundaries }));
      }
    } catch (e) {
      console.warn('Error reading soil points/boundaries from storage:', e);
    }
  }, []);

  // Listen to custom window events and storage events for reactive updates
  useEffect(() => {
    const handlePointsUpdated = (e: CustomEvent) => {
      const { farmId, points } = e.detail || {};
      if (farmId && points) {
        setPointsMap(prev => ({ ...prev, [farmId]: points }));
        setLastSyncTimestamp(Date.now());
      }
    };

    const handleBoundariesUpdated = (e: CustomEvent) => {
      const { farmId, boundaries } = e.detail || {};
      if (farmId && boundaries) {
        setBoundariesMap(prev => ({ ...prev, [farmId]: boundaries }));
        setLastSyncTimestamp(Date.now());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('geaagro_soil_sampling_points_')) {
        const farmId = e.key.replace('geaagro_soil_sampling_points_', '');
        loadFarmDataFromStorage(farmId);
        setLastSyncTimestamp(Date.now());
      } else if (e.key && e.key.startsWith('geaagro_plot_boundaries_')) {
        const farmId = e.key.replace('geaagro_plot_boundaries_', '');
        loadFarmDataFromStorage(farmId);
        setLastSyncTimestamp(Date.now());
      }
    };

    window.addEventListener('geaagro_soil_points_updated', handlePointsUpdated as EventListener);
    window.addEventListener('geaagro_plot_boundaries_updated', handleBoundariesUpdated as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('geaagro_soil_points_updated', handlePointsUpdated as EventListener);
      window.removeEventListener('geaagro_plot_boundaries_updated', handleBoundariesUpdated as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadFarmDataFromStorage]);

  const getPointsForFarm = useCallback((farmId: string): SoilSamplingPoint[] => {
    if (!farmId) return [];
    if (pointsMap[farmId]) return pointsMap[farmId];
    try {
      const saved = localStorage.getItem(`geaagro_soil_sampling_points_${farmId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPointsMap(prev => ({ ...prev, [farmId]: parsed }));
        return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  }, [pointsMap]);

  const getBoundariesForFarm = useCallback((farmId: string): Record<string, PlotBoundary> => {
    if (!farmId) return {};
    if (boundariesMap[farmId]) return boundariesMap[farmId];
    try {
      const saved = localStorage.getItem(`geaagro_plot_boundaries_${farmId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setBoundariesMap(prev => ({ ...prev, [farmId]: parsed }));
        return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return {};
  }, [boundariesMap]);

  const savePointsForFarm = useCallback((farmId: string, updatedPoints: SoilSamplingPoint[]) => {
    if (!farmId) return;
    setPointsMap(prev => ({ ...prev, [farmId]: updatedPoints }));
    try {
      localStorage.setItem(`geaagro_soil_sampling_points_${farmId}`, JSON.stringify(updatedPoints));
      window.dispatchEvent(new CustomEvent('geaagro_soil_points_updated', {
        detail: { farmId, points: updatedPoints }
      }));
    } catch (e) {
      console.error('Error saving points to localStorage:', e);
    }
    setLastSyncTimestamp(Date.now());
  }, []);

  const saveBoundariesForFarm = useCallback((farmId: string, updatedBoundaries: Record<string, PlotBoundary>) => {
    if (!farmId) return;
    setBoundariesMap(prev => ({ ...prev, [farmId]: updatedBoundaries }));
    try {
      localStorage.setItem(`geaagro_plot_boundaries_${farmId}`, JSON.stringify(updatedBoundaries));
      window.dispatchEvent(new CustomEvent('geaagro_plot_boundaries_updated', {
        detail: { farmId, boundaries: updatedBoundaries }
      }));
    } catch (e) {
      console.error('Error saving boundaries to localStorage:', e);
    }
    setLastSyncTimestamp(Date.now());
  }, []);

  const updatePointCoordinates = useCallback((farmId: string, pointIdOrCode: string, lat: number, lng: number) => {
    if (!farmId || !pointIdOrCode) return;
    const currentPoints = getPointsForFarm(farmId);
    let updated = false;

    const newPoints = currentPoints.map(pt => {
      const matchId = pt.id === pointIdOrCode;
      const matchCode = pt.code?.toLowerCase() === pointIdOrCode.toLowerCase() ||
        pt.linkedSampleCode?.toLowerCase() === pointIdOrCode.toLowerCase();
      
      if (matchId || matchCode) {
        updated = true;
        return { ...pt, lat, lng };
      }
      return pt;
    });

    if (updated) {
      savePointsForFarm(farmId, newPoints);
    }
  }, [getPointsForFarm, savePointsForFarm]);

  const addOrUpdatePoint = useCallback((farmId: string, pointData: Partial<SoilSamplingPoint> & { lat: number; lng: number }): SoilSamplingPoint => {
    const currentPoints = getPointsForFarm(farmId);
    const existingIndex = currentPoints.findIndex(p => p.id === pointData.id || (pointData.code && p.code === pointData.code));

    let finalPoint: SoilSamplingPoint;
    let newPoints: SoilSamplingPoint[];

    if (existingIndex >= 0) {
      finalPoint = {
        ...currentPoints[existingIndex],
        ...pointData,
        lat: pointData.lat,
        lng: pointData.lng,
      };
      newPoints = [...currentPoints];
      newPoints[existingIndex] = finalPoint;
    } else {
      const pointNum = currentPoints.length + 1;
      finalPoint = {
        id: pointData.id || `point-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        farmId,
        plotId: pointData.plotId || 'plot-1',
        pointNumber: pointData.pointNumber || pointNum,
        code: pointData.code || `P-${String(pointNum).padStart(2, '0')}`,
        lat: pointData.lat,
        lng: pointData.lng,
        depth: pointData.depth || '0-20',
        date: pointData.date || new Date().toISOString().split('T')[0],
        subsamplesCount: pointData.subsamplesCount || 15,
        status: pointData.status || 'coletado',
        linkedSampleCode: pointData.linkedSampleCode,
        soilColor: pointData.soilColor || 'Latossolo Vermelho',
        notes: pointData.notes || '',
        createdAt: pointData.createdAt || new Date().toISOString(),
      };
      newPoints = [...currentPoints, finalPoint];
    }

    savePointsForFarm(farmId, newPoints);
    return finalPoint;
  }, [getPointsForFarm, savePointsForFarm]);

  const deletePoint = useCallback((farmId: string, pointId: string) => {
    const currentPoints = getPointsForFarm(farmId);
    const newPoints = currentPoints.filter(p => p.id !== pointId && p.code !== pointId);
    savePointsForFarm(farmId, newPoints);
  }, [getPointsForFarm, savePointsForFarm]);

  const syncSamplesWithCoordinates = useCallback((samples: SoilSample[], farmId: string): SoilSample[] => {
    if (!samples || samples.length === 0 || !farmId) return samples || [];
    const points = getPointsForFarm(farmId);
    if (!points || points.length === 0) return samples;

    // Create maps for fast lookup
    const pointByCode = new Map<string, SoilSamplingPoint>();
    const pointById = new Map<string, SoilSamplingPoint>();
    const pointsByPlot = new Map<string, SoilSamplingPoint[]>();

    points.forEach(pt => {
      if (pt.code) pointByCode.set(pt.code.toLowerCase().trim(), pt);
      if (pt.linkedSampleCode) pointByCode.set(pt.linkedSampleCode.toLowerCase().trim(), pt);
      if (pt.id) pointById.set(pt.id, pt);

      if (pt.plotId) {
        const plotPts = pointsByPlot.get(pt.plotId) || [];
        plotPts.push(pt);
        pointsByPlot.set(pt.plotId, plotPts);
      }
    });

    return samples.map(sample => {
      const codeKey = sample.sampleCode?.toLowerCase()?.trim() || '';
      const matchedPoint = pointByCode.get(codeKey) || pointById.get(sample.id);

      if (matchedPoint) {
        return {
          ...sample,
          latitude: matchedPoint.lat,
          longitude: matchedPoint.lng,
        };
      }

      // Fallback: match by plot ID if available
      const plotPts = sample.plotId ? pointsByPlot.get(sample.plotId) : null;
      if (plotPts && plotPts.length > 0 && sample.latitude == null) {
        return {
          ...sample,
          latitude: plotPts[0].lat,
          longitude: plotPts[0].lng,
        };
      }

      return sample;
    });
  }, [getPointsForFarm]);

  const notifyCoordinatesChanged = useCallback(() => {
    setLastSyncTimestamp(Date.now());
  }, []);

  return (
    <SoilCoordinatesContext.Provider
      value={{
        pointsMap,
        boundariesMap,
        getPointsForFarm,
        getBoundariesForFarm,
        savePointsForFarm,
        saveBoundariesForFarm,
        updatePointCoordinates,
        addOrUpdatePoint,
        deletePoint,
        syncSamplesWithCoordinates,
        notifyCoordinatesChanged,
      }}
    >
      {children}
    </SoilCoordinatesContext.Provider>
  );
};

export function useSoilCoordinatesContext() {
  const ctx = useContext(SoilCoordinatesContext);
  if (!ctx) {
    throw new Error('useSoilCoordinatesContext must be used within a SoilCoordinatesProvider');
  }
  return ctx;
}
