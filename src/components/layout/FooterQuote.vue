<script setup lang="ts">
import { ref, onMounted } from 'vue'

const QUOTES = [
  '行千里路，读万卷书。',
  '不积跬步，无以至千里；不积小流，无以成江海。',
  '学而不思则罔，思而不学则殆。',
  '工欲善其事，必先利其器。',
  '知之者不如好之者，好之者不如乐之者。',
  '路漫漫其修远兮，吾将上下而求索。',
  '业精于勤，荒于嬉；行成于思，毁于随。',
  '三人行，必有我师焉。',
]

const quote = ref('')

onMounted(() => {
  quote.value = QUOTES[Math.floor(Math.random() * QUOTES.length)] ?? QUOTES[0] ?? ''
})
</script>

<template>
  <footer class="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none z-[1]">
    <p
      v-if="quote"
      class="glass-quote px-4 py-2 rounded-lg text-white text-xs opacity-90 max-w-[90vw] text-center"
    >
      {{ quote }}
    </p>
  </footer>
</template>
