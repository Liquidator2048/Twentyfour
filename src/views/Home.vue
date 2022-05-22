<template>
    <div>
        <div v-if="LOADING" class="text-center">
            <h3>Loading ...</h3>
            <p v-if="ERROR_MESSAGE">{{ ERROR_MESSAGE }}</p>
        </div>
        <div v-else-if="HAS_ERROR">
            <h3>Ops ... Something goes terribly wrong ...</h3>
            <p>
                <small v-if="ERROR_MESSAGE">{{ ERROR_MESSAGE }}</small>
            </p>
            <b-button @click="refresh" class="mx-1">Try again</b-button>
            <b-button @click="reload" class="mx-1">Damn... reload!</b-button>
        </div>
        <div v-else>
            <b-form @submit="search">
                <b-input-group class="mt-3">
                    <b-form-input
                        type="search"
                        placeholder="Search"
                        v-model="searchTerm"
                        aria-label="Search"
                    ></b-form-input>
                    <b-input-group-append>
                        <b-dropdown
                            :text="category.value"
                            variant="outline-secondary"
                        >
                            <b-dropdown-item @click="selectCategory()"
                            >No filter
                            </b-dropdown-item
                            >
                            <b-dropdown-divider></b-dropdown-divider>
                            <b-dropdown-item
                                @click="selectCategory(cat)"
                                v-for="cat in CATEGORIES"
                                :key="cat.id"
                            >
                                {{ cat.value }}
                            </b-dropdown-item>
                        </b-dropdown>
                        <b-button @click="advancedClicked">+</b-button>
                        <b-button
                            variant="outline-primary"
                            @click="search"
                            :disabled="!searchTerm || SEARCHING"
                        >
                            Search
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-form>
            <p v-if="SEARCHING">searching ...</p>

            <b-list-group class="my-2">
                <b-list-group-item
                    class="flex-column align-items-start"
                    v-for="row in SEARCH_RESULTS"
                    :key="row.magnet"
                    :href="row.magnet"
                >
                    <div class="d-flex w-100 justify-content-between">
                        <!-- category -->
                        <p>
                            {{ getCategoryById(row.cat_id).value }}
                        </p>
                        <!-- date -->
                        <small>{{ row.date }}</small>
                    </div>
                    <div class="d-flex w-100 justify-content-between">
                        <!-- title -->
                        <h5 class="mb-1">{{ row.title }}</h5>
                        <!-- info -->
                        <p class="mb-1">
                            {{ row.info }}
                        </p>
                    </div>
                </b-list-group-item>
            </b-list-group>
            <div class="my-2" v-if="hasMore && !SEARCHING" ref="loadMore">
                <b-button @click="loadResults" v-b-visible="loadMoreVisible">Load more</b-button>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import { Category } from '@/store/types';

const noCategory = { id: null, value: 'Category' };
@Component
export default class Home extends Vue {
    public searchTerm: string | null = null;
    public category: Category = noCategory;

    async mounted() {
        await this.$store.dispatch('computed/resetResults');
    }

    public reload() {
        location.reload();
    }

    public async refresh() {
        await this.$store.dispatch('computed/reset');
    }

    public async search(event: Event | undefined) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        if (this.SEARCHING) {
            return;
        }
        if (!this.searchTerm) {
            return;
        }
        if (this.category.id === null) {
            await this.$store.dispatch('computed/search', {
                search: this.searchTerm,
            });
        } else {
            await this.$store.dispatch('computed/search', {
                search: this.searchTerm,
                catId: this.category.id,
            });
        }
    }

    public selectCategory(category?: Category) {
        if (!category) {
            this.category = noCategory;
        } else {
            this.category = category;
        }
    }

    public getCategoryById(id: number): Category {
        return this.$store.getters['computed/CATEGORY_BY_ID'](id) ?? { value: null, id: null };
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

    public advancedClicked() {
        this.$router.push({ name: 'Advanced' });
    }

    get DB(): number {
        return this.$store.state.computed.DB;
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

    get CATEGORIES(): Category[] {
        return this.$store.state.computed.CATEGORIES;
    }
}
</script>
