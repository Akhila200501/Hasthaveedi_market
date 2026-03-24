import React from 'react';
import '../styles/TrackingStepper.css';

const TrackingStepper = ({ status, onStatusChange }) => {
  const steps = [
    { id: 'Pending', label: 'Order Placed', icon: '📦' },
    { id: 'Processing', label: 'Processing', icon: '🔄' },
    { id: 'Shipped', label: 'Shipped', icon: '🚚' },
    { id: 'Delivered', label: 'Delivered', icon: '✅' },
    { id: 'Cancelled', label: 'Cancelled', icon: '❌' }
  ];

  const currentStatusIndex = steps.findIndex(step => step.id === status);
  const activeIndex = currentStatusIndex >= 0 ? currentStatusIndex : 0;

  return (
    <div className="tracking-stepper">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div 
            className={`step ${index <= activeIndex ? 'active' : ''} ${onStatusChange ? 'clickable' : ''}`}
            onClick={() => onStatusChange && onStatusChange(step.id)}
            title={`Set status to ${step.label}`}
          >
            <div className="step-indicator">
              <div className="step-icon">
                {index < activeIndex ? '✓' : step.icon}
              </div>
            </div>
            <div className="step-label">{step.label}</div>
          </div>
          {index < steps.length - 1 && (
            <div className={`step-connector ${index < activeIndex ? 'active' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TrackingStepper;