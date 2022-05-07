<template>
  <div class='about'>
    <div v-if='loading'>
      <h3>Loading ...</h3>
      <p v-if='status'>{{ status }}</p>
    </div>
    <div v-else-if='error'>
      <h3>Ops ... Something goes terribly wrong ...</h3>
      <p><small v-if='status'>{{ status }}</small></p>
      <b-button @click='init' class='mx-1'>Try again</b-button>
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
import SQLiteAsyncESMFactory from '../wa-sqlite/wa-sqlite-async.mjs';
import { IpfsAsyncVFS } from '@/IpfsAsyncVFS';
import * as IPFSCore from 'ipfs-core';
import { IPFS } from 'ipfs-core';

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
  public sqlite3: SQLiteAPI | null = null;
  public db!: number;
  public searchTerm: string | null = null;
  private ipfs!: IPFS;
  private db_cid = process.env.VUE_APP_DB_CID;

  async mounted() {
    this.loading = true;
    this.error = false;
    await this.init();
  }

  async init() {
    try {
      console.log('mounted');
      this.db_cid = localStorage.getItem('DB_CID') || this.db_cid;
      console.log('ipfs create ...');
      this.ipfs = await IPFSCore.create({ start: false });
      console.log('ipfs start ...');
      await this.ipfs.start();
      console.log('ipfs started');

      console.log('opening db ...');
      this.sqlite3 = SQLite.Factory(await SQLiteAsyncESMFactory());
      this.sqlite3.vfs_register(new IpfsAsyncVFS(this.ipfs));
      this.db = await this.sqlite3.open_v2(this.db_cid, undefined, 'ipfs-async');
      this.srch.str = this.sqlite3.str_new(this.db, this.srch.sql);
      this.srch.prepared = await this.sqlite3.prepare_v2(this.db, this.sqlite3.str_value(this.srch.str));
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

  async pinDatabase() {
    await this.ipfs.pin.add(this.db_cid);
  }

  async beforeDestroy() {
    console.log('bye bye');
    await this.ipfs?.stop();
    await this.sqlite3?.close(this.db);
    if (this.srch.prepared !== null)
      await this.sqlite3?.finalize(this.srch.prepared.stmt);
  }

  async search() {
    try {
      this.rows = [];
      this.searching = true;

      if (this.sqlite3 != null) {
        if (this.srch.prepared?.stmt == null) return;
        await this.sqlite3.reset(this.srch.prepared.stmt);
        this.sqlite3.bind_collection(
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
    if (this.sqlite3 == null) return;
    if (this.srch.prepared == null) return;
    const limit = this.rows.length + 100;
    this.srch.hasMore = await this.sqlite3.step(this.srch.prepared.stmt) === SQLite.SQLITE_ROW;
    do {
      let row = this.sqlite3.row(this.srch.prepared.stmt);
      if (row.length > 0)
        this.rows.push(Object.fromEntries(this.srch.columns.map((_, i) => [this.srch.columns[i], row[i]])));
      this.srch.hasMore = await this.sqlite3.step(this.srch.prepared.stmt) === SQLite.SQLITE_ROW && row.length > 0;
    } while (this.srch.hasMore && this.rows.length < limit);
  }

  async loadMore() {
    if (!this.srch.hasMore) return;
    await this.loadResults();
  }
}
</script>

