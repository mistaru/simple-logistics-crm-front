<template>
  <v-dialog v-model="dialog" max-width="450">
    <v-card>
      <v-card-title>Добавить клиента</v-card-title>

      <v-card-text>
        <v-text-field v-model="fullName" label="ФИО" />
        <v-text-field v-model="phone" label="Телефон" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn text @click="close">Отмена</v-btn>
        <v-btn color="primary" @click="save">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  dialog: Boolean
});

const emits = defineEmits(['update:dialog', 'saved']);

const fullName = ref('');
const phone = ref('');

watch(() => props.dialog, value => {
  if (value) {
    fullName.value = '';
    phone.value = '';
  }
});

const close = () => {
  emits('update:dialog', false);
};

const save = () => {
  if (!fullName.value.trim()) return;
  emits('saved', { fullName: fullName.value, phone: phone.value });
  close();
};
</script>
