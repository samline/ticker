<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import type { TickerOptions } from '../core/types';
import { createTicker, mount, unmount } from '../vanilla/render';
import '../style.css';

interface Props extends TickerOptions {
  as?: 'div' | 'section' | 'article' | 'nav' | 'footer' | 'header';
}

const props = withDefaults(defineProps<Props>(), {
  duration: 20,
  direction: 'left',
  pauseOnHover: false,
  interactiveClones: false,
  class: '',
  as: 'div',
});

const emit = defineEmits<{
  ready: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const isReady = ref(false);
let tickerInstance: ReturnType<typeof createTicker> | null = null;

const combinedClass = computed(() => {
  return `ticker-wrapper ${props.class}`.trim();
});

onMounted(() => {
  mount();

  const container = containerRef.value;
  if (!container) return;

  setTimeout(() => {
    isReady.value = true;
    emit('ready');
  }, 0);

  tickerInstance = createTicker({
    duration: props.duration,
    direction: props.direction,
    pauseOnHover: props.pauseOnHover,
    interactiveClones: props.interactiveClones,
    class: props.class,
  });
  tickerInstance.mount();
});

onBeforeUnmount(() => {
  if (tickerInstance) {
    tickerInstance.unmount();
  }
});
</script>

<template>
  <component
    :is="props.as"
    ref="containerRef"
    :class="combinedClass"
    data-ticker=""
    :data-duration="props.duration"
    :data-direction="props.direction"
    :data-pause-on-hover="props.pauseOnHover ? 'true' : 'false'"
    :data-interactive-clones="props.interactiveClones ? 'true' : 'false'"
    :data-ready="isReady ? 'true' : 'false'"
    data-active="true"
    :style="{ '--ticker-duration': `${props.duration}s` }"
  >
    <div
      :class="['ticker-track', props.pauseOnHover ? 'ticker-pause-on-hover' : '']"
      data-ticker-track=""
    >
      <div class="ticker-content" data-ticker-content="">
        <slot />
      </div>
    </div>
  </component>
</template>