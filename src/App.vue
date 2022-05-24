<template>
    <div id="app">
        <b-navbar toggleable>
            <b-navbar-toggle class="navbar-toggler" target="sidebar-variant">
            </b-navbar-toggle>
            <div class="text-center d-flex justify-content-start">
                <img src="img/logo.svg" alt="Twentyfour" style="width: 3em" class="mx-2" />
                <h1>Twenty four</h1>
            </div>
        </b-navbar>
        <b-sidebar id="sidebar-variant" title="Settings" bg-variant="white" text-variant="dark" shadow>
            <div class="px-3 py-2">
                <app-settings></app-settings>
            </div>
        </b-sidebar>
        <b-container fluid>
            <router-view />
        </b-container>
    </div>

</template>

<script type='ts'>
import { Component, Vue } from 'vue-property-decorator';
import AppSettings from '@/components/AppSettings';

@Component({
    components: { AppSettings },
})
export default class App extends Vue {
    async mounted() {
        this.$root.$on('settingsChanged', async () => {
            await this.$store.dispatch('computed/reset');
        });
        await this.$store.dispatch('computed/reset');
    }
}
</script>

