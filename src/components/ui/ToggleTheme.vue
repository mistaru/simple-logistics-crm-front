

<script setup lang="ts">
import { useTheme } from 'vuetify';

const theme = useTheme();

function toggleTheme() {
  const val: string = theme.global.current.value.dark ? 'light' : 'dark';
  theme.global.name.value = val;
  localStorage.setItem('theme', theme.global.name.value);
}
onMounted(() => {
  const val = localStorage.getItem('theme') || 'light';
  theme.global.name.value = val;
});
</script>
<template>
  <v-switch @click="toggleTheme" />
</template>
