import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function OnboardingGate({
  fieldName,
  setFieldName,
  fieldPhone,
  setFieldPhone,
  onConfirm,
}) {
  return (
    <div className='onboard-gate-backdrop'>
      <div className='onboard-surface-card'>
        <div className='onboard-brand-icon-nest'>
         
            <img
                src={`${process.env.PUBLIC_URL}/logo.png`}
                alt="Logo"
                 className="onboarding-logo-img"
            />
        </div>
        
        <p className='onboard-welcome-subtitle'>
          Welcome! Please enter your name and contact phone number below to
          explore our fresh menu catalog.
        </p>
        <form onSubmit={onConfirm}>
          <div className='onboard-input-group'>
            <label>Your Full Name</label>
            <input
              type='text'
              required
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder='e.g. Signature Nuts'
            />
          </div>
          <div className='onboard-input-group'>
            <label>Phone Number</label>
            <input
              type='tel'
              required
              value={fieldPhone}
              onChange={(e) => setFieldPhone(e.target.value)}
              placeholder='e.g. 70096781'
            />
          </div>
          <button type='submit' className='onboard-primary-action-btn'>
            Continue Shopping
          </button>
        </form>
      </div>
    </div>
  );
}
