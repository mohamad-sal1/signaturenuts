import React from 'react';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onAdjustQty,
  grandTotal,
  onCheckout,
}) {
  if (!isOpen) return null;

  // Clean grams (fix "100g" -> 100)
  const cleanGrams = (value) => {
    if (!value) return 0;
    return Number(String(value).replace(/g/gi, '').trim()) || 0;
  };

  // Build readable breakdown
  const weightBreakdown = cartItems.map((item) => {
    let grams = 0;
    let pack = 1;

    if (item.sizeType === 'custom') {
      grams = Number(item.customGramsCount || 0);
    } 
    else if (typeof item.sizeType === 'object' && item.sizeType !== null) {
      grams = cleanGrams(item.sizeType.grams);
      pack = Number(item.sizeType.pack || 1);
    } 
    else {
      grams = cleanGrams(item.sizeType);
    }

    const totalPacks = pack * item.qty;

    return {
      name: item.name,
      label: `${totalPacks} Pack${totalPacks > 1 ? 's' : ''} of ${grams}g`,
    };
  });

  return (
    <div className='cart-drawer-dimmer-curtain' onClick={onClose}>
      <div
        className='cart-sliding-drawer-body'
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className='cart-drawer-top-heading-row'>
          <div className='cart-headline-title-block'>
            <ShoppingBag size={18} color='#E89243' />
            <h3>Your Shopping Bag</h3>
          </div>

          <button className='cart-drawer-dismiss-btn' onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* ITEMS */}
        <div className='cart-items-scrollable-tray'>
          {cartItems.length === 0 ? (
            <div className='empty-tray-fallback-state'>
              <ShoppingBag size={44} style={{ opacity: 0.1, marginBottom: '12px' }} />

              <p style={{ fontSize: '14px', fontWeight: '500' }}>
                Your bag is currently completely empty.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartKey} className='cart-line-item-card'>
                <div className='line-item-meta-details'>
                  <h4>{item.name}</h4>

                  <p>
                    {/* FIXED DISPLAY */}
                    {typeof item.sizeType === 'object' && item.sizeType !== null
                      ? `5 Pack of ${cleanGrams(item.sizeType.grams)}g`
                      : item.sizeType === 'custom'
                      ? `${item.customGramsCount}g Pack`
                      : `${cleanGrams(item.sizeType)}g Pack`}

                    {` · $${item.unitPrice.toFixed(2)}`}
                  </p>
                </div>

                {/* QUANTITY */}
                <div className='line-item-qty-stepper'>
                  <button
                    className='qty-stepper-btn'
                    onClick={() => onAdjustQty(item.cartKey, -1)}
                  >
                    <Minus size={12} />
                  </button>

                  <span className='qty-stepper-numeric-window'>
                    {item.qty}
                  </span>

                  <button
                    className='qty-stepper-btn'
                    onClick={() => onAdjustQty(item.cartKey, 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className='cart-checkout-summary-footer-block'>
            {/* SUBTOTAL */}
            <div className='footer-total-balance-row'>
              <span className='summary-total-label'>
                Subtotal Basket Sum:
              </span>

              <span className='summary-total-value'>
                ${grandTotal.toFixed(2)}
              </span>
            </div>

            {/* ORDER SUMMARY */}
            <div
              className='footer-total-balance-row'
              style={{
                marginTop: '10px',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <span className='summary-total-label'>
                🧾 Your Basket Summary
              </span>

              <div
                className='summary-total-value'
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginTop: '5px',
                }}
              >
                {weightBreakdown.map((item, index) => (
                  <span key={index}>
                    {item.name}: {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* CHECKOUT */}
            <button
              className='whatsapp-dispatch-order-btn'
              onClick={onCheckout}
            >
              Place Order & Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}