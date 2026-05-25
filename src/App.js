import React, { useState, useEffect } from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import './App.css';

// Micro-Components Imports
import OnboardingGate from './components/OnboardingGate';
import MainHeader from './components/MainHeader';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';

// Your Google Apps Script Endpoint:
const CONFIG_CATALOG_SHEET_API =
  'https://script.google.com/macros/s/AKfycbzS8PVhimwdqasvF8rnq1OEEZjbEWXQ0FQPmvZXgKRYqSuPARQQ8-VAyaIxES4T3Io8/exec';

export default function App() {
  const [catalog, setCatalog] = useState({ categories: [], products: [] });
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTabCategory, setActiveTabCategory] = useState('');

  const [userSession, setUserSession] = useState(() => {
    const cachedProfile = localStorage.getItem('signature_nuts_user_session');
    return cachedProfile
      ? JSON.parse(cachedProfile)
      : { name: '', phone: '', onboarded: false };
  });
  const [isEditingProfileInline, setIsEditingProfileInline] = useState(false);
  const [fieldBufferName, setFieldBufferName] = useState(userSession.name);
  const [fieldBufferPhone, setFieldBufferPhone] = useState(userSession.phone);

  const [shoppingCart, setShoppingCart] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSelectedSizeMap, setProductSelectedSizeMap] = useState({});
  const [productCustomWeightInputMap, setProductCustomWeightInputMap] = useState({});

  // NEW STATE: Tracks specific custom weight text fields failing validation parameters
  const [validationErrorsMap, setValidationErrorsMap] = useState({});
const searchTermLower = searchTerm.toLowerCase().trim();

