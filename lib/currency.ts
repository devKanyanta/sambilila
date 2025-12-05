// lib/currency.ts

const USD_TO_ZMW_RATE = 10; // Example exchange rate, update this regularly

export type Currency = 'USD' | 'ZMW';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  locale: string;
  exchangeRate: number;
}

export const currencies: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    exchangeRate: 1
  },
  ZMW: {
    code: 'ZMW',
    symbol: 'ZMW',
    locale: 'en-ZM',
    exchangeRate: USD_TO_ZMW_RATE
  }
};

export function detectUserCurrency(countryCode: string): Currency {
  return countryCode === 'ZM' ? 'ZMW' : 'USD';
}

export function convertPrice(priceInUSD: number, targetCurrency: Currency): number {
  const rate = currencies[targetCurrency].exchangeRate;
  const converted = priceInUSD * rate;
  
  // Round to 2 decimal places for ZMW, or keep as is for USD
  return targetCurrency === 'ZMW' ? Math.round(converted * 100) / 100 : converted;
}

export function formatPrice(price: number, currency: Currency): string {
  const config = currencies[currency];
  
  if (currency === 'ZMW') {
    // Format for Zambian Kwacha
    return `ZMW ${price.toLocaleString('en-ZM', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  // Format for USD
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

export function formatPriceWithPeriod(price: string, period: string): string {
  return `${price} ${period}`;
}