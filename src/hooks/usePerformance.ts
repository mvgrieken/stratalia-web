/**
 * Performance monitoring hook
 * Tracks Core Web Vitals and custom metrics
 */

import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function usePerformance() {
  const reportMetric = useCallback((name: string, value: number, id?: string) => {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to Google Analytics, DataDog, etc.
      logger.debug(`Performance metric: ${name} - value: ${value}, id: ${id || 'none'}`);
    } else {
      logger.debug(`[Performance] ${name}: ${value}ms ${id ? `(${id})` : ''}`);
    }
  }, []);

  const measurePageLoad = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Measure page load time
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      reportMetric('page_load_time', loadTime);
    }

    // Measure First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      reportMetric('fcp', fcpEntry.startTime);
    }

    // Measure Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      reportMetric('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        reportMetric('fid', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Measure Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      reportMetric('cls', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }, [reportMetric]);

  const measureApiCall = useCallback((url: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    reportMetric('api_call_duration', duration, url);
  }, [reportMetric]);

  const measureComponentRender = useCallback((componentName: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    reportMetric('component_render_time', duration, componentName);
  }, [reportMetric]);

  useEffect(() => {
    measurePageLoad();
  }, [measurePageLoad]);

  return {
    reportMetric,
    measureApiCall,
    measureComponentRender,
  };
}

export default usePerformance;
