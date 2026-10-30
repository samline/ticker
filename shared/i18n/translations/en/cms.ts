export default {
  shopify: [
    {
      id: 'section',
      label: 'Section',
      filename: 'sections/ticker-strip.liquid',
      language: 'liquid',
      code: '<section data-ticker-widget aria-label="Latest news">\n  <div data-source>\n    <span class="ticker-message">Made for the open web</span>\n    <span class="ticker-message">Your content, in motion</span>\n    <span class="ticker-message">Something good is coming</span>\n  </div>\n  <button type="button" data-toggle disabled>Pause</button>\n</section>\n\n{% schema %}\n{"name":"Ticker example","presets":[{"name":"Ticker example"}]}\n{% endschema %}\n',
    },
    {
      id: 'loader',
      label: 'Layout',
      filename: 'layout/theme.liquid',
      language: 'liquid',
      code: "{{ 'ticker.css' | asset_url | stylesheet_tag }}\n{{ 'integration.css' | asset_url | stylesheet_tag }}\n<script src=\"{{ 'ticker.global.js' | asset_url }}\" defer></script>\n<script src=\"{{ 'integration.js' | asset_url }}\" defer></script>",
    },
    {
      id: 'javascript',
      label: 'JavaScript',
      filename: 'assets/integration.js',
      language: 'javascript',
      code: "const instances = new Map()\nconst mount = scope => {\n  scope.querySelectorAll('[data-ticker-widget]').forEach(root => {\n    if (instances.has(root)) return\n    const button = root.querySelector('[data-toggle]')\n    const news = window.Ticker.ticker(root.querySelector('[data-source]'), { duration: 20 })\n    if (!news) return\n    const events = new AbortController()\n    const render = () => { button.textContent = news.state.requested ? 'Pause' : 'Play' }\n    const stop = news.on('playback', render)\n    render()\n    button.disabled = false\n    button.addEventListener('click', () => {\n      if (news.state.requested) news.pause()\n      else news.play()\n    }, { signal: events.signal })\n    instances.set(root, () => { events.abort(); stop(); news.destroy(); button.disabled = true })\n  })\n}\nconst unmount = scope => {\n  for (const [root, dispose] of instances) {\n    if (scope.contains(root)) { dispose(); instances.delete(root) }\n  }\n}\nmount(document)\ndocument.addEventListener('shopify:section:load', event => mount(event.target))\ndocument.addEventListener('shopify:section:unload', event => unmount(event.target))\nwindow.addEventListener('pagehide', event => {\n  if (!event.persisted) unmount(document)\n})\n",
    },
    {
      id: 'css',
      label: 'CSS',
      filename: 'assets/integration.css',
      language: 'css',
      code: '.ticker-message { display: inline-block; padding: 0.75rem 1.25rem; }\n',
    },
  ],
  wordpress: [
    {
      id: 'plugin',
      label: 'Plugin',
      filename: 'ticker-example.php',
      language: 'php',
      code: "<?php\n/**\n * Plugin Name: Ticker example\n */\nadd_action('wp_enqueue_scripts', static function () {\n    $post = get_post();\n    if (!is_singular() || !$post || !has_shortcode($post->post_content, 'ticker_strip')) return;\n    $assets = plugin_dir_url(__FILE__) . 'assets/';\n    wp_enqueue_style('ticker-runtime', $assets . 'ticker.css', [], '2.5.0');\n    wp_enqueue_style('ticker-example', $assets . 'integration.css', ['ticker-runtime'], '1.0.0');\n    wp_enqueue_script('ticker-runtime', $assets . 'ticker.global.js', [], '2.5.0', ['strategy' => 'defer', 'in_footer' => true]);\n    wp_enqueue_script('ticker-example', $assets . 'integration.js', ['ticker-runtime'], '1.0.0', ['strategy' => 'defer', 'in_footer' => true]);\n});\nadd_shortcode('ticker_strip', static fn () => '<section data-ticker-widget aria-label=\"Latest news\">\n  <div data-source>\n    <span class=\"ticker-message\">Made for the open web</span>\n    <span class=\"ticker-message\">Your content, in motion</span>\n    <span class=\"ticker-message\">Something good is coming</span>\n  </div>\n  <button type=\"button\" data-toggle disabled>Pause</button>\n</section>');\n",
    },
    {
      id: 'javascript',
      label: 'JavaScript',
      filename: 'assets/integration.js',
      language: 'javascript',
      code: "const instances = new Map()\nconst mount = scope => {\n  scope.querySelectorAll('[data-ticker-widget]').forEach(root => {\n    if (instances.has(root)) return\n    const button = root.querySelector('[data-toggle]')\n    const news = window.Ticker.ticker(root.querySelector('[data-source]'), { duration: 20 })\n    if (!news) return\n    const events = new AbortController()\n    const render = () => { button.textContent = news.state.requested ? 'Pause' : 'Play' }\n    const stop = news.on('playback', render)\n    render()\n    button.disabled = false\n    button.addEventListener('click', () => {\n      if (news.state.requested) news.pause()\n      else news.play()\n    }, { signal: events.signal })\n    instances.set(root, () => { events.abort(); stop(); news.destroy(); button.disabled = true })\n  })\n}\nconst unmount = scope => {\n  for (const [root, dispose] of instances) {\n    if (scope.contains(root)) { dispose(); instances.delete(root) }\n  }\n}\nmount(document)\nwindow.addEventListener('pagehide', event => {\n  if (!event.persisted) unmount(document)\n})\n",
    },
    {
      id: 'css',
      label: 'CSS',
      filename: 'assets/integration.css',
      language: 'css',
      code: '.ticker-message { display: inline-block; padding: 0.75rem 1.25rem; }\n',
    },
  ],
} as const
