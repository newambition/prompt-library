import React, { useState } from 'react';
import { FaTimes, FaCheck, FaCrown, FaStar } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { createCheckoutSession } from '../api';

// Stripe Price IDs - from environment variables
const STRIPE_PRICE_IDS = {
  pro: process.env.REACT_APP_STRIPE_PRO_PRICE_ID_MONTHLY,
  yearly: process.env.REACT_APP_STRIPE_PRO_PRICE_ID_YEARLY
};

// Debug logging
console.log('Environment variables check:');
console.log('REACT_APP_STRIPE_PRO_PRICE_ID_MONTHLY:', process.env.REACT_APP_STRIPE_PRO_PRICE_ID_MONTHLY);
console.log('REACT_APP_STRIPE_PRO_PRICE_ID_YEARLY:', process.env.REACT_APP_STRIPE_PRO_PRICE_ID_YEARLY);
console.log('STRIPE_PRICE_IDS:', STRIPE_PRICE_IDS);

const TIER_DATA = {
  free: {
    name: 'FREE',
    tagline: 'Enjoy Promptfolio for free',
    price: '£0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '20 prompts',
      '3 versions per prompt',
      'Access to playground usage',
      'All LLM models (BYOK)',
      'Access to all templates',
      'Full tagging & organization',
      'Secure API key management'
    ],
    buttonText: 'Continue with Free',
    buttonStyle: 'bg-surface border-2 border-light text-light hover:bg-dark',
    popular: false
  },
  pro: {
    name: 'PRO',
    tagline: {
      parts: ['Unlock the Power of ', 'Promptfolio', ' Pro'],
      styledPart: 1 // Index of the part to style
    },
    price: '£7',
    period: 'per month',
    description: 'For power users and professionals',
    features: [
      'Unlimited prompts & versions',
      'Advanced Playground Tools (Model Configuration)',
      'Full tagging & organization',
      //'Access to all templates',
      'Advanced Versioning (Branching, Custom Naming)',
      //'Secure API key management',
      //'Priority support',
      'Early access to new features (Imminent roll out: A/B Testing, Ai prompt evaluation & improvement)'
    ],
    buttonText: 'Subscribe',
    buttonStyle: 'btn-primary',
    popular: true
  },
  yearly: {
    name: 'YEARLY',
    tagline: 'Save 20% with a yearly subscription',
    price: '£70',
    period: 'per year',
    description: 'Save on Pro',
    features: [
      'Unlimited prompts & versions',
      'Advanced Playground Tools (Model Configuration)',
      'Full tagging & organization',
      'Access to all templates',
      'Advanced Versioning (Branching, Custom Naming)',
      'Secure API key management',
      'Priority support',
      'Early access to new features (Imminent roll out: A/B Testing, Ai prompt evaluation & improvement)'
    ],
    buttonText: 'Subscribe to save 20%',
    buttonStyle: 'btn-primary',
    popular: false

  }
};

// Order for mobile carousel: Pro first, then Free
const MOBILE_TIER_ORDER = ['yearly', 'pro', 'free'];

