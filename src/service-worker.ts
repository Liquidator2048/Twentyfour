import * as IPFSCore from 'ipfs-core';
import { clientsClaim, skipWaiting } from 'workbox-core';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

let ipfs: Promise<IPFSCore.IPFS>;

precacheAndRoute((self as any).__WB_MANIFEST);
skipWaiting();
clientsClaim();

function ipfsInit(): void {
    if (!ipfs) {
        console.log('[service-worker.ts] ipfs creating ....');
        ipfs = IPFSCore.create();
    }
}

async function getIpfs(): Promise<IPFSCore.IPFS> {
    ipfsInit();
    return await ipfs;
}

async function getIpfsFile(ipfsPath: string): Promise<Uint8Array> {
    const fileStat = await (await getIpfs()).files.stat(`${ipfsPath}`);
    console.debug('[service-worker.ts] IPFS file stats', fileStat);
    const fileSize = fileStat.size;
    let tmpSize = 0;
    const file = new Uint8Array(fileSize);
    for await (const f of await (await getIpfs()).cat(ipfsPath)) {
        file.set(f, tmpSize);
        tmpSize += f.length;
        console.debug(`[service-worker.ts] ${fileStat} ${((tmpSize / fileSize) * 100).toFixed(2)}% ( ${tmpSize}/${fileSize} )`, f.length);
    }
    return file;
}

const initialize = (service: ServiceWorkerGlobalScope): void => {
    service.addEventListener('activate', async (event: ExtendableEvent) => {
        console.debug('[service-worker.ts] activate', event);
        ipfsInit();
    });
    /*
    service.addEventListener('sync', async () => {
        console.log('[service-worker.ts] sync - starting ipfs ...');
        await getIpfs();
    });
    service.addEventListener('periodicsync', async () => {
        console.log('[service-worker.ts] periodicsync - starting ipfs ...');
        await getIpfs();
    });
    service.addEventListener('push', async () => {
        console.log('[service-worker.ts] push - starting ipfs ...');
        await getIpfs();
    });
    */

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

    registerRoute(
        ({ url }) => url.pathname.startsWith('/ipfs/'),
        async ({ request, url }) => {
            console.debug('[service-worker.ts] ipfs.io', request);
            await ipfsInit();
            const response = await getIpfsFile(url.pathname);
            return new Response(response);
            //return new Response(null, { status: 404, statusText: 'Not found' });
        },
    );
};

initialize(self as any);
