<template>
  <div class="data-table__wrapper">
    <v-data-table
      v-model:expanded="expandedArr"
      :model-value="modelValue"
      :headers="sortedColumns"
      :items="items"
      :search="searchModel"
      class="elevation-1"
      hide-default-footer
      :mobile="$isMobile && settingValue !== 'table'"
      :item-value="itemValue || itemKey"
      :loading="loading"
      loading-text="Загрузка... Подождите немного"
      no-data-text="Не уадлось получить данные"
      no-results-text="Нет совпадений"
      multi-sort
      :show-expand="expand"
      :items-per-page="itemsPerPage"
      :density="dense"
      :item-selectable
      :disable-filtering="disableFiltering"
      :must-sort="disableSort"
      :fixed-header="fixedHeader"
      :height="height"
      :sort-by="sortBy"
      :custom-filter="customFilter"
      :custom-key-sort="customKeySort"
      :expand-on-click
      :page="page"
      :show-select="select"
      :hover="hover"
      :return-object="isReturnObject"
      @update:expanded="expandItem"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template
        v-if="!hideHeader"
        #top="props"
      >
        <slot
          name="top"
          v-bind="props"
        >
          <v-toolbar
            flat
            :height="toolbarHeight"
            color="whiteBlack"
          >
            <div class="data-table-toolbar-content d-flex justify-between ">
              <slot
                v-if="$slots['search']"
                name="search"
              />
              <slot v-else-if="!searchOff">
                <search
                  v-model="searchModel"
                  density="compact"
                  debounce-time="600"
                />
              </slot>
              <v-spacer v-if="$slots['top-button']" />
              <slot
                v-if="$slots['top-button']"
                name="top-button"
                v-bind="props"
              />
            </div>
          </v-toolbar>
          <v-divider />
        </slot>
        <v-divider />
        <div class="data-table__settings d-flex gap-2 align-center my-1">
          <v-menu v-if="$isMobile">
            <template #activator="{ props: menuActivatorProps }">
              <v-btn
                icon="settings"
                variant="text"
                v-bind="menuActivatorProps"
              />
            </template>
            <v-list>
              <v-radio-group v-model="settingValue">
                <v-list-item
                  v-for="(setting, index) in settings"
                  :key="index"
                >
                  <v-radio
                    :value="setting.value"
                    :label="setting.label"
                    @click.stop
                  />
                </v-list-item>
              </v-radio-group>
            </v-list>
          </v-menu>
          <v-menu>
            <template #activator="{ props: colMenuProps }">
              <v-btn
                icon="menu"
                variant="text"
                v-bind="colMenuProps"
              />
            </template>
            <v-list>
              <v-list-item
                v-for="(column, index) in headers"
                :key="index"
              >
                <v-checkbox
                  v-if="column"
                  v-model="columns"
                  :value="column"
                  :label="column.title"
                  density="compact"
                  class="data-table__settings-checkbox"
                  @click.stop
                />
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>

      <template
        v-if="$slots['header']"
        #header="props"
      >
        <slot
          name="header"
          v-bind="props"
        />
      </template>

      <template
        v-for="(slot, i) in Object.keys($slots).filter(v => !['header', 'top'].includes(v))"
        #[slot]="props"
      >
        <slot
          :key="i"
          :name="slot"
          v-bind="props"
        />
      </template>
      <template #no-data>
        <v-alert
          color="primary"
          icon="help"
          class="my-1"
        >
          Нет данных для отображения :(
        </v-alert>
      </template>
      <template #bottom>
        <v-container v-if="!hideFooter">
          <v-row class="pagination-row">
            <v-col
              md="6"
            >
              <v-pagination
                v-model="page"
                :length="pageCount"
                size="small"
              />
            </v-col>
            <v-spacer />
            <v-col
              v-if="items.length > 0"
              md="2"
              class="pagination-value"
            >
              <p>{{ elementsShown - itemsPerPage + 1 }}-{{ elementsShown }} из {{ items.length }}</p>
            </v-col>
            <v-spacer />
            <v-col
              class="pagination-value"
              md="2"
            >
              <v-spacer />
              <p>Строк на странице</p>
            </v-col>
            <v-col
              class="pagination-value-select"
              md="1"
            >
              <v-select
                v-model="itemsPerPage"
                variant="outlined"
                density="compact"
                :items="pagination"
                bg-color="whiteBlack"
              />
            </v-col>
          </v-row>
        </v-container>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Search from '@/components/Search.vue';

export default {
  name: 'DataTable',
  components: {
    Search,
  },
  props: {
    expanded: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
    headers: { type: Array, required: true, default: () => [] },
    items: { type: Array, required: true, default: ()=> [] },
    sortBy: { type: Array, default: () => [] },
    search: { type: String, default: '' },
    itemKey: { type: String, default: 'id' },
    height: { type: String, default: 'auto' },
    loading: { type: Boolean, default: false },
    expand: { type: Boolean, default: false },
    dense: { type: String, default: 'default' },
    disableFiltering: { type: Boolean, default: false },
    disableSort: { type: Boolean, default: false },
    isReturnObject: { type: Boolean, default: true },
    fixedHeader: { type: Boolean, default: false },
    hideHeader: { type: Boolean, default: false },
    hideFooter: { type: Boolean, default: false },
    select: { type: Boolean, default: false },
    hover: { type: Boolean, default: true },
    customFilter: { type: Function || undefined, default: undefined },
    customKeySort: { type: Function || undefined, default: undefined },
    showSearchBtn: { type: Boolean, default: false },
    searchOff: { type: Boolean, default: false },
    itemValue: { type: String, default: '' },
    expandOnClick: { type: Boolean, default: false },
    toolbarHeight: { type: [String, Number], default: 'auto' },
    itemSelectable: { type: [String, Array, Function], default: null },
  },
  data: () => ({
    pagination: [15, 25, 50, 100],
    page: 1,
    itemsPerPage: 15,
    searchModel: '',
    expandedArr: [],
    columns: [],
    settingValue: 'table',
    settings: [ { label: 'таблица', value: 'table' }, { label: 'карточки', value: 'cards' }],
  }),
  computed: {
    $isMobile() {
      return window.innerWidth < 768;
    },
    elementsShown() {
      return this.itemsPerPage * this.page;
    },
    pageCount() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    sortedColumns() {
      const res = [];
      this.columns.forEach(col => {
        if (col.default) {
          if (typeof col.value === 'string') {
            col.key = col.key ?? col.value;
            col.value = null;
          }
          const cb = i => i[col.key] ?? col.default;
          col.value = col.value || cb;
        }
        const idx = this.headers.findIndex(i => {
          const key = i['key'] ? 'key' : 'value';
          return  i[key] === col[key];
        });
        if (idx > -1 && col) {
          res[idx] = col;
        }
      });

      return res.filter(Boolean);
    },
  },
  watch: {
    itemsPerPage() {
      this.page = 1;
    },
    modelValue(newVal) {
      this.$emit('selected', newVal);
    },
    expanded() {
      this.expandedArr = this.expanded;
    },
    expandedArr() {
      this.$emit('update:expandedArr', this.expandedArr);
    },
    headers: {
      handler() {
        this.columns =  [...this.headers];
      },
      immediate: true,
      deep: true,
    },

  },
  created() {
    if (this.hideFooter) {
      this.itemsPerPage = 999999;
    }
    if (this.$isMobile) {
      this.settingValue = 'cards';
    }
  },
  methods: {
    expandItem(e) {
      this.$emit('item-expanded', e);
    },
  },
};
</script>

<style lang="scss">
.v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
  box-shadow: none !important;
  background: #eeeeee;
}
.v-theme--dark .pagination-value  {
  color: inherit;
}
.v-theme--dark .pagination-value-select  {
  background-color: inherit;
}
.pagination-row {
  align-items: center;
  .v-pagination .v-btn {
    font-size: 16px!important;
    border-radius: 7px;
  }
  .v-pagination__item {
    border-radius: 7px;
  }
}
.v-theme--dark.v-pagination .v-pagination__item--is-active {
  background-color: #5c6f9c;
}
.pagination-value-select {
  max-height: 40px;
  min-width: 120px;
  overflow: hidden;
  padding: 0;
}
.data-table__wrapper {
  .v-theme--dark {
    .v-data-table__tr:hover {
      background-color: #616161;
    }
  }
  .v-table {
    font-size: 0.85em;
  }
}
.pagination-select__mobile {
  max-width: 18ch;

}
.data-table__settings-checkbox label{
  font-size: 0.7rem;
}
.data-table-toolbar-content {
  justify-content: space-between;
  width: 100%;
}
@media screen and (max-width: 900px) {
  .data-table-toolbar-content {
    justify-content: center;
    width: 100%;
    flex-wrap: wrap-reverse;
  }
}
</style>
