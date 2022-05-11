<template>
    <div class='about'>
        <div v-if='loading'>
            <h3>Loading ...</h3>
            <p v-if='status'>{{ status }}</p>
        </div>
        <div v-else-if='error'>
            <h3>Ops ... Something goes terribly wrong ...</h3>
            <p><small v-if='status'>{{ status }}</small></p>
            <b-button @click='refresh' class='mx-1'>Try again</b-button>
            <b-button @click='reload' class='mx-1'>Damn... reload!</b-button>
        </div>
        <div v-else>
            <b-input-group class='mt-3'>
                <b-form-input type='search' placeholder='Search'
                              v-model='searchTerm'
                              aria-label='Search'
                              aria-describedby='search-addon'></b-form-input>
                <b-input-group-append>
                    <b-button variant='outline-primary'
                              @click='search'
                              :disabled='!searchTerm'>
                        Search
                    </b-button>
                </b-input-group-append>
            </b-input-group>
            <p v-if='searching'>searching ...</p>

            <b-list-group>
                <b-list-group-item class='flex-column align-items-start' v-for='row in rows' :key='row.magnet'
                                   :href='row.magnet'>
                    <div class='d-flex w-100 justify-content-between'>
                        <!-- title -->
                        <h5 class='mb-1'>{{ row.title }}</h5>
                        <!-- date -->
                        <small>{{ row.date }}</small>
                    </div>
                    <!-- info -->
                    <p class='mb-1'>
                        {{ row.info }}
                    </p>
                </b-list-group-item>
            </b-list-group>
            <div class='my-2' v-if='srch.hasMore'>
                <b-button @click='loadMore'>Load more</b-button>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as SQLite from 'wa-sqlite';

@Component
export default class Home extends Vue {
    @Prop() private msg!: string;
    public loading = false;
    public searching = false;
    public srch: {
        prepared: { stmt: number, sql: number } | null,
        str: number | null,
        sql: string,
        hasMore: boolean,
        columns: string[]
    } = {
        prepared: null,
        str: null,
        sql: `
            SELECT t.magnet, t.title, t.info, t.date
            FROM torrents t
            WHERE title MATCH @search
               OR info MATCH @search
        `,
        hasMore: false,
        columns: ['magnet', 'title', 'info', 'date'],
    };
    public error = false;
    public status = '';
    public rows: { [key: string]: SQLiteCompatibleType }[] = [];
    public db!: number;
    public searchTerm: string | null = null;
    private db_cid = process.env.VUE_APP_DB_CID;
    private db_path = process.env.VUE_APP_DB_PATH;

    async mounted() {
        this.loading = true;
        this.error = false;
        await this.$ipfs;
        await this.$sqlite;
        console.log('this.$sqlite', this.$sqlite);
        await this.init();
    }

    async init() {
        try {
            this.db_cid = localStorage.getItem('DB_CID') || this.db_cid;
            if (localStorage.getItem('DB_CID')) {
                this.db_cid = localStorage.getItem('DB_CID');
            } else {
                const response = await this.$ipfs.name.resolve(this.db_path);
                this.db_cid = (await response[Symbol.asyncIterator]().next()).value;
            }
            this.db = await this.$sqlite.open_v2(this.db_cid, undefined, 'ipfs-async');
            this.srch.str = this.$sqlite.str_new(this.db, this.srch.sql);
            this.srch.prepared = await this.$sqlite.prepare_v2(this.db, this.$sqlite.str_value(this.srch.str));
            this.loading = false;
        } catch (error) {
            this.error = true;
            this.status = `${error}`;
            console.error(error);
        } finally {
            this.loading = false;
            this.$forceUpdate();
        }
    }

    reload() {
        location.reload();
    }

    async refresh() {
        this.loading = true;
        this.error = false;
        this.status = '';
        await this.init();
    }

    async pinDatabase() {
        await this.$ipfs.pin.add(this.db_cid);
    }

    async beforeDestroy() {
        console.log('bye bye');
        await this.$sqlite?.close(this.db);
        if (this.srch.prepared !== null)
            await this.$sqlite?.finalize(this.srch.prepared.stmt);
    }

    async search() {
        try {
            this.rows = [];
            this.searching = true;

            if (this.$sqlite != null) {
                if (this.srch.prepared?.stmt == null) return;
                await this.$sqlite.reset(this.srch.prepared.stmt);
                this.$sqlite.bind_collection(
                    this.srch.prepared.stmt,
                    { '@search': this.searchTerm },
                );
                await this.loadResults();
            }
        } finally {
            this.searching = false;
            this.$forceUpdate();
        }
    }

    async loadResults() {
        if (this.$sqlite == null) return;
        if (this.srch.prepared == null) return;
        const limit = this.rows.length + 100;
        this.srch.hasMore = await this.$sqlite.step(this.srch.prepared.stmt) === SQLite.SQLITE_ROW;
        do {
            let row = this.$sqlite.row(this.srch.prepared.stmt);
            if (row.length > 0)
                this.rows.push(Object.fromEntries(this.srch.columns.map((_, i) => [this.srch.columns[i], row[i]])));
            this.srch.hasMore = await this.$sqlite.step(this.srch.prepared.stmt) === SQLite.SQLITE_ROW && row.length > 0;
        } while (this.srch.hasMore && this.rows.length < limit);
    }

    async loadMore() {
        if (!this.srch.hasMore) return;
        await this.loadResults();
    }
}
</script>

