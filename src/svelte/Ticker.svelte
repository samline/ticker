<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { TickerOptions } from '../core/types';
  import { createTicker, mount, unmount } from '../vanilla/render';
  import '../style.css';

  export let duration: TickerOptions['duration'] = 20;
  export let direction: TickerOptions['direction'] = 'left';
  export let pauseOnHover: TickerOptions['pauseOnHover'] = false;
  export let interactiveClones: TickerOptions['interactiveClones'] = false;
  export let className: string = '';

  let container: HTMLElement;
  let isReady = false;
  let tickerInstance: ReturnType<typeof createTicker> | null = null;

  const combinedClass = `ticker-wrapper ${className}`.trim();

  onMount(() => {
    mount();

    setTimeout(() => {
      isReady = true;
    }, 0);

    tickerInstance = createTicker({
      duration,
      direction,
      pauseOnHover,
      interactiveClones,
      class: className,
    });
    tickerInstance.mount();
  });

  onDestroy(() => {
    if (tickerInstance) {
      tickerInstance.unmount();
    }
  });
</script>

<div
  bind:this={container}
  class={combinedClass}
  data-ticker=""
  data-duration={String(duration)}
  data-direction={direction}
  data-pause-on-hover={pauseOnHover ? 'true' : 'false'}
  data-interactive-clones={interactiveClones ? 'true' : 'false'}
  data-ready={isReady ? 'true' : 'false'}
  data-active="true"
  style="--ticker-duration: {duration}s"
>
  <div
    class="ticker-track"
    class:ticker-pause-on-hover={pauseOnHover}
    data-ticker-track=""
  >
    <div class="ticker-content" data-ticker-content="">
      <slot />
    </div>
  </div>
</div>