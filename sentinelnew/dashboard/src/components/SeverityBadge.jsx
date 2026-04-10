import React from 'react';

export default function SeverityBadge({ severity }) {
  const getStyle = (sev) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'badge-danger';
      case 'MEDIUM':
        return 'badge-warning';
      case 'LOW':
        return 'badge-success';
      default:
        return 'badge-primary';
    }
  };

  return (
    <span className={`badge ${getStyle(severity)}`}>
      {severity}
    </span>
  );
}
