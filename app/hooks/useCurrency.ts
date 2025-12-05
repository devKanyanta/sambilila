// hooks/useCurrency.ts

import { useState, useEffect } from 'react';
import { Currency, detectUserCurrency, convertPrice, formatPrice, formatPriceWithPeriod } from '@/lib/currency';

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

export function useCurrency() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      // First, try to get location from IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const countryCode = data.country_code || 'US';
      const currency = detectUserCurrency(countryCode);
      
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