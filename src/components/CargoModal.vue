<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  dialog: Boolean,
  title: {
    type: String,
    default: '',
  },
  confirmText: { type: String, default: 'OK' },
});

const emit = defineEmits(['confirm', 'update:dialog']);

const localDialog = computed({
  get: () => props.dialog,
  set: (value) => emit('update:dialog', value),
});

const confirmAction = () => {
  emit('confirm');
};

const closeDialog = () => {
  emit('update:dialog', false);
};
</script>

<template>
  <v-dialog
      :model-value="localDialog"
      max-width="500px"
      @update:model-value="emit('update:dialog', $event)"
  >
    <v-card>
      <v-card-title>
        {{ title }}
      </v-card-title>

      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions>
        <v-btn
            color="primary"
            @click="confirmAction"
        >
          {{ confirmText }}
        </v-btn>
        <v-btn
            color="red"
            @click="closeDialog"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
