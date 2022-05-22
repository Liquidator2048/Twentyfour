import * as IPFSCore from 'ipfs-core';
import { clientsClaim, skipWaiting } from 'workbox-core';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

let ipfs: IPFSCore.IPFS;

precacheAndRoute((self as any).__WB_MANIFEST);
skipWaiting();
clientsClaim();

async function ipfsInit() {
    if (!ipfs) {
        console.log('[sw] ipfs creating ....');
        ipfs = await IPFSCore.create();
    }
}

async function getIpfsFile(ipfsPath: string): Promise<Uint8Array> {
    const fileStat = await ipfs.files.stat(`${ipfsPath}`);
    console.log('File stats', fileStat);
    const fileSize = fileStat.size;
    let tmpSize = 0;
    const file = new Uint8Array(fileSize);
    for await (const f of await ipfs.cat(ipfsPath)) {
        file.set(f, tmpSize);
        tmpSize += f.length;
        console.log(`${((tmpSize / fileSize) * 100).toFixed(2)}% ( ${tmpSize}/${fileSize} )`, f.length);
    }
    return file;
}

const initialize = (service: ServiceWorkerGlobalScope): void => {
    service.addEventListener('activate', async (event: ExtendableEvent) => {
        console.log('[sw] activate', event);
        await ipfsInit();
    });
    service.addEventListener('install', async (event: ExtendableEvent) => {
        console.log('[sw] install', event);
        await service.skipWaiting();
    });

    registerRoute(
        // Check to see if the request's destination is style for stylesheets, script for JavaScript, or worker for web worker
        ({ request }) => {
            return request.destination === 'style' ||
                request.destination === 'script' ||
                request.destination === 'worker';
        },
        // Use a Stale While Revalidate caching strategy
        new StaleWhileRevalidate({
            // Put all cached files in a cache named 'assets'
            cacheName: 'assets',
            plugins: [
                // Ensure that only requests that result in a 200 status are cached
                new CacheableResponsePlugin({
                    statuses: [200],
                }),
            ],
        }),
    );

    registerRoute((args) => console.log('[sw] request', args));
    registerRoute(
        ({ url }) => (url.host == 'ipfs.io' && url.pathname.startsWith('/ipfs')),
        async ({ request, url }) => {
            console.log('[sw] ipfs.io', request);
            await ipfsInit();
            const response = await getIpfsFile(url.pathname);
            return new Response(response);
            //return new Response(null, { status: 404, statusText: 'Not found' });
        },
    );
};

initialize(self as any);
