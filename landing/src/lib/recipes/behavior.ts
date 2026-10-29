import { serializeJsonLd as js } from '../../../../shared/lib/serialize'
import manifest from '../../../../package.json'
import type { RecipeContext } from './types'

export const createRecipeScript = ({ recipe, i18n }: RecipeContext, mode: 'cdn' | 'npm') => {
  const t = i18n.examples
  const playback = i18n.controls.ticker
  const verticalControls = recipe.rows.some(
    row => row.direction === 'up' || row.direction === 'down'
  )
  // Generate only the controls used by this recipe; copied code is plain JavaScript.

  const multiple = recipe.rows.length > 1
  const createTicker = (row: RecipeContext['recipe']['rows'][number], index: number) => {
    const { items, label, rtl, ...options } = row
    return `ticker('#ticker-${index + 1}', ${js({ pauseOnHover: true, ...options })})`
  }
  const applyToTickers = (statement: string) =>
    multiple ? `tickers.forEach(news => { ${statement} });` : statement
  const behavior = `
${
  multiple
    ? `const tickers = [${recipe.rows.map(createTicker).join(',')}].filter(Boolean);
const news = tickers[0];`
    : `const news = ${createTicker(recipe.rows[0], 0)};`
}

if (news) {
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const example = document.querySelector('.ticker-recipe');
  const pauseButton = example.querySelector('[data-pause]');
  const renderPlayback = () => {
    const playing = ${multiple ? 'tickers.some(item => item.state.requested)' : 'news.state.requested'};
    example.dataset.paused = String(!playing);
    pauseButton.textContent = playing ? ${js(playback.pause)} : ${js(playback.play)};
    ${applyToTickers(`
    const state = news.state;
    const status = news.element.closest('.window').querySelector('[data-playback-status]');
    status.textContent = state.requested && !state.playing
      ? state.reasons.includes('focus') ? ${js(playback.pausedFocus)}
        : state.reasons.includes('hover') ? ${js(playback.pausedHover)} : ''
      : '';
`)}
  };
  ${applyToTickers("news.on('playback', renderPlayback);")}
  renderPlayback();
  example.querySelector('.controls').hidden = false;
  pauseButton.addEventListener('click', () => {
    const playing = ${multiple ? 'tickers.some(item => item.state.requested)' : 'news.state.requested'};
    ${applyToTickers('playing ? news.pause() : news.play();')}
  }, { signal });
  ${
    recipe.rows.some(row => row.navigation)
      ? `
  news.connectControls({
    itemsPerStep: 1,
    ${recipe.id === 'manual-navigation' || recipe.rows.some(row => row.featuredPosition) ? "behavior: 'smooth', duration: 300, preservePlayback: true," : ''}
    previous: example.querySelector('[data-previous]'),
    next: example.querySelector('[data-next]'),
    rail: example.querySelector('[data-position]'),
  });`
      : ''
  }
  ${
    recipe.kind === 'featured-menu'
      ? `
  example.addEventListener('click', event => {
    const button = event.target.closest('button[data-example-feature]');
    if (!button) return;
    const original = [...example.querySelectorAll('button[data-example-feature]')].find(item => !item.closest('.ticker-clone') && item.dataset.exampleFeature === button.dataset.exampleFeature);
    if (!original) return;
    example.querySelectorAll('button[data-example-feature]').forEach(item => {
      item.setAttribute('aria-pressed', String(item.dataset.exampleFeature === original.dataset.exampleFeature));
    });
    news.setFeatured(original);
    example.querySelector('[data-featured-selection]').textContent = button.textContent;
    example.querySelector('.selected-category [data-featured-description]').textContent = button.dataset.featuredDescription;
  }, { signal });`
      : ''
  }
  ${
    recipe.rows.some(row => row.featuredPosition)
      ? `
  const positions = example.querySelectorAll('button[data-example-featured-position]');
  const axes = example.querySelectorAll('button[data-example-featured-axis]');
  const syncFeatured = () => {
    const vertical = news.options.direction === 'up';
    positions.forEach(button => {
      const position = button.dataset.exampleFeaturedPosition;
      button.setAttribute('aria-pressed', String(news.options.featuredPosition === position));
      if (position === 'start') button.textContent = vertical ? ${js(t.top)} : ${js(t.left)};
      if (position === 'end') button.textContent = vertical ? ${js(t.bottom)} : ${js(t.right)};
    });
    axes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.exampleFeaturedAxis === (vertical ? 'vertical' : 'horizontal'))));
    example.querySelector('.window').dataset.vertical = String(vertical);
  };
  positions.forEach(button => button.addEventListener('click', () => {
    news.update({ featuredPosition: button.dataset.exampleFeaturedPosition });
    syncFeatured();
  }, { signal }));
  axes.forEach(button => button.addEventListener('click', () => {
    news.update({ direction: button.dataset.exampleFeaturedAxis === 'vertical' ? 'up' : 'left' });
    syncFeatured();
  }, { signal }));
  syncFeatured();`
      : ''
  }
  ${
    recipe.kind === 'drag'
      ? `
  const resumeButton = example.querySelector('[data-example-resume]');
  resumeButton.addEventListener('click', () => {
    const enabled = !news.options.resumeAfterDrag;
    news.update({ resumeAfterDrag: enabled });
    resumeButton.setAttribute('aria-pressed', String(enabled));
    resumeButton.querySelector('[data-resume-state]').textContent = enabled ? ${js(t.enabled)} : ${js(t.disabled)};
  }, { signal });`
      : ''
  }
  ${
    recipe.kind === 'controls'
      ? `
  const duration = example.querySelector('input');
  const output = example.querySelector('output');
  duration.addEventListener('input', () => {
    news.update({ duration: Number(duration.value) });
    output.value = duration.value + 's';
  }, { signal });
  const direction = example.querySelector('[data-example-direction-select]');
  direction.addEventListener('change', () => {
    news.update({ direction: direction.value });
  }, { signal });`
      : ''
  }
  ${
    verticalControls
      ? `
  const directions = example.querySelectorAll('button[data-example-direction]');
  directions.forEach(button => {
    button.addEventListener('click', () => {
      news.update({ direction: button.dataset.exampleDirection });
      directions.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }, { signal });
  });`
      : ''
  }
  ${
    recipe.kind === 'dynamic'
      ? `
  const select = example.querySelector('[data-item-select]');
  const position = example.querySelector('[data-item-position]');
  const status = example.querySelector('[data-example-updates]');
  const items = () => [...news.source.querySelectorAll('[data-example-item]')];
  const removeButtons = example.querySelectorAll('[data-remove-first], [data-remove-last], [data-remove-selected], [data-remove-position]');
  const syncItems = () => {
    const selected = select.value;
    const current = items();
    select.replaceChildren(...current.map(item => new Option(item.textContent, item.dataset.exampleItem)));
    if (current.some(item => item.dataset.exampleItem === selected)) select.value = selected;
    if (!current.length) select.add(new Option(${js(t.itemEmpty)}, ''));
    select.disabled = !current.length;
    const index = Math.min(Number(position.value) || 0, current.length - 1);
    position.replaceChildren(...current.map((_, index) => new Option(String(index + 1), String(index))));
    if (current.length) position.value = String(Math.max(0, index));
    else position.add(new Option(${js(t.itemEmpty)}, ''));
    position.disabled = !current.length;
    removeButtons.forEach(button => { button.disabled = !current.length; });
  };
  const removeItem = item => {
    if (!item) return;
    const label = item.textContent;
    item.remove();
    news.refresh();
    syncItems();
    status.textContent = ${js(t.removedStatus)}.replace('{item}', label);
  };
  // These helpers belong to the application, not the Ticker controller.
  // Stable keys survive reordering; indexes refer to the current item list.
  const removeById = id => removeItem(items().find(item => item.dataset.exampleItem === id));
  const removeAt = index => removeItem(items()[index]);
  example.querySelector('[data-remove-position]').addEventListener('click', () => removeAt(Number(position.value)), { signal });
  example.querySelector('[data-remove-first]').addEventListener('click', () => removeItem(items()[0]), { signal });
  example.querySelector('[data-remove-last]').addEventListener('click', () => removeItem(items().at(-1)), { signal });
  example.querySelector('[data-remove-selected]').addEventListener('click', () => {
    removeById(select.value);
  }, { signal });
  syncItems();
  let count = 0;
  example.querySelector('[data-add]').addEventListener('click', () => {
    const item = document.createElement('span');
    item.className = 'item';
    item.dataset.exampleItem = 'added-' + ++count;
    item.textContent = ${js(t.added)}.replace('{count}', String(count));
    news.source.append(item);
    news.refresh();
    syncItems();
    status.textContent = ${js(t.addedStatus)}.replace('{count}', String(count));
  }, { signal });`
      : ''
  }
  document.fonts.ready.then(() => {
    if (!signal.aborted) { ${applyToTickers('news.refresh();')} }
  });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    lifecycle.abort();
    ${applyToTickers('news.destroy();')}
  }, { signal });
}`
  return `${mode === 'cdn' ? 'const ticker = window.Ticker.ticker;' : `import { ticker } from '${manifest.name}';\nimport '${manifest.name}/style.css';`}\n${behavior}`
}
