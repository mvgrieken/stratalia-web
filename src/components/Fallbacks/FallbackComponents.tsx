/**
 * Fallback Components
 * Reusable fallback UI components for different scenarios
 */

import React from 'react';

interface FallbackProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: string;
  className?: string;
}

/**
 * Loading fallback component
 */
export const LoadingFallback: React.FC<FallbackProps> = ({
  title = 'Laden...',
  message = 'Even geduld, de content wordt geladen.',
  icon = '⏳',
  className = '',
}) => (
  <div className={`fallback fallback--loading ${className}`}>
    <div className="fallback__icon">{icon}</div>
    <h3 className="fallback__title">{title}</h3>
    <p className="fallback__message">{message}</p>
    <div className="fallback__spinner">
      <div className="spinner"></div>
    </div>
  </div>
);

/**
 * Error fallback component
 */
export const ErrorFallback: React.FC<FallbackProps> = ({
  title = 'Er is een fout opgetreden',
  message = 'Er ging iets mis bij het laden van de content.',
  action,
  icon = '⚠️',
  className = '',
}) => (
  <div className={`fallback fallback--error ${className}`}>
    <div className="fallback__icon">{icon}</div>
    <h3 className="fallback__title">{title}</h3>
    <p className="fallback__message">{message}</p>
    {action && <div className="fallback__action">{action}</div>}
  </div>
);

/**
 * Empty state fallback component
 */
export const EmptyFallback: React.FC<FallbackProps> = ({
  title = 'Geen content gevonden',
  message = 'Er is momenteel geen content beschikbaar.',
  action,
  icon = '📭',
  className = '',
}) => (
  <div className={`fallback fallback--empty ${className}`}>
    <div className="fallback__icon">{icon}</div>
    <h3 className="fallback__title">{title}</h3>
    <p className="fallback__message">{message}</p>
    {action && <div className="fallback__action">{action}</div>}
  </div>
);

/**
 * Offline fallback component
 */
export const OfflineFallback: React.FC<FallbackProps> = ({
  title = 'Geen internetverbinding',
  message = 'Controleer je internetverbinding en probeer het opnieuw.',
  action,
  icon = '📡',
  className = '',
}) => (
  <div className={`fallback fallback--offline ${className}`}>
    <div className="fallback__icon">{icon}</div>
    <h3 className="fallback__title">{title}</h3>
    <p className="fallback__message">{message}</p>
    {action && <div className="fallback__action">{action}</div>}
  </div>
);

/**
 * Maintenance fallback component
 */
export const MaintenanceFallback: React.FC<FallbackProps> = ({
  title = 'Onderhoud',
  message = 'De applicatie is tijdelijk niet beschikbaar vanwege onderhoud.',
  action,
  icon = '🔧',
  className = '',
}) => (
  <div className={`fallback fallback--maintenance ${className}`}>
    <div className="fallback__icon">{icon}</div>
    <h3 className="fallback__title">{title}</h3>
    <p className="fallback__message">{message}</p>
    {action && <div className="fallback__action">{action}</div>}
  </div>
);

/**
 * Generic fallback component
 */
export const GenericFallback: React.FC<FallbackProps> = ({
  title = 'Er is iets misgegaan',
  message = 'Er is een onverwachte fout opgetreden.',
  action,
  icon = '❓',
  className = '',
}) => (
  <div className={`fallback fallback--generic ${className}`}>
    <div className="fallback__icon">{icon}</div>
    <h3 className="fallback__title">{title}</h3>
    <p className="fallback__message">{message}</p>
    {action && <div className="fallback__action">{action}</div>}
  </div>
);

/**
 * Skeleton loading component
 */
export const SkeletonFallback: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`skeleton-fallback ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <div
        key={index}
        className={`skeleton-line ${index === 0 ? 'skeleton-line--title' : ''}`}
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
);

/**
 * Card skeleton component
 */
export const CardSkeletonFallback: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className = '' }) => (
  <div className={`card-skeleton-fallback ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="card-skeleton">
        <div className="card-skeleton__header">
          <div className="card-skeleton__avatar"></div>
          <div className="card-skeleton__title"></div>
        </div>
        <div className="card-skeleton__content">
          <div className="card-skeleton__line"></div>
          <div className="card-skeleton__line"></div>
          <div className="card-skeleton__line card-skeleton__line--short"></div>
        </div>
      </div>
    ))}
  </div>
);

const FallbackComponents = {
  LoadingFallback,
  ErrorFallback,
  EmptyFallback,
  OfflineFallback,
  MaintenanceFallback,
  GenericFallback,
  SkeletonFallback,
  CardSkeletonFallback,
};

export default FallbackComponents;
