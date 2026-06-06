// hooks/useCurrency.ts

import { useState, useEffect, useRef } from 'react';
import { Currency, detectUserCurrency, convertPrice, formatPrice, formatPriceWithPeriod } from '@/lib/currency';

const LOCATION_CACHE_KEY = 'currencyLocationCache';
const LOCATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface UserLocation {
  countryCode: string;
  currency: Currency;
}

interface PriceInfo {
  originalPriceUSD: number;
  convertedPrice: number;
  displayPrice: string;
  displayWithPeriod: string;
  currency: Currency;
}

interface LocationCache {
  countryCode: string;
  expiresAt: number;
}

function inferCountryCodeFromClient(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone === 'Africa/Lusaka') {
    return 'ZM';
  }

  const locale = navigator.language || '';
  if (locale.toUpperCase().endsWith('-ZM')) {
    return 'ZM';
  }

  return 'US';
}

export function useCurrency() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasDetectedRef = useRef(false);

  useEffect(() => {
    if (hasDetectedRef.current) {
      return;
    }

    hasDetectedRef.current = true;
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      const cachedRaw = window.localStorage.getItem(LOCATION_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as LocationCache;
        const isCacheValid = typeof cached?.countryCode === 'string' && typeof cached?.expiresAt === 'number' && cached.expiresAt > Date.now();

        if (isCacheValid) {
          const normalizedCountryCode = cached.countryCode.toUpperCase();
          const currency = detectUserCurrency(normalizedCountryCode);
          setUserLocation({
            countryCode: normalizedCountryCode,
            currency
          });
          return;
        }

        window.localStorage.removeItem(LOCATION_CACHE_KEY);
      }

      // Use a local API route to avoid browser CORS issues with upstream geo IP providers.
      const response = await fetch('/api/location', { cache: 'no-store' });
      const data = await response.json();

      const fallbackCountryCode = inferCountryCodeFromClient();
      const apiCountryCode = typeof data.countryCode === 'string' ? data.countryCode.toUpperCase() : null;
      const countryCode = data?.source === 'fallback'
        ? fallbackCountryCode
        : (apiCountryCode || fallbackCountryCode);
      const currency = detectUserCurrency(countryCode);

      if (data?.source !== 'fallback') {
        const locationCache: LocationCache = {
          countryCode,
          expiresAt: Date.now() + LOCATION_CACHE_TTL_MS,
        };

        window.localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
      }

      setUserLocation({
        countryCode,
        currency
      });
    } catch (error) {
      console.error('Error detecting location:', error);
      // Fallback to USD
      setUserLocation({
        countryCode: 'US',
        currency: 'USD'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceInfo = (priceInUSD: number, period: string): PriceInfo => {
    if (!userLocation) {
      // Return USD as default while loading
      const convertedPrice = convertPrice(priceInUSD, 'USD');
      const displayPrice = formatPrice(convertedPrice, 'USD');
      
      return {
        originalPriceUSD: priceInUSD,
        convertedPrice,
        displayPrice,
        displayWithPeriod: formatPriceWithPeriod(displayPrice, period),
        currency: 'USD'
      };
    }

    const convertedPrice = convertPrice(priceInUSD, userLocation.currency);
    const displayPrice = formatPrice(convertedPrice, userLocation.currency);
    
    return {
      originalPriceUSD: priceInUSD,
      convertedPrice,
      displayPrice,
      displayWithPeriod: formatPriceWithPeriod(displayPrice, period),
      currency: userLocation.currency
    };
  };

  return {
    userLocation,
    isLoading,
    getPriceInfo,
    currency: userLocation?.currency || 'USD',
    isZambian: userLocation?.currency === 'ZMW'
  };
}