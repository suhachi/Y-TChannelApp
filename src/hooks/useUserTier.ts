import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import type { UserTier } from '../types';

export function useUserTier() {
  const [tier, setTier] = useState<UserTier>('basic');

  useEffect(() => {
    const savedTier = storage.getUserTier();
    setTier(savedTier);
  }, []);

  const upgradeToPro = () => {
    storage.setUserTier('pro');
    setTier('pro');
  };

  const downgradeToBasic = () => {
    storage.setUserTier('basic');
    setTier('basic');
  };

  return {
    tier,
    isPro: tier === 'pro',
    isBasic: tier === 'basic',
    upgradeToPro,
    downgradeToBasic,
  };
}
