<template>
    <div>
        <div class="text-center" v-if="LOADING">
            <h3>Loading ...</h3>
            <p v-if="ERROR_MESSAGE">{{ ERROR_MESSAGE }}</p>
        </div>
        <div class="text-center" v-else-if="HAS_ERROR">
            <h3>Ops ... Something goes terribly wrong ...</h3>
            <p>
                <small v-if="ERROR_MESSAGE">{{ ERROR_MESSAGE }}</small>
            </p>
            <b-button @click="refresh" class="mx-1">Try again</b-button>
            <b-button @click="reload" class="mx-1">Damn... reload!</b-button>
        </div>
        <b-container v-else class="text-center">
            <b-form-textarea
                id="textarea"
                v-model="sqlQuery"
                placeholder="SQL Query here ..."
                rows="6"
                max-rows="50"
            ></b-form-textarea>
            <b-button @click="backClicked" class="m-2">Back</b-button>
            <b-button @click="refresh" class="m-2" variant="outline-danger">Reset</b-button>
            <b-button @click="executeQuery" class="m-2" variant="success" :disabled="SEARCHING || LOADING">
                Execute
            </b-button>
        </b-container>
        <div>
            <b-table :items="SEARCH_RESULTS">
                <template #cell()="data">
                    <span v-if="data && isMagnet(data.value)">
                          <b-button :href="data.value"
                                    variant="outline-secondary"
                                    title="Magnet link"
                                    :id="'magnet-'+data.index">
                            <b-icon icon="download"></b-icon>
                          </b-button>
                          <b-popover :target="'magnet-'+data.index"
                                     triggers="hover"
                                     placement="right">
                            <template #title>Magnet link</template>
                            <div class="text-center">
                                <p>{{ data.value }}</p>
                                <b-button variant="outline-secondary" size="sm"
                                          title="Copy to clipboard"
                                          @click="toClipboard(data.value)">
                                    <b-icon icon="clipboard"></b-icon>
                                </b-button>
                            </div>
                          </b-popover>
                    </span>
                    <span v-else-if="isCatId(data)" class="text-nowrap">
                        {{ data.value }} - {{ getCategoryById(data.value).value }}
                    </span>
                    <span v-else>
                        {{ data.value }}
                    </span>
                </template>
            </b-table>
            <div class="my-2" v-if="hasMore && !SEARCHING" ref="loadMore">
                <b-button @click="loadResults" v-b-visible="loadMoreVisible">Load more</b-button>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import { Category } from '@/store/computed/types';

@Component
export default class Advanced extends Vue {
    public sqlQuery = `SELECT t.magnet, t.title, t.info, t.date, t.cat_id
FROM torrents t
WHERE title MATCH 'something'
`;

    private created(): void {
        console.log('[Advanced.ts] created');
    }

    private async mounted(): Promise<void> {
        await this.$store.dispatch('computed/resetResults');
    }

    private async beforeDestroy(): Promise<void> {
        console.log('[Advanced.ts] unmounting ...');
        await this.$store.dispatch('computed/resetResults');
    }

    public reload() {
        location.reload();
    }

    public async refresh() {
        await this.$store.dispatch('computed/reset');
        this.$store.commit('computed/SEARCHING_set', false);
        this.$store.commit('computed/RESULTS_set', []);
    }

    public async executeQuery(): Promise<void> {
        await this.$store.dispatch('computed/executeQuery', this.sqlQuery);
    }

    public backClicked() {
        this.$router.push({ name: 'Home' });
    }

    isMagnet(value?: string): boolean {
        if (value && value.startsWith)
            return value.startsWith('magnet:?');
        else
            return false;
    }


    isCatId(data: { value: any, field: { key: string, label: string } }): boolean {
        if (data && data.field && data.field.key) {
            return data.field.key == 'cat_id';
        } else {
            return false;
        }
    }

    public async loadResults() {
        if (this.hasMore && !this.SEARCHING)
            await this.$store.dispatch('computed/loadResults');
    }

    public async loadMoreVisible(isVisible?: boolean) {
        if (isVisible) {
            await this.loadResults();
        }
    }

    public getCategoryById(id: number): Category | null {
        return this.$store.getters['computed/CATEGORY_BY_ID'](id);
    }

    public toClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    get LOADING(): boolean {
        return this.$store.getters.LOADING;
    }

    get hasMore() {
        return this.$store.state.computed.SEARCH.hasMore;
    }

    get SEARCH_RESULTS() {
        return this.$store.state.computed.SEARCH_RESULTS;
    }

    get SEARCHING(): boolean {
        return this.$store.getters['computed/SEARCHING'];
    }

    get ERROR_MESSAGE(): string | null {
        return this.$store.state.ERROR_MESSAGE;
    }

    get HAS_ERROR(): boolean {
        return this.$store.state.HAS_ERROR;
    }
}
</script>
