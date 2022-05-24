<template>
    <div>
        <b-form @submit="onSubmit">
            <!-- WEB3_USE_BROWSER_PROVIDER -->
            <b-form-group label-for="WEB3_USE_BROWSER_PROVIDER"
                          description="Use browser wallet as Web3 provider ( Ex: Metamask )">
                <b-form-checkbox v-model="WEB3_USE_BROWSER_PROVIDER.value"
                                 id="WEB3_USE_BROWSER_PROVIDER"
                                 name="check-button" switch>
                    Use in-browser Web3 provider
                </b-form-checkbox>
            </b-form-group>
            <!-- WEB3_RPC -->
            <b-form-group
                label="Web3 RPC"
                label-for="WEB3_RPC"
                description="Web3 RCP Url"
                v-if="!WEB3_USE_BROWSER_PROVIDER.value"
            >
                <b-form-input
                    id="WEB3_RPC"
                    v-model="WEB3_RPC.value"
                    type="url"
                    placeholder="Enter WEB3 RCP url"
                ></b-form-input>
            </b-form-group>
            <!-- IPFS_USE_LOCAL_NODE -->
            <b-form-group label-for="IPFS_USE_LOCAL_NODE"
                          description="You have to configure CORS in order to use with this site">
                <b-form-checkbox v-model="IPFS_USE_LOCAL_NODE.value"
                                 id="IPFS_USE_LOCAL_NODE"
                                 name="check-button" switch>
                    Use an external ipfs host
                </b-form-checkbox>
            </b-form-group>
            <!-- IPFS_HOST -->
            <b-form-group
                label="IPFS Host"
                label-for="IPFS_HOST"
                description="Examples: http://localhost:5001 or /ip4/127.0.0.1/tcp/5001"
                v-if="IPFS_USE_LOCAL_NODE.value"
            >
                <b-form-input
                    id="IPFS_HOST"
                    v-model="IPFS_HOST.value"
                    type="text"
                    placeholder="Enter IPFS Url"
                ></b-form-input>
            </b-form-group>
            <b-button type="submit">Save</b-button>
        </b-form>
        <div class="my-2">
            <a @click.prevent="downloadDb" href="#" v-if="!dbDownloading">Download db</a>
            <b-spinner label="Loading ..." v-else></b-spinner>
        </div>
    </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { RootState } from '@/store/root/types';


class Value<T> {
    private name: string;
    private store: Store<RootState>;
    private onChange?: CallableFunction;

    constructor(name: string, store: Store<RootState>, onChange?: CallableFunction) {
        this.name = name;
        this.store = store;
        this.onChange = onChange;
    }

    get value(): T {
        return this.store.state[this.name];
    }

    set value(val: T) {
        this.store.commit(`${this.name}_set`, val);
        if (this.onChange)
            this.onChange();
    }


}

@Component
export default class AppSettings extends Vue {

    public IPFS_USE_LOCAL_NODE: Value<boolean> = new Value<boolean>('IPFS_USE_LOCAL_NODE', this.$store);
    public IPFS_HOST: Value<string> = new Value<string>('IPFS_HOST', this.$store);
    public WEB3_USE_BROWSER_PROVIDER: Value<boolean> = new Value<boolean>('WEB3_USE_BROWSER_PROVIDER', this.$store);
    public WEB3_RPC: Value<string> = new Value<string>('WEB3_RPC', this.$store);

    onSubmit(e?: Event) {
        if (e && e.preventDefault)
            e.preventDefault();
        this.$root.$emit('settingsChanged');
    }

    private dbDownloading = false;

    async downloadDb() {
        try {
            this.dbDownloading = true;
            const dbCID = await this.$store.getters['computed/getDBPathfromWeb3'];
            const resp = await fetch(`https://ipfs.io${dbCID}`);
            (
                (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'twentyfour.db';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }
            )(await resp.blob());
        } catch (error) {
            this.$bvToast.toast(`${error}`, {
                title: 'Error downloading database',
                autoHideDelay: 5000,
            });
        } finally {
            this.dbDownloading = false;
        }
    }
}
</script>

<style scoped>

</style>
