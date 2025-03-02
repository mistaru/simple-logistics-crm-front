<template> 
  <v-tooltip
    :text="msg"
    :location="left ? 'start' : location"
  >
    <template #activator="{ props }">
      <div v-bind="props">
        <slot />
      </div>
    </template>
  </v-tooltip>
</template>

<script> 

export default {
  name: 'Hint',
  props: {
    msg: { type: String, default: 'подсказка' },
    location: { type: String, default: 'bottom' },
    left: { type: Boolean, default: false },
  },
};
</script>