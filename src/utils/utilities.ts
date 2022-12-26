// Useful functions
//////////////////////////////////////////////////////

// Constants
import { DESIGN } from '@/utils/constants';

// Types
import type { Store } from 'vuex';
import type { State } from '@/store';

// Layout

// Экранный помощник
export const ScreenHelper = (() => {
  const DESKTOP = DESIGN.BREAKPOINTS.desktop;

  const isDesktop = () => {
    return window.matchMedia(`(min-width: ${DESKTOP}px)`).matches;
  };

  const isBro = () => {
    const isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isYandex = navigator.userAgent.search(/YaBrowser/) > 0;
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    return isChrome || isYandex || isFirefox;
  };

  return {
    isDesktop,
    isBro,
  };
})();

// Помощник перезагрузки
export const restartDispatchHelper = (store: Store<State>): void => {
  store
    .dispatch('layout/setField', {
      field: 'isReload',
      value: true,
    })
    .then(() => {
      window.location.reload(true);
    })
    .catch((error) => {
      console.log(error);
    });
};
