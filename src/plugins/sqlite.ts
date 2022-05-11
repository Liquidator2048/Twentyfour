import Vue from 'vue';
import * as SQLite from 'wa-sqlite';
import SQLiteAsyncESMFactory from '@/wa-sqlite/wa-sqlite-async.mjs';
import { IpfsAsyncVFS } from '@/IpfsAsyncVFS';


declare module 'vue/types/vue' {
    interface Vue {
        $sqlite: SQLiteAPI;
    }
}
export const SqlitePlugin: Vue.PluginObject<any> = {
    install(Vue, config?) {
        Vue.prototype.$sqlite = SQLiteAsyncESMFactory().then(asyncFactory => {
            const sqlite = SQLite.Factory(asyncFactory);
            Vue.prototype.$sqlite = sqlite;
            Vue.prototype.$ipfs.then(() => {
                sqlite.vfs_register(new IpfsAsyncVFS(Vue.prototype.$ipfs));
            });
            return sqlite;
        });
    },
};

const config = {};


Vue.use(SqlitePlugin, config);
