export default {
  label: 'Choose your framework',
  stylesheet: 'CSS',
  css: '.ticker-message { display: inline-block; padding: 0.75rem 1.25rem; }\n',
  examples: [
    {
      id: 'react',
      label: 'React',
      filename: 'NewsTicker.jsx',
      language: 'jsx',
      code: "'use client'\n\nimport { useEffect, useRef, useState } from 'react'\nimport { ticker } from '@samline/ticker'\nimport '@samline/ticker/style.css'\nimport './ticker.css'\n\nexport const NewsTicker = () => {\n  const source = useRef(null)\n  const controller = useRef(null)\n  const [playing, setPlaying] = useState(true)\n\n  useEffect(() => {\n    const news = ticker(source.current, { duration: 20 })\n    if (!news) return\n    controller.current = news\n    const stop = news.on('playback', state => setPlaying(state.requested))\n    setPlaying(news.state.requested)\n    return () => {\n      stop()\n      news.destroy()\n      controller.current = null\n    }\n  }, [])\n\n  const toggle = () => {\n    const news = controller.current\n    if (news?.state.requested) news.pause()\n    else news?.play()\n  }\n\n  return <section aria-label=\"Latest news\">\n    <div ref={source}>\n      <span className=\"ticker-message\">Made for the open web</span>\n      <span className=\"ticker-message\">Your content, in motion</span>\n      <span className=\"ticker-message\">Something good is coming</span>\n    </div>\n    <button type=\"button\" onClick={toggle}>{playing ? 'Pause' : 'Play'}</button>\n  </section>\n}\n",
    },
    {
      id: 'vue',
      label: 'Vue',
      filename: 'NewsTicker.vue',
      language: 'vue',
      code: '<script setup>\nimport { ref, onMounted, onUnmounted } from \'vue\'\nimport { ticker } from \'@samline/ticker\'\nimport \'@samline/ticker/style.css\'\nimport \'./ticker.css\'\n\nconst source = ref(null)\nconst playing = ref(true)\nlet news\nlet stop\nonMounted(() => {\n  news = ticker(source.value, { duration: 20 })\n  if (!news) return\n  playing.value = news.state.requested\n  stop = news.on(\'playback\', state => { playing.value = state.requested })\n})\nonUnmounted(() => { stop?.(); news?.destroy() })\nconst toggle = () => { if (news?.state.requested) news.pause(); else news?.play() }\n</script>\n\n<template>\n  <section aria-label="Latest news">\n    <div ref="source">\n      <span class="ticker-message">Made for the open web</span>\n      <span class="ticker-message">Your content, in motion</span>\n      <span class="ticker-message">Something good is coming</span>\n    </div>\n    <button type="button" @click="toggle">{{ playing ? \'Pause\' : \'Play\' }}</button>\n  </section>\n</template>\n',
    },
    {
      id: 'svelte',
      label: 'Svelte',
      filename: 'NewsTicker.svelte',
      language: 'svelte',
      code: "<script>\n  import { onMount } from 'svelte'\n  import { ticker } from '@samline/ticker'\n  import '@samline/ticker/style.css'\n  import './ticker.css'\n\n  let source\n  let news\n  let playing = $state(true)\n  onMount(() => {\n    news = ticker(source, { duration: 20 })\n    if (!news) return\n    playing = news.state.requested\n    const stop = news.on('playback', state => { playing = state.requested })\n    return () => { stop(); news.destroy() }\n  })\n  const toggle = () => { if (news?.state.requested) news.pause(); else news?.play() }\n</script>\n\n<section aria-label=\"Latest news\">\n  <div bind:this={source}>\n    <span class=\"ticker-message\">Made for the open web</span>\n    <span class=\"ticker-message\">Your content, in motion</span>\n    <span class=\"ticker-message\">Something good is coming</span>\n  </div>\n  <button type=\"button\" onclick={toggle}>{playing ? 'Pause' : 'Play'}</button>\n</section>\n",
    },
  ],
} as const
