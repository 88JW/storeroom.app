// 🚀 PWA Hook - Progressive Web App functionality

import { useState, useEffect } from 'react';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export interface PWAHookResult {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isServiceWorkerReady: boolean;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => Promise<void>;
}

export const usePWA = (): PWAHookResult => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // 🌐 Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 PWA: Online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('📴 PWA: Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 📱 Detect if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      // PWA is installed if display-mode is standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = isIOS && Boolean((window.navigator as { standalone?: boolean }).standalone);
      
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkInstalled();
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(checkInstalled);
    
    return () => mediaQuery.removeListener(checkInstalled);
  }, []);

  // 🔧 Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    } else {
      console.warn('🚫 PWA: Service Worker not supported');
    }
  }, []);

  // 📥 Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📥 PWA: Install prompt available');
      e.preventDefault();
      setInstallPrompt(e as unknown as PWAInstallPrompt);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('🔧 PWA: Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ PWA: Service Worker registered:', registration.scope);
      setIsServiceWorkerReady(true);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('🆕 PWA: Update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📦 PWA: Update ready');
              setUpdateAvailable(true);
              setWaitingWorker(newWorker);
            }
          });
        }
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('💬 PWA: Message from SW:', event.data);
        
        if (event.data.type === 'CACHE_UPDATED') {
          console.log('🔄 PWA: Cache updated');
        }
      });

    } catch (error) {
      console.error('❌ PWA: Service Worker registration failed:', error);
    }
  };

  const installApp = async (): Promise<void> => {
    if (!installPrompt) {
      console.warn('🚫 PWA: No install prompt available');
      return;
    }

    try {
      console.log('📱 PWA: Installing app...');
      await installPrompt.prompt();
      
      const choiceResult = await installPrompt.userChoice;
      console.log('🎯 PWA: User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setInstallPrompt(null);
      
    } catch (error) {
      console.error('❌ PWA: Install failed:', error);
    }
  };

  const updateApp = async (): Promise<void> => {
    if (!waitingWorker) {
      console.warn('🚫 PWA: No waiting worker available');
      return;
    }

    try {
      console.log('🔄 PWA: Updating app...');
      
      // Tell the waiting SW to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to use the new SW
      window.location.reload();
      
    } catch (error) {
      console.error('❌ PWA: Update failed:', error);
    }
  };

  return {
    isOnline,
    isInstallable,
    isInstalled,
    isServiceWorkerReady,
    installApp,
    updateAvailable,
    updateApp
  };
};