function TierSelectionModal({ isOpen, onClose, onSelectTier, isSubmitting = false }) {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [selectedTier, setSelectedTier] = useState('pro'); // Default focus on Pro
  const [currentSlide, setCurrentSlide] = useState(0); // For mobile carousel
  const [touchStart, setTouchStart] = useState(null); // For touch gestures
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectTier = async (tier) => {
    setSelectedTier(tier);
    setError(null);

    // Handle free tier - just call the callback
    if (tier === 'free') {
      onSelectTier(tier);
      return;
    }

    // Handle paid tiers - redirect to Stripe checkout
    if (tier === 'pro' || tier === 'yearly') {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        loginWithRedirect({
          appState: { returnTo: window.location.pathname }
        });
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const priceId = STRIPE_PRICE_IDS[tier];
        
        if (!priceId) {
          setError(`Price ID not found for ${tier} tier`);
          return;
        }

        // Create success/cancel URLs
        const currentUrl = window.location.origin;
        const successUrl = `${currentUrl}/billing/success`;
        const cancelUrl = `${currentUrl}/billing/cancel`;

        // Create checkout session
        const response = await createCheckoutSession(priceId, successUrl, cancelUrl, token);
        
        if (response.checkout_url) {
          // Redirect to Stripe checkout
          window.location.href = response.checkout_url;
        } else {
          setError('Failed to create checkout session');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        setError(error.message || 'Failed to start checkout process');
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Mobile carousel handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart(touch.clientX);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const diff = touchStart - touch.clientX;
    
    // Prevent default to avoid page scrolling during horizontal swipe
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const diff = touchStart - touch.clientX;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && currentSlide < MOBILE_TIER_ORDER.length - 2) {
        // Swipe left, go to next
        setCurrentSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        // Swipe right, go to previous
        setCurrentSlide(currentSlide - 1);
      }
    }
    
    setTouchStart(null);
  };

  const currentMobileTier = MOBILE_TIER_ORDER[currentSlide];
  const currentTierData = TIER_DATA[currentMobileTier];

  return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-dark bg-opacity-95 z-50 p-0 sm:p-4"
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
      >
        {/* Mobile Layout - Fullscreen, removes "card" look */}
        <div className="sm:hidden w-screen h-screen flex flex-col rounded-none border-0 shadow-none">
          <div className="signup-bg absolute inset-0 bg-black/20  flex flex-col flex-1 min-h-0 rounded-none border-0 shadow-none overflow-hidden">
            <div className="bg-surface glass flex flex-col flex-1 min-h-0 rounded-none border-0 shadow-none relative overflow-hidden">
                {/* Close button */}
                <button
                className="absolute top-10 right-5 text-light-secondary hover:text-primary z-10"
                onClick={onClose}
                aria-label="Close tier selection"
                disabled={isSubmitting}
                >
                <FaTimes size={14} />
                </button>
        
                {/* Carousel Container */}
                <div
                className="flex-1 my-1 flex flex-col min-h-0 relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                >
                {/* Tier Card with Scrollable Content */}
                <div className="flex-1 p-3 sm:p-4 min-h-0 overflow-y-hidden">
                    <div className="h-full relative transition-all duration-200 flex flex-col">
                        <div className="flex-1"></div>
                        {currentTierData.popular && (
                        <div className="absolute top-7 ml-6 transform z-10">
                            <span className="bg-dark-glass text-light text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
                            <FaCrown className="mr-1" size={10} />
                            POPULAR
                            </span>
                        </div>
                        )}
            
                        {/* Spacer to position content 1/3 down */}
                        <div className="flex-1"></div>
                        
                        
                        {/* Grouped Header and Features Section */}
                        <div className="flex flex-col justify-start">
                            {/* Header Section */}
                            <div className="text-left p-4 sm:p-4">
                                <h3 className="text-3xl sm:text-xl font-body font-bold text-light tracking-tight">
                                    {typeof currentTierData.tagline === 'string' ? (
                                        currentTierData.tagline
                                    ) : (
                                        currentTierData.tagline.parts.map((part, index) => (
                                        <span
                                            key={index}
                                            className={index === currentTierData.tagline.styledPart ? 'antialiased font-playwrite skew-y-8 text-light' : ''}
                                        >
                                            {part}
                                        </span>
                                        ))
                                    )}
                                </h3>
                                <p className="text-xs sm:text-sm text-light mt-3">{currentTierData.description}</p>
                            </div>
                            
                            {/* Features Section */}
                            <div className="overflow-y-hidden p-4 leading-loose flex-1 min-h-0">
                                <ul className="space-y-4 sm:space-y-4">
                                    {currentTierData.features.map((feature, idx) => (
                                    <li key={idx} className="flex flex-row items-start text-sm sm:text-lg text-light">
                                        <FaCheck className="text-secondary mr-2 sm:mr-3 flex-shrink-0 mt-0.5" size={16} />
                                        <span className="leading-normal">{feature}</span>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        {/* Bottom spacer */}
                        <div className="flex-1"></div>
                    </div>
                </div>
                </div>
                
        
                {/* Fixed Bottom Section with Dots and Button */}
                <div className="flex-row mb-3 bg-transparent w-full">
                    <div className="sm:mt-2 text-center">
                    <span className="text-sm sm:text-3xl mr-1 text-light-secondary">{currentTierData.price}</span>
                    <span className="text-sm text-light-secondary">{currentTierData.period}</span>
                    </div>
                {/* Fixed Button */}
                <div className="p-3 sm:p-4">
                    {error && (
                      <div className="mb-3 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    <button
                    onClick={() => handleSelectTier(currentMobileTier)}
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-sm sm:text-base transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${currentTierData.buttonStyle}`}
                    >
                    {isSubmitting ? 'Please wait...' : currentTierData.buttonText}
                    </button>
                </div>
                {/* Dots Indicator */}
                <div className="flex justify-center py-2">
                    <div className="flex space-x-2">
                    {MOBILE_TIER_ORDER.map((_, index) => (
                        <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                            index === currentSlide
                                ? 'bg-transparent border-secondary'
                                : 'bg-light border-light-secondary brightness-150'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                    </div>
                </div>
                </div>
            </div>
          </div>
        </div>
     
    

      {/* Desktop Layout - Side by Side */}
      <div className="hidden sm:block w-full max-w-6xl">
        <div className="bg-surface glass border border-light rounded-xl shadow-xl relative overflow-hidden">
          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-light-secondary hover:text-primary z-10"
            onClick={onClose}
            aria-label="Close tier selection"
            disabled={isSubmitting}
          >
            <FaTimes size={24} />
          </button>

          {/* Header */}
          <div className="p-6 text-center border-b border-light">
            <h2 className="text-3xl font-bold text-light mb-3">Choose Your Plan</h2>
            <p className="text-lg text-light-secondary mb-3">Start with the plan that's right for you</p>
            <p className="text-xs text-light-secondary tracking-tight">BYOK (Bring Your Own Key) for all users.</p>
            {error && (
              <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Tier Cards - Side by Side */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(TIER_DATA).map(([tierKey, tier]) => (
                <div
                  key={tierKey}
                  className={`relative border-2 rounded-xl p-6 transition-all duration-200 cursor-pointer h-full flex flex-col ${
                    selectedTier === tierKey
                      ? 'border-primary dark-card-gradient bg-opacity-10 transform scale-105'
                      : 'border-light bg-dark hover:border-secondary'
                  }`}
                  onClick={() => handleSelectTier(tierKey)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary saturate-150 contrast-150 text-light text-sm font-bold px-4 py-2 rounded-full flex items-center shadow-lg">
                        <FaCrown className="mr-2" size={14} />
                        POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-light mb-2">{tier.name}</h3>
                    <div className="mb-3">
                      <span className="text-4xl font-bold text-secondary">{tier.price}</span><br/>
                      <span className="text-lg text-light-secondary ml-2">{tier.period}</span>
                    </div>
                    <p className="text-sm text-light-secondary">{tier.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-light">
                        <FaCheck className="text-secondary mr-3 flex-shrink-0" size={14} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectTier(tierKey)}
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-xl font-medium text-base transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed mt-auto ${tier.buttonStyle}`}
                  >
                    {isSubmitting ? 'Please wait...' : tier.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TierSelectionModal; 