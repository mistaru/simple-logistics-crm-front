<script setup lang="ts">
import { ref } from 'vue';
import type { FilterOption, SelectOption, ModelValue } from '@/types';

const props = defineProps<{
  modelValue: ModelValue;
  filters: FilterOption[];
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: ModelValue): void;
  (event: 'search', value: ModelValue): void;
}>();

const menuState = ref<Record<string, boolean>>(
  Object.fromEntries(props.filters.map(filter => [`${filter.key}Menu`, false]))
);

const formatDate = (date: string | Date | null, key: string): string | null => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);

  const filter = props.filters.find(f => f.key === key);
  const time = filter?.isEndOfDay ? '23:59:59' : '00:00:00';

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${time}`;
};

const parseDate = (date: string | null): Date | null => {
  if (!date) return null;
  return new Date(date);
};

const updateValue = (key: string, value: string | number | SelectOption | null) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};

const closeMenu = (key: string) => {
  menuState.value[`${key}Menu`] = false;
};
const cleanModelValue = () => {
  const filteredModelValue: Record<string, string | number | SelectOption | boolean| null> = {};

  Object.entries(props.modelValue).forEach(([key, value]) => {
    if (value !== null && value !== '' && !(typeof value === 'object' && Object.keys(value).length === 0)) {
      filteredModelValue[key] = value ?? null;
    }
  });

  return filteredModelValue;
};

const emitSearch = () => {
  const cleanedData = cleanModelValue();
  emit('search', cleanedData);
};
</script>

<template>
  <v-row class="ma-4">
    <template
      v-for="filter in filters"
      :key="filter.key"
    >
      <v-col
        v-if="filter.type === 'text' || filter.type === 'number'"
        cols="3"
        class="mr-2"
      >
        <v-text-field
          :model-value="(modelValue[filter.key] as unknown as string | number | null)"
          :label="filter.label"
          :prepend-inner-icon="filter.icon || 'mdi-filter'"
          variant="outlined"
          :type="filter.type"
          @update:model-value="updateValue(filter.key, $event)"
        />
      </v-col>

      <v-col
        v-else-if="filter.type === 'select'"
        cols="2"
        class="mr-2"
      >
        <v-select
          :model-value="(modelValue[filter.key] as unknown as SelectOption | null)"
          :label="filter.label"
          :items="filter.options"
          item-value="value"
          item-title="description"
          prepend-inner-icon="mdi-filter"
          variant="outlined"
          clearable
          return-object
          @update:model-value="updateValue(filter.key, $event)"
        />
      </v-col>

      <v-col
        v-else-if="filter.type === 'date'"
        cols="2"
        class="mr-2"
      >
        <v-menu
          v-model="menuState[`${filter.key}Menu`]"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          @click:outside="closeMenu(filter.key)"
        >
          <template #activator="{ props: activatorProps }">
            <v-text-field
              :model-value="formatDate(modelValue[filter.key] as string | Date | null, filter.key)"
              :label="filter.label"
              prepend-inner-icon="$calendar"
              readonly
              v-bind="activatorProps"
              variant="outlined"
              @click="menuState[`${filter.key}Menu`] = true"
            />
          </template>
          <v-date-picker
            :model-value="parseDate(modelValue[filter.key] as string | null)"
            @update:model-value="updateValue(filter.key, formatDate($event, filter.key)); closeMenu(filter.key)"
          />
        </v-menu>
      </v-col>
    </template>

    <v-col cols="3">
      <v-btn
        variant="tonal"
        color="primary"
        @click="emitSearch"
      >
        Поиск
      </v-btn>
    </v-col>
  </v-row>
</template>
