<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  dialog: boolean;
  title: string;
  confirmText?: string;
}>();

const emit = defineEmits<{
  (e: 'update:dialog', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'close'): void;
}>();

const close = () => {
  emit('update:dialog', false);
  emit('close');
};

const confirm = () => {
  emit('confirm');
};
</script>

<template>
  <v-dialog v-model="props.dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close">Отмена</v-btn>
        <v-btn color="primary" @click="confirm">{{ confirmText || 'Сохранить' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
