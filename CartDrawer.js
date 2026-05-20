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

  return (
    <div className='cart-drawer-dimmer-curtain' onClick={onClose}>
      <div
        className='cart-sliding-drawer-body'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='cart-drawer-top-heading-row'>
          <div className='cart-headline-title-block'>
            <ShoppingBag size={18} color='#E89243' />
            <h3>Your Shopping Bag</h3>
          </div>
          <button className='cart-drawer-dismiss-btn' onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className='cart-items-scrollable-tray'>
          {cartItems.length === 0 ? (
            <div className='empty-tray-fallback-state'>
              <ShoppingBag
                size={44}
                style={{ opacity: 0.1, marginBottom: '12px' }}
              />
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
                    {item.sizeType === 'fixed'
                      ? 'Standard pack'
                      : item.sizeType === 'custom'
                        ? `${item.customGramsCount}g Pack`
                        : `${item.sizeType}`}
                    {` · $${item.unitPrice.toFixed(2)}`}
                  </p>
                </div>
                <div className='line-item-qty-stepper'>
                  <button
                    className='qty-stepper-btn'
                    onClick={() => onAdjustQty(item.cartKey, -1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span className='qty-stepper-numeric-window'>{item.qty}</span>
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

        {cartItems.length > 0 && (
          <div className='cart-checkout-summary-footer-block'>
            <div className='footer-total-balance-row'>
              <span className='summary-total-label'>Subtotal Basket Sum:</span>
              <span className='summary-total-value'>
                ${grandTotal.toFixed(2)}
              </span>
            </div>
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
