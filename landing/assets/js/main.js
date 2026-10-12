/* Progressive enhancement for the static landing and the local ticker bundle. */
;(function () {
  'use strict'

  const instances = []
  const options = {
    news: { duration: 38, direction: 'left', pauseOnHover: true },
    prices: { duration: 34, direction: 'right', pauseOnHover: true },
    logos: { duration: 48, direction: 'left', pauseOnHover: true },
  }

  function initTickers() {
    if (typeof window.Ticker?.newTicker !== 'function') return

    document.querySelectorAll('[data-ticker]').forEach(element => {
      try {
        const instance = window.Ticker.newTicker({
          id: element.id,
          options: options[element.dataset.ticker],
        })
        if (!instance?.element) return
        instances.push(instance)

        const controls = document.createElement('div')
        controls.className = 'ticker-controls'
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'btn btn-ghost'
        button.textContent = 'Pause animation'
        button.setAttribute('aria-controls', element.id)
        button.setAttribute('aria-label', `Pause animation: ${element.getAttribute('aria-label')}`)
        button.setAttribute('aria-pressed', 'false')
        button.addEventListener('click', () => {
          const paused = element.dataset.userPaused !== 'true'
          element.dataset.userPaused = String(paused)
          button.setAttribute('aria-pressed', String(paused))
        })
        controls.append(button)
        element.after(controls)
      } catch (error) {
        element.dataset.static = 'true'
        console.error('[ticker-landing] Failed to initialize', element.id, error)
      }
    })
  }

  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(group => {
      const tabs = Array.from(group.querySelectorAll('[data-tab]'))
      const scope = group.closest('[data-tab-scope]') || group.parentElement
      const container = scope.querySelector('[data-panel-group]')
      if (!tabs.length || !container) return
      const panels = Array.from(container.querySelectorAll('[data-panel]'))
      group.setAttribute('role', 'tablist')

      function selectTab(selected, focus = false) {
        tabs.forEach(tab => {
          const active = tab === selected
          tab.setAttribute('aria-selected', String(active))
          tab.tabIndex = active ? 0 : -1
        })
        panels.forEach(panel => {
          panel.hidden = panel.dataset.panel !== selected.dataset.tab
        })
        if (focus) selected.focus()
        group.dispatchEvent(
          new CustomEvent('landing:tabchange', {
            bubbles: true,
            detail: { tab: selected.dataset.tab },
          })
        )
      }

      tabs.forEach((tab, index) => {
        const panel = panels.find(item => item.dataset.panel === tab.dataset.tab)
        if (!panel) return
        tab.id = `tab-${group.dataset.tabs}-${tab.dataset.tab}`
        panel.id = `panel-${group.dataset.tabs}-${tab.dataset.tab}`
        tab.setAttribute('role', 'tab')
        tab.setAttribute('aria-controls', panel.id)
        panel.setAttribute('role', 'tabpanel')
        panel.setAttribute('aria-labelledby', tab.id)
        panel.tabIndex = 0
        tab.addEventListener('click', () => selectTab(tab))
        tab.addEventListener('keydown', event => {
          let next
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
          if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
          if (event.key === 'Home') next = 0
          if (event.key === 'End') next = tabs.length - 1
          if (next === undefined) return
          event.preventDefault()
          selectTab(tabs[next], true)
        })
      })
      selectTab(tabs[0])
    })
  }

  function initDemoControls() {
    const studio = document.querySelector('.demo-studio')
    const speed = studio?.querySelector('[data-speed]')
    const output = studio?.querySelector('[data-speed-output]')
    if (!speed || !output || !instances.length) return
    speed.disabled = false
    let current = 'news'
    speed.id = 'demo-speed'
    output.setAttribute('for', speed.id)
    function activeInstance() {
      return instances.find(instance => instance.element?.dataset.ticker === current)
    }
    studio.addEventListener('landing:tabchange', event => {
      current = event.detail.tab
      const instance = activeInstance()
      if (!instance) return
      speed.value = String(instance.options.duration)
      output.value = `${speed.value}s`
      speed.setAttribute('aria-valuetext', `${speed.value} seconds per loop`)
      instance.refresh()
    })
    speed.addEventListener('input', () => {
      output.value = `${speed.value}s`
      speed.setAttribute('aria-valuetext', `${speed.value} seconds per loop`)
      activeInstance()?.update({ duration: Number(speed.value) })
    })
    speed.setAttribute('aria-valuetext', `${speed.value} seconds per loop`)
    document.querySelectorAll('[data-open-demo]').forEach(link => {
      link.addEventListener('click', () => {
        studio.querySelector(`[data-tab="${link.dataset.openDemo}"]`)?.click()
      })
    })
  }

  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(button => {
      const status = button.parentElement.querySelector('[data-copy-status]')
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.copy)
          button.textContent = 'Copied!'
          status.textContent = 'Install command copied to clipboard.'
        } catch {
          const code = button.parentElement.querySelector('code')
          const range = document.createRange()
          range.selectNodeContents(code)
          const selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
          status.textContent = 'Command selected. Press Control+C or Command+C to copy.'
        }
      })
    })
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.remove('reveal-pending')
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.05 }
    )
    document.querySelectorAll('[data-reveal]').forEach(target => {
      // Keep the first viewport visible without waiting for an observer callback.
      if (target.getBoundingClientRect().top < window.innerHeight) return
      observer.observe(target)
      target.classList.add('reveal-pending')
    })
  }

  function ready() {
    document.getElementById('year').textContent = new Date().getFullYear()
    initTabs()
    initTickers()
    initDemoControls()
    initCopy()
    initReveal()
    document.fonts?.ready
      .then(() => {
        instances.forEach(instance => instance.refresh())
      })
      .catch(() => {})
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true })
  } else {
    ready()
  }
})()
