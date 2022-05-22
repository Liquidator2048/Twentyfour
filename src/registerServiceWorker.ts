/* eslint-disable no-console */

import { register } from 'register-service-worker';

console.log('[registerServiceWorker.ts] service worker path', `${process.env.BASE_URL}service-worker.js`);
register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
        console.log(
            '[registerServiceWorker.ts] App is being served from cache by a service worker.\n' +
            'For more details, visit https://goo.gl/AFskqB',
        );
    },
    registered() {
        console.log('[registerServiceWorker.ts] Service worker has been registered.');
    },
    cached() {
        console.log('[registerServiceWorker.ts] Content has been cached for offline use.');

    },
    updatefound(up) {
        console.log('[registerServiceWorker.ts] New content is downloading.', up);
    },
    updated(registration) {
        console.log('[registerServiceWorker.ts] New content is available');
        registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
        location.reload();
    },
    offline() {
        console.log('[registerServiceWorker.ts] No internet connection found. App is running in offline mode.');
    },
    error(error) {
        console.error('[registerServiceWorker.ts] Error during service worker registration:', error);
    },
});
