import type { Store } from 'vuex';
import type { State } from '@/store';

// Помощник перезагрузки
export const restartDispatchHelper = (store: Store<State>): void => {
  store
    .dispatch('layout/setLayoutState', {
      field: 'isReload',
      value: true,
    })
    .then(() => {
      store.dispatch('layout/reload').then(() => {
        store.dispatch('api/reload').then(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.location.reload(true);
        });
      });
    });
};
