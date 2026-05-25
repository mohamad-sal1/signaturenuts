import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({
  item,
  selectedSize,
  customWeightText,
  onSelectSize,
  onCustomWeightChange,
  calculatedPrice,
  onAddToBag,
  hasError,
}) {

  return (
<div className='product-master-card'>
  <img
    src={item.image}
    alt={item.name}
    className='product-card-image'
/>

      <div>
        <div className='card-top-block'>
          <h3 className='product-item-name'>{item.name}</h3>

          {!item.hasVariants && (
            <span className='product-fixed-price-tag'>
              ${item.fixedPrice.toFixed(2)}
            </span>
          )}
        </div>

        {item.description && (
          <p className='product-item-desc'>{item.description}</p>
        )}

        {item.hasVariants && (
          <div className='card-variants-block'>
            <div className='size-pill-selector-grid'>
              {Object.keys(item.variants).map((sizeKey) => {
                if (item.variants[sizeKey] === null) return null;

                return (
                  <button
                    key={sizeKey}
                    type='button'
                    className={`variant-action-pill ${selectedSize === sizeKey ? 'is-selected' : ''}`}
                    onClick={() => onSelectSize(item.id, sizeKey)}
                  >
                    {sizeKey}
                  </button>
                );
              })}

              <button
                type='button'
                className={`variant-action-pill ${selectedSize === 'custom' ? 'is-selected' : ''}`}
                onClick={() => onSelectSize(item.id, 'custom')}
              >
                Custom
              </button>
            </div>

            {selectedSize === 'custom' && (
              <div className='custom-input-box-slide'>
                <input
                  type='number'
                  min='1'
                  placeholder='Enter target grams'
                  value={customWeightText}
                  className={`custom-gram-input-field ${hasError ? 'field-validation-error' : ''}`}
                  onChange={(e) =>
                    onCustomWeightChange(item.id, e.target.value)
                  }
                />
                <span className='custom-gram-label-unit'>grams</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='card-action-footer-row'>
        {item.hasVariants && (
          <div className='live-price-counter-box'>
            <span className='live-price-label'>Price</span>
            <span className='live-price-numeric-value'>
              ${calculatedPrice > 0 ? calculatedPrice.toFixed(2) : '0.00'}
            </span>
          </div>
        )}

        <button className='push-to-bag-btn' onClick={() => onAddToBag(item)}>
          <ShoppingBag size={14} />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
}