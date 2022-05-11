import Vue from 'vue';
import * as IPFSCore from 'ipfs-core';


declare module 'vue/types/vue' {
    interface Vue {
        $ipfs: IPFSCore.IPFS;
    }
}
export const IpfsPlugin: Vue.PluginObject<IPFSCore.Options> = {
    install(Vue, config?) {
        console.log('loading ipfs plugin ...');
        Vue.prototype.$ipfs = IPFSCore.create(config).then(async ipfs => {
            Vue.prototype.$ipfs = ipfs;
            console.log('starting ipfs plugin');
            await ipfs.start();
            return ipfs;
        });
    },
};

const config: IPFSCore.Options = {
    start: false,
    EXPERIMENTAL: { ipnsPubsub: true },
    config: { Pubsub: { Enabled: true } },
};


Vue.use(IpfsPlugin, config);
