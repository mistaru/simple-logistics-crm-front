<script setup lang="ts">
import { storeToRefs } from 'pinia';

const store = useAppStore();
const { messages } = storeToRefs(store);
const removeItem = (i:number | null=null) => {
  const index = i ?? messages.value.length-1;
  messages.value.splice(index,1);
};
watch(messages,() => {
  setTimeout(()=>{
    removeItem();
  }, 2000 + messages.value.length*2000);
});
</script>
<template>
  <v-snackbar
    v-for="(item, key) in messages"
    :key
    v-model="item.isOpen"
    position="fixed"
    close-on-content-click
    :color="item.isError ? 'error' : '#66BB6A'"
    height="70px"
  >
    {{ item.message }}
    <template #actions>
      <v-btn
        color="#757575"
        variant="text"
        size="x-small"
        icon="mdi-close"
        @click="removeItem(key)"
      />
    </template>
  </v-snackbar>
</template>