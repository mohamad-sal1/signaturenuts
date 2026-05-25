import React from 'react';
import { ShoppingBag, Check } from 'lucide-react';

export default function MainHeader({
  userSession,
  isEditing,
  bufferName,
  setBufferName,
  bufferPhone,
  setBufferPhone,
  onSaveInline,
  onTriggerEdit,
  cartTotalQty,
  onOpenCart,
  onResetPage,
}) {
  return (
    <header className='main-header'>
      <div className='header-inner'>
        {/* Expanded Micro-Card Profile Layout Block */}
        <div className='user-widget'>
          {isEditing ? (
            <form onSubmit={onSaveInline} className='inline-edit-form'>
              <input
                type='text'
                value={bufferName}
                onChange={(e) => setBufferName(e.target.value)}
                className='inline-edit-input'
                required
                placeholder='Name'
              />
              <input
                type='tel'
                value={bufferPhone}
                onChange={(e) => setBufferPhone(e.target.value)}
                className='inline-edit-input'
                required
                placeholder='Phone'
              />
              <button type='submit' className='inline-save-btn'>
                <Check size={14} />
              </button>
            </form>
          ) : (
            <div
              onClick={onTriggerEdit}
              style={{ cursor: 'pointer', textLeft: 'left' }}
              title='Click to edit details'
            >
              <div className='user-info-text'>
                <p className='user-display-name'>{userSession.name}</p>
                <p className='user-display-phone'>{userSession.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Nav Anchor Brand Branding Logo Block */}
        <div
          className='logo-wrapper'
          onClick={(e) => {
            // Stop the click from bleeding into the rest of the header viewport
            e.stopPropagation();
            onResetPage();
          }}
          title='Return to first category'
        >
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt='Signature Nuts Logo'
            className='brand-logo-img'
            onClick={(e) => e.stopPropagation()} // Protect the image element specifically
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1
            className='logo-title'
            style={{
              display: !document.querySelector('.brand-logo-img')
                ? 'block'
                : 'none',
            }}
          >
          </h1>
        </div>

        {/* Cart Interaction Element Badge Button */}
        <button onClick={onOpenCart} className='basket-trigger-btn'>
          <ShoppingBag size={22} />
          {cartTotalQty > 0 && (
            <span className='basket-counter-badge'>{cartTotalQty}</span>
          )}
        </button>


      </div>
    </header>
  );
}
