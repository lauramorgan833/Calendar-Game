import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    const currentPlatform = Capacitor.getPlatform();
    
    setIsNative(native);
    setPlatform(currentPlatform);

    if (native) {
      // Configure status bar
      StatusBar.setStyle({ style: Style.Default });
      
      // Configure keyboard
      Keyboard.setAccessoryBarVisible({ isVisible: false });
    }
  }, []);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      await Haptics.impact({ style });
    }
  };

  const hideKeyboard = async () => {
    if (isNative) {
      await Keyboard.hide();
    }
  };

  return {
    isNative,
    platform,
    hapticFeedback,
    hideKeyboard
  };
};