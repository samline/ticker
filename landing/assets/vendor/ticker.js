"use strict";
var TickerBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/browser/global.ts
  var global_exports = {};
  __export(global_exports, {
    available: () => available2,
    browser: () => browser,
    default: () => global_default,
    destroyTicker: () => destroyTicker3,
    destroyTickers: () => destroyTickers2,
    getTicker: () => getTicker2,
    getTickers: () => getTickers2,
    newTicker: () => newTicker2,
    ticker: () => ticker2
  });

  // src/core/state.ts
  var DEFAULT_DURATION = 20;
  var createEmptyTickerState = () => ({
    clones: [],
    frameId: 0,
    resizeTimeout: null,
    resizeObserver: null,
    intersectionObserver: null
  });
  var createEmptyManagerState = () => ({
    isMounted: false,
    mutationObserver: null
  });
  var validateDuration = (duration) => {
    const parsed = typeof duration === "number" ? duration : parseFloat(String(duration));
    const valid = Number.isFinite(parsed) && parsed > 0;
    return valid ? parsed : DEFAULT_DURATION;
  };
  var validateDirection = (direction) => {
    return direction === "right" ? "right" : "left";
  };
  var validatePauseOnHover = (pauseOnHover) => {
    return pauseOnHover === true;
  };
  var validateInteractiveClones = (interactiveClones) => {
    return interactiveClones === true;
  };

  // src/constants.ts
  var TICKER_SELECTOR = "[data-ticker], .ticker-wrapper";
  var TICKER_CLONE_CLASS = "ticker-clone";
  var REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  var FOCUSABLE_SELECTOR = 'a[href], area[href], button, input, select, textarea, iframe, [tabindex], [contenteditable="true"]';
  var RESIZE_DEBOUNCE_MS = 150;
  var INTERSECTION_ROOT_MARGIN = "0px";

  // src/vanilla/render.ts
  var reducedMotionMedia = null;
  var requestFrame = (callback) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      return window.requestAnimationFrame(callback);
    }
    callback(0);
    return 0;
  };
  var cancelFrame = (frameId) => {
    if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(frameId);
    }
  };
  var getReducedMotionMedia = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return null;
    }
    if (!reducedMotionMedia) {
      reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    }
    return reducedMotionMedia;
  };
  var tickersState = /* @__PURE__ */ new Map();
  var managerState = createEmptyManagerState();
  var syncPlayback = ({ wrapper }) => {
    wrapper.dataset.playing = String(
      wrapper.dataset.active === "true" && !document.hidden && !getReducedMotionMedia()?.matches
    );
  };
  var handleVisibilityChange = () => tickersState.forEach(syncPlayback);
  var handleMotionChange = () => {
    tickersState.forEach((state) => {
      syncPlayback(state);
      scheduleRebuild(state);
    });
  };
  var addPlaybackListeners = () => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const media = getReducedMotionMedia();
    if (typeof media?.addEventListener === "function") {
      media.addEventListener("change", handleMotionChange);
    } else if (typeof media?.addListener === "function") {
      media.addListener(handleMotionChange);
    }
  };
  var removePlaybackListeners = () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    const media = getReducedMotionMedia();
    if (typeof media?.removeEventListener === "function") {
      media.removeEventListener("change", handleMotionChange);
    } else if (typeof media?.removeListener === "function") {
      media.removeListener(handleMotionChange);
    }
  };
  var isTickerContentElement = (element) => element.matches("[data-ticker-content], .ticker-content");
  var makeCloneAccessible = (clone, interactiveClones) => {
    clone.classList.add(TICKER_CLONE_CLASS);
    if (interactiveClones) return;
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("role", "presentation");
    if ("inert" in clone) {
      ;
      clone.inert = true;
      return;
    }
    clone.querySelectorAll(FOCUSABLE_SELECTOR).forEach((el) => el.setAttribute("tabindex", "-1"));
  };
  var removeClones = (state) => {
    state.clones.forEach((clone) => clone.remove());
    state.clones = [];
  };
  var syncConfig = (state) => {
    const { wrapper, track } = state;
    const duration = validateDuration(wrapper.dataset.duration);
    const direction = validateDirection(wrapper.dataset.direction);
    const pauseOnHover = validatePauseOnHover(wrapper.dataset.pauseOnHover === "true");
    const interactiveClones = validateInteractiveClones(wrapper.dataset.interactiveClones === "true");
    if (wrapper.dataset.direction !== direction) {
      wrapper.dataset.direction = direction;
    }
    const newInteractiveClones = interactiveClones ? "true" : "false";
    if (wrapper.dataset.interactiveClones !== newInteractiveClones) {
      wrapper.dataset.interactiveClones = newInteractiveClones;
    }
    const newDuration = `${duration}s`;
    if (wrapper.dataset.duration !== String(duration)) {
      wrapper.dataset.duration = String(duration);
    }
    const currentDuration = wrapper.style.getPropertyValue("--ticker-duration");
    if (currentDuration !== newDuration) {
      wrapper.style.setProperty("--ticker-duration", newDuration);
    }
    const hasPauseClass = track.classList.contains("ticker-pause-on-hover");
    wrapper.dataset.pauseOnHover = pauseOnHover ? "true" : "false";
    if (hasPauseClass !== pauseOnHover) {
      track.classList.toggle("ticker-pause-on-hover", pauseOnHover);
    }
  };
  var rebuildTickerState = (state, force) => {
    const { wrapper, track, content } = state;
    if (!track || !content || !wrapper.isConnected) return;
    syncConfig(state);
    const contentRect = content.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
    const contentWidth = contentRect.width + gap;
    const wrapperWidth = Math.ceil(wrapperRect.width);
    const reducedMotion = getReducedMotionMedia()?.matches ?? false;
    const interactiveClones = wrapper.dataset.interactiveClones === "true";
    const previous = state.measurement;
    if (!force && wrapper.dataset.ready === "true" && previous?.contentWidth === contentWidth && previous.wrapperWidth === wrapperWidth && previous.interactiveClones === interactiveClones && previous.reducedMotion === reducedMotion) {
      return;
    }
    wrapper.dataset.ready = "false";
    removeClones(state);
    state.measurement = null;
    if (!contentWidth || !wrapperWidth) return;
    state.measurement = { contentWidth, wrapperWidth, interactiveClones, reducedMotion };
    if (reducedMotion) {
      wrapper.style.setProperty("--ticker-distance", "0px");
      wrapper.dataset.ready = "true";
      return;
    }
    const clonesNeeded = Math.max(1, Math.ceil(wrapperWidth / contentWidth));
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < clonesNeeded; index += 1) {
      const clone = content.cloneNode(true);
      makeCloneAccessible(clone, interactiveClones);
      state.clones.push(clone);
      fragment.appendChild(clone);
    }
    track.appendChild(fragment);
    wrapper.style.setProperty("--ticker-distance", `${contentWidth}px`);
    wrapper.dataset.ready = "true";
  };
  var scheduleRebuild = (state, force = false) => {
    if (!state.track || !state.content) return;
    state.forceRebuild || (state.forceRebuild = force);
    if (state.frameId) cancelFrame(state.frameId);
    state.frameId = requestFrame(() => {
      state.frameId = 0;
      const forceRebuild = state.forceRebuild;
      state.forceRebuild = false;
      rebuildTickerState(state, forceRebuild);
    });
  };
  var setupObservers = (state) => {
    const { wrapper, content } = state;
    if (typeof window.ResizeObserver === "function") {
      state.resizeObserver = new ResizeObserver(() => {
        if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
        state.resizeTimeout = window.setTimeout(() => scheduleRebuild(state), RESIZE_DEBOUNCE_MS);
      });
      state.resizeObserver.observe(wrapper);
      state.resizeObserver.observe(content);
    }
    if (typeof window.IntersectionObserver === "function") {
      state.intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          const isActive = entry?.isIntersecting ?? true;
          if (wrapper.dataset.active !== String(isActive)) {
            wrapper.dataset.active = isActive ? "true" : "false";
          }
          syncPlayback(state);
          if (isActive) scheduleRebuild(state);
        },
        { rootMargin: INTERSECTION_ROOT_MARGIN }
      );
      state.intersectionObserver.observe(wrapper);
    }
  };
  var destroyTicker = (wrapper) => {
    const state = tickersState.get(wrapper);
    if (!state) return;
    if (state.frameId) cancelFrame(state.frameId);
    if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
    state.resizeObserver?.disconnect();
    state.intersectionObserver?.disconnect();
    removeClones(state);
    tickersState.delete(wrapper);
    wrapper.dataset.active = "false";
    wrapper.dataset.playing = "false";
    wrapper.dataset.ready = "false";
    if (!tickersState.size) removePlaybackListeners();
  };
  var initTicker = (wrapper) => {
    if (tickersState.has(wrapper)) return;
    const track = wrapper.querySelector("[data-ticker-track]") || wrapper.querySelector(".ticker-track");
    const content = wrapper.querySelector("[data-ticker-content]") || wrapper.querySelector(".ticker-content");
    if (!track || !content) return;
    const state = {
      wrapper,
      track,
      content,
      ...createEmptyTickerState(),
      forceRebuild: false,
      measurement: null
    };
    tickersState.set(wrapper, state);
    if (tickersState.size === 1) addPlaybackListeners();
    wrapper.dataset.ready = "false";
    wrapper.dataset.active = String(typeof window.IntersectionObserver !== "function");
    syncPlayback(state);
    syncConfig(state);
    setupObservers(state);
    scheduleRebuild(state);
  };
  var refreshTicker = (wrapper) => {
    const state = tickersState.get(wrapper);
    if (state) scheduleRebuild(state, true);
  };
  var resolveTarget = (target) => {
    if (typeof target !== "string") return target;
    if (typeof document === "undefined") return null;
    return document.querySelector(target);
  };
  var normalizeClassName = (className = "") => className.split(/\s+/).filter((token) => token && token !== "ticker-wrapper").join(" ");
  var normalizeOptions = (options = {}) => ({
    duration: validateDuration(options.duration),
    direction: validateDirection(options.direction),
    pauseOnHover: validatePauseOnHover(options.pauseOnHover),
    interactiveClones: validateInteractiveClones(options.interactiveClones),
    class: normalizeClassName(options.class)
  });
  var applyOptions = (wrapper, previous, next) => {
    const previousClasses = previous.class?.split(/\s+/).filter(Boolean) ?? [];
    const nextClasses = next.class?.split(/\s+/).filter(Boolean) ?? [];
    if (previousClasses.length) wrapper.classList.remove(...previousClasses);
    if (nextClasses.length) wrapper.classList.add(...nextClasses);
    wrapper.dataset.duration = String(next.duration);
    wrapper.dataset.direction = next.direction;
    wrapper.dataset.pauseOnHover = next.pauseOnHover ? "true" : "false";
    wrapper.dataset.interactiveClones = next.interactiveClones ? "true" : "false";
  };
  var createWrapper = (options) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("ticker-wrapper");
    wrapper.dataset.ticker = "";
    wrapper.dataset.ready = "false";
    applyOptions(wrapper, {}, options);
    const track = document.createElement("div");
    track.classList.add("ticker-track");
    track.dataset.tickerTrack = "";
    wrapper.appendChild(track);
    return { wrapper, track };
  };
  var enhanceElement = (element, options) => {
    const content = element.querySelector("[data-ticker-content]") || element.querySelector(".ticker-content") || element;
    const parent = element.parentNode;
    const nextSibling = element.nextSibling;
    const { wrapper, track } = createWrapper(options);
    const tickerContent = isTickerContentElement(content) ? content : document.createElement("div");
    tickerContent.classList.add("ticker-content");
    tickerContent.dataset.tickerContent = "";
    if (tickerContent !== content) tickerContent.appendChild(content);
    track.appendChild(tickerContent);
    if (parent) parent.insertBefore(wrapper, nextSibling);
    if (element !== content && element.isConnected) element.remove();
    initTicker(wrapper);
    return wrapper;
  };
  var ticker = (target, initialOptions = {}) => {
    const source = resolveTarget(target);
    if (!source) return null;
    const ownsWrapper = !source.matches(TICKER_SELECTOR);
    const markupOptions = ownsWrapper ? {} : {
      duration: validateDuration(source.dataset.duration),
      direction: validateDirection(source.dataset.direction),
      pauseOnHover: source.dataset.pauseOnHover === "true",
      interactiveClones: source.dataset.interactiveClones === "true"
    };
    let currentOptions = normalizeOptions({ ...markupOptions, ...initialOptions });
    let wrapper;
    if (ownsWrapper) {
      wrapper = enhanceElement(source, currentOptions);
    } else {
      wrapper = source;
      applyOptions(wrapper, {}, currentOptions);
      initTicker(wrapper);
    }
    const instance = {
      get element() {
        return wrapper;
      },
      source,
      get options() {
        return { ...currentOptions };
      },
      update(options = {}) {
        if (!wrapper) return instance;
        const nextOptions = normalizeOptions({ ...currentOptions, ...options });
        applyOptions(wrapper, currentOptions, nextOptions);
        currentOptions = nextOptions;
        refreshTicker(wrapper);
        return instance;
      },
      refresh() {
        if (wrapper) refreshTicker(wrapper);
        return instance;
      },
      destroy() {
        if (!wrapper) return;
        destroyTicker(wrapper);
        if (ownsWrapper && wrapper.isConnected) wrapper.replaceWith(source);
        wrapper = null;
      }
    };
    return instance;
  };

  // src/browser/registry.ts
  var available = {};
  var registered = /* @__PURE__ */ new Map();
  var removeRegistration = (id) => {
    const entry = registered.get(id);
    if (!entry) return;
    entry.destroy();
    registered.delete(id);
    delete available[id];
  };
  var newTicker = ({ id, options = {} }) => {
    if (!id) {
      console.error("Ticker ID is required");
      return null;
    }
    const previous = registered.get(id);
    const source = previous?.source ?? document.getElementById(id);
    if (!(source instanceof HTMLElement)) {
      console.warn(`Ticker with ID ${id} not found`);
      return null;
    }
    if (previous) removeRegistration(id);
    const instance = ticker(source, options);
    if (!instance?.element) return null;
    registered.set(id, instance);
    available[id] = instance.element;
    return instance;
  };
  var getTicker = (id) => available[id] ?? null;
  var getTickers = () => ({
    ...available
  });
  var destroyTicker2 = (target) => {
    if (typeof target === "string") return removeRegistration(target);
    const entry = Array.from(registered.entries()).find(([, value]) => value.element === target);
    if (entry) return removeRegistration(entry[0]);
  };
  var destroyTickers = () => Array.from(registered.keys()).forEach(removeRegistration);
  var Ticker = {
    ticker,
    newTicker,
    getTicker,
    getTickers,
    destroyTicker: destroyTicker2,
    destroyTickers,
    available
  };

  // src/browser/global.ts
  if (typeof globalThis !== "undefined") {
    ;
    globalThis.Ticker = Ticker;
  }
  var browser = Ticker;
  var ticker2 = Ticker.ticker;
  var newTicker2 = Ticker.newTicker;
  var getTicker2 = Ticker.getTicker;
  var getTickers2 = Ticker.getTickers;
  var destroyTicker3 = Ticker.destroyTicker;
  var destroyTickers2 = Ticker.destroyTickers;
  var available2 = Ticker.available;
  var global_default = Ticker;
  return __toCommonJS(global_exports);
})();
