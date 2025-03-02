<template> 
  <v-container>
    <v-row>
      <v-col md="4">
        <v-text-field
          :model-value="modelValue"
          label="Поиск"
          single-line
          hide-details
          :variant="variant"
          :density="density"
          @update:model-value="debounce($event)"
        >
          <template
            v-if="modelValue"
            #append-inner
          >
            <v-btn
              size="x-small"
              icon="clear"
              color="primary"
              @click="clear"
            />
          </template>
          <template
            v-if="showSearchBtn"
            #append
          >
            <v-btn
              size="x-small"
              icon="search"
              color="primary"
              @click="searchItem"
            />
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script> 
export default {
  props: {
    modelValue: { type: String, default: '' },
    showSearchBtn: { type: Boolean, default: false },
    debounceTime: { type: [Number,String], default: 0 },
    density: { type: String, default: 'compact' },
    variant: { type: String, default: 'outlined' },

  },
  data: () => ({
    timeoutId: null,
    searchValue: '',
  }),
  computed: {
    timeout() {
      return Number.isNaN(parseInt(this.debounceTime)) ? 0 : this.debounceTime;
    },
  },
  methods: {
    clear() {
      this.$emit('update:model-value', '');
      this.$emit('search', '');
      clearTimeout(this.timeoutId);
    },
    searchItem() {
      this.$emit('search', this.searchValue);
    },
    handleUpdate(e) {
      this.$emit('update:model-value', e);
      this.searchValue = e;
      if (!this.modelValue && !this.showSearchBtn) {
        this.searchItem();
      }
    },
    debounce(e) {
      if (this.timeoutId) { 
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => this.handleUpdate(e), this.timeout);
    },
  },
};
</script>

<style scoped>
    .col-md-4 {
        padding: 12px 0;
    }
    .col-md-2 {
        padding: 12px 0;
    }
    .mx-2 {
        margin: 0 0 0 8px !important;
    }
</style>