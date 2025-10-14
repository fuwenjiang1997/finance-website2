
<template>
  <h1>You did it!</h1>
  <p>{{ a }} - {{ b }}</p>
  <p>{{ c }}</p>

  <button @click="() => { a = a+1 }">add</button>
</template>

<script setup lang="ts">
import { add, reduce } from '@fuwenjiang1997/trading-view-replay'
import { computed, ref } from 'vue';

const a = ref(1)

const b = computed(() => {
  return add(a.value, 3)
})

const c = computed(() => {
  return reduce(a.value, b.value)
})

</script>

<style scoped></style>
