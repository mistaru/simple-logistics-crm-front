<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps<{
  dialog: boolean;
  title: string;
  confirmText: string;
}>();

const emit = defineEmits(['confirm', 'update:dialog']);

const dialogComputed = computed({
  get: () => props.dialog,
  set: (value) => emit('update:dialog', value),
});

const closeDialog = () => {
  emit('update:dialog', false);
};

const confirmAction = () => {
  emit('confirm');
};
</script>

<template>
  <v-dialog v-model="dialogComputed" max-width="600px">
    <v-card>
      <v-card-title class="headline">{{ props.title }}</v-card-title>

      <v-card-text>
        <slot></slot>
      </v-card-text>

      <v-card-actions class="d-flex justify-end">
        <v-btn color="grey" variant="text" @click="closeDialog">Отмена</v-btn>
        <v-btn color="primary" @click="confirmAction">{{ props.confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