const isMatchSearch = (p) => {
  if (!searchTermLower) return true;

  return (
    p.name?.toLowerCase().includes(searchTermLower) ||
    p.description?.toLowerCase().includes(searchTermLower) ||
    p.subcategory?.toLowerCase().includes(searchTermLower)
  );
};
  useEffect(() => {
    fetch(CONFIG_CATALOG_SHEET_API)
      .then((res) => res.json())
      .then((fetchedPayload) => {
        setCatalog(fetchedPayload);
        setIsDataLoading(false);
        if (fetchedPayload.categories && fetchedPayload.categories.length > 0) {
          setActiveTabCategory(fetchedPayload.categories[0].mainCategory);
        }
      })
      .catch((err) => console.error('Database streaming error:', err));
  }, []);

  const handleSizeSelection = (productId, sizeKey) => {
    setProductSelectedSizeMap((prev) => ({ ...prev, [productId]: sizeKey }));
    // Clear error immediately if they switch sizes
    setValidationErrorsMap((prev) => ({ ...prev, [productId]: false }));
  };

  const handleCustomWeightChange = (productId, weightValue) => {
    setProductCustomWeightInputMap((prev) => ({
      ...prev,
      [productId]: weightValue,
    }));

    // Clear error feedback instantly the second they start typing data inside the field box
    if (parseFloat(weightValue) > 0) {
      setValidationErrorsMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const computeLiveProductCost = (item) => {
    if (!item.hasVariants) return item.fixedPrice;
    const weightChoice = productSelectedSizeMap[item.id] || '100g';
    if (weightChoice === 'custom') {
      const manualGrams = parseFloat(productCustomWeightInputMap[item.id]) || 0;
      const basePricePerGram = (item.variants['1000g'] || 0) / 1000;
      return basePricePerGram * manualGrams;
    }
    return item.variants[weightChoice] || 0;
  };

  const pushConfiguredItemToCart = (item) => {
    const activeSize = item.hasVariants
      ? productSelectedSizeMap[item.id] || '100g'
      : 'fixed';
    const activeCustomWeightNum =
      activeSize === 'custom'
        ? parseFloat(productCustomWeightInputMap[item.id])
        : null;
    const unitPriceResult = computeLiveProductCost(item);

    // Dynamic Visual Validation Interceptor Rule Engine
    if (
      activeSize === 'custom' &&
      (!activeCustomWeightNum || activeCustomWeightNum <= 0)
    ) {
      setValidationErrorsMap((prev) => ({ ...prev, [item.id]: true }));
      return; // Absolute block, window popup alert completely avoided
    }

    const uniqueBasketKey = `${item.id}-${activeSize}-${activeCustomWeightNum || ''}`;

    setShoppingCart((currentCart) => {
      const elementMatch = currentCart.find(
        (cartLoopItem) => cartLoopItem.cartKey === uniqueBasketKey,
      );
      if (elementMatch) {
        return currentCart.map((cartLoopItem) =>
          cartLoopItem.cartKey === uniqueBasketKey
            ? { ...cartLoopItem, qty: cartLoopItem.qty + 1 }
            : cartLoopItem,
        );
      }
      return [
        ...currentCart,
        {
          cartKey: uniqueBasketKey,
          id: item.id,
          name: item.name,
          sizeType: activeSize,
          customGramsCount: activeCustomWeightNum,
          unitPrice: unitPriceResult,
          qty: 1,
        },
      ];
    });

    setIsCartDrawerOpen(true);
  };

  const adjustCartRowQty = (uniqueBasketKey, mathematicalDelta) => {
    setShoppingCart((currentCart) =>
      currentCart
        .map((cartLoopItem) => {
          if (cartLoopItem.cartKey === uniqueBasketKey) {
            const structuralNextQty = cartLoopItem.qty + mathematicalDelta;
            return structuralNextQty <= 0
              ? null
              : { ...cartLoopItem, qty: structuralNextQty };
          }
          return cartLoopItem;
        })
        .filter(Boolean),
    );
  };

  const getCartGrandTotalSum = () => {
    return shoppingCart.reduce(
      (runningTotal, cartItem) =>
        runningTotal + cartItem.unitPrice * cartItem.qty,
      0,
    );
  };

  const compileAndSendWhatsAppOrder = () => {
    const businessRoutingPhone = '96170096781';
    let textTemplate = `*NEW DIGITAL STOREFRONT ORDER - SIGNATURE NUTS*\n\n`;
    textTemplate += `*Customer Delivery Identity:*\n`;
    textTemplate += `• Name: ${userSession.name}\n`;
    textTemplate += `• WhatsApp Contact: ${userSession.phone}\n\n`;
    textTemplate += `*Ordered Line Items Matrix:*\n`;

    shoppingCart.forEach((item, pointerIndex) => {
      const dimensionLabel =
        item.sizeType === 'fixed'
          ? ''
          : ` (${item.sizeType === 'custom' ? `${item.customGramsCount}g` : item.sizeType})`;
      textTemplate += `${pointerIndex + 1}. ${item.name}${dimensionLabel} [x${item.qty}] -> $${(item.unitPrice * item.qty).toFixed(2)}\n`;
    });

    textTemplate += `\n*Grand Total Order Amount:* $${getCartGrandTotalSum().toFixed(2)}`;

    window.open(
      `https://wa.me/${businessRoutingPhone}?text=${encodeURIComponent(textTemplate)}`,
      '_blank',
    );

    setShoppingCart([]);
    setIsCartDrawerOpen(false);
  };

  const executeInitialOnboarding = (e) => {
    e.preventDefault();
    if (!fieldBufferName.trim() || !fieldBufferPhone.trim()) return;
    const cleanSession = {
      name: fieldBufferName.trim(),
      phone: fieldBufferPhone.trim(),
      onboarded: true,
    };
    setUserSession(cleanSession);
    localStorage.setItem(
      'signature_nuts_user_session',
      JSON.stringify(cleanSession),
    );
  };

  const executeInlineProfileCorrection = (e) => {
    e.preventDefault();
    if (!fieldBufferName.trim() || !fieldBufferPhone.trim()) return;
    const updatedSession = {
      ...userSession,
      name: fieldBufferName.trim(),
      phone: fieldBufferPhone.trim(),
    };
    setUserSession(updatedSession);
    localStorage.setItem(
      'signature_nuts_user_session',
      JSON.stringify(updatedSession),
    );
    setIsEditingProfileInline(false);
  };

  const handleReturnToHomeLogoReset = () => {
    if (catalog.categories && catalog.categories.length > 0) {
      setActiveTabCategory(catalog.categories[0].mainCategory);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSubcategoryNode = (subId) => {
    const element = document.getElementById(`sub-target-${subId}`);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const totalHeaderOffset = 180;

      window.scrollTo({
        top: elementPosition - totalHeaderOffset,
        behavior: 'smooth',
      });
    }
  };

  if (!userSession.onboarded) {
    return (
      <OnboardingGate
        fieldName={fieldBufferName}
        setFieldName={setFieldBufferName}
        fieldPhone={fieldBufferPhone}
        setFieldPhone={setFieldBufferPhone}
        onConfirm={executeInitialOnboarding}
      />
    );
  }

  const targetedActiveCategoryNode = catalog.categories.find(
    (c) => c.mainCategory === activeTabCategory,
  );
 const productsToRenderInFeed = catalog.products.filter(
  (p) => p.mainCategory === activeTabCategory,
);
const globalFilteredProducts = Array.isArray(catalog.products)
  ? (
      searchTerm.trim()
        ? catalog.products.filter((p) => {
            const term = searchTerm.toLowerCase();

            return (
              p.name?.toLowerCase().includes(term) ||
              p.description?.toLowerCase().includes(term) ||
              p.subcategory?.toLowerCase().includes(term) ||
              p.mainCategory?.toLowerCase().includes(term)
            );
          })
        : productsToRenderInFeed
    )
  : [];

  return (
    <div className='app-container'>
      <MainHeader
        userSession={userSession}
        isEditing={isEditingProfileInline}
        bufferName={fieldBufferName}
        setBufferName={setFieldBufferName}
        bufferPhone={fieldBufferPhone}
        setBufferPhone={setFieldBufferPhone}
        onSaveInline={executeInlineProfileCorrection}
        onTriggerEdit={() => {
          setFieldBufferName(userSession.name);
          setFieldBufferPhone(userSession.phone);
          setIsEditingProfileInline(true);
        }}
        cartTotalQty={shoppingCart.reduce((total, i) => total + i.qty, 0)}
        onOpenCart={() => setIsCartDrawerOpen(true)}
        onResetPage={handleReturnToHomeLogoReset}
      />

      <nav className='sticky-nav-bar'>
        <div className='nav-horizontal-scroll'>
          {catalog.categories.map((catNode) => (
            <button
              key={catNode.mainCategory}
              onClick={() => setActiveTabCategory(catNode.mainCategory)}
              className={`category-tab-pill ${activeTabCategory === catNode.mainCategory ? 'is-active' : ''}`}
            >
              {catNode.mainCategory}
            </button>
          ))}
        </div>

        {targetedActiveCategoryNode &&
          targetedActiveCategoryNode.subcategories.length > 0 && (
            <div className='subcategory-filter-slider-container animate-fade-in'>
              {targetedActiveCategoryNode.subcategories.map((subGroupTitle) => (
                <button
                  key={subGroupTitle}
                  className='subcategory-filter-badge'
                  onClick={() => scrollToSubcategoryNode(subGroupTitle)}
                >
                  {subGroupTitle}
                </button>
              ))}
            </div>
          )}
          <div className="search-bar-container">
          <input
            type='text'
            placeholder='Search all products...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='search-input'
         />
          </div>
      </nav>

      <main className='main-feed-container'>
  {isDataLoading ? (
    <div className='loading-spinner-box'>
      <div className='spinning-circle-svg'></div>

      <p
        style={{
          color: '#8E847E',
          fontSize: '13px',
          fontWeight: '500',
        }}
      >
        Synchronizing menu options...
      </p>
    </div>
  ) : (
    <div>

      {/* GLOBAL SEARCH MODE */}
      {searchTerm.trim() ? (
        <div className='catalog-responsive-grid'>
          {globalFilteredProducts.map((productObj) => (
            <ProductCard
              key={productObj.id}
              item={productObj}
              selectedSize={
                productSelectedSizeMap[productObj.id] || '100g'
              }
              customWeightText={
                productCustomWeightInputMap[productObj.id] || ''
              }
              onSelectSize={handleSizeSelection}
              onCustomWeightChange={handleCustomWeightChange}
              calculatedPrice={computeLiveProductCost(productObj)}
              onAddToBag={pushConfiguredItemToCart}
              hasError={!!validationErrorsMap[productObj.id]}
            />
          ))}
        </div>
      ) : (
        <>
          {/* ORIGINAL CATEGORY + SUBCATEGORY SYSTEM */}
          {targetedActiveCategoryNode &&
          targetedActiveCategoryNode.subcategories.length > 0 ? (
            targetedActiveCategoryNode.subcategories.map((subGroupTitle) => {
              const associatedGridProducts =
                productsToRenderInFeed.filter(
                  (p) => p.subcategory === subGroupTitle,
                );

              if (associatedGridProducts.length === 0) return null;

              return (
                <div
                  key={subGroupTitle}
                  id={`sub-target-${subGroupTitle}`}
                  className='subcategory-wrapper'
                >
                  <div className='subcategory-header-row'>
                    <ChevronRight size={18} color='#E89243' />

                    <h2 className='subcategory-headline'>
                      {subGroupTitle}
                    </h2>
                  </div>

                  <div className='catalog-responsive-grid'>
                    {associatedGridProducts.map((productObj) => (
                      <ProductCard
                        key={productObj.id}
                        item={productObj}
                        selectedSize={
                          productSelectedSizeMap[productObj.id] || '100g'
                        }
                        customWeightText={
                          productCustomWeightInputMap[productObj.id] || ''
                        }
                        onSelectSize={handleSizeSelection}
                        onCustomWeightChange={handleCustomWeightChange}
                        calculatedPrice={computeLiveProductCost(productObj)}
                        onAddToBag={pushConfiguredItemToCart}
                        hasError={!!validationErrorsMap[productObj.id]}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className='catalog-responsive-grid'>
              {productsToRenderInFeed.map((productObj) => (
                <ProductCard
                  key={productObj.id}
                  item={productObj}
                  selectedSize={
                    productSelectedSizeMap[productObj.id] || '100g'
                  }
                  customWeightText={
                    productCustomWeightInputMap[productObj.id] || ''
                  }
                  onSelectSize={handleSizeSelection}
                  onCustomWeightChange={handleCustomWeightChange}
                  calculatedPrice={computeLiveProductCost(productObj)}
                  onAddToBag={pushConfiguredItemToCart}
                  hasError={!!validationErrorsMap[productObj.id]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )}
</main>

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={shoppingCart}
        onAdjustQty={adjustCartRowQty}
        grandTotal={getCartGrandTotalSum()}
        onCheckout={compileAndSendWhatsAppOrder}
      />

      <footer className='global-site-footer'>
        <p style={{ fontWeight: '800' }}>Signature Nuts &copy; 2026</p>
        <a
          href='https://www.instagram.com/signaturenuts?igsh=MXU1dmpibWdtd2szdA=='
          target='_blank'
          rel='noreferrer'
          className='footer-insta-link'
        >
          <span>Connect via Instagram</span>
          <ExternalLink size={12} />
        </a>
      </footer>
    </div>
  );
}
