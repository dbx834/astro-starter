(() => {
  if (window.__mediaAwareBody) {
    try {
      window.__mediaAwareBody.recompute?.();
    } catch {}
    return;
  }

  const PREFIX = "x-";
  const withPrefix = (k) => PREFIX + k;
  const RAW_CLASS_KEYS = [
    "w-xxl",
    "w-xl",
    "w-lg",
    "w-md",
    "w-sm",
    "w-xs",
    "h-xxl",
    "h-xl",
    "h-lg",
    "h-md",
    "h-sm",
    "h-xs",
    "is-portrait",
    "is-landscape",
    "is-retina",
  ];
  const CLASS_KEYS = RAW_CLASS_KEYS.map(withPrefix);

  const withDataEnabled = () =>
    document.body?.hasAttribute("data-media-attrs") ||
    !!(window.MEDIA_AWARE_OPTIONS && window.MEDIA_AWARE_OPTIONS.withData);

  let rafId = 0;
  let cached = null;
  let mqs = null;
  let bodyObserver = null;

  const MIN_INTERVAL = Math.max(
    0,
    Number(window.MEDIA_AWARE_OPTIONS?.minIntervalMs ?? 1000),
  );
  let lastRun = 0;
  let scheduled = false;
  let pendingHard = false;
  let lastClassSig = "";

  const buildQueries = () => {
    const mq = (q) => window.matchMedia(q);
    mqs = {
      wXXL: mq("(min-width: 1600px)"),
      wXL: mq("(min-width: 1201px) and (max-width: 1599px)"),
      wLG: mq("(min-width: 993px) and (max-width: 1200px)"),
      wMD: mq("(min-width: 769px) and (max-width: 992px)"),
      wSM: mq("(min-width: 577px) and (max-width: 768px)"),
      wXS: mq("(max-width: 576px)"),
      hXXL: mq("(min-height: 1600px)"),
      hXL: mq("(min-height: 1201px) and (max-height: 1599px)"),
      hLG: mq("(min-height: 993px) and (max-height: 1200px)"),
      hMD: mq("(min-height: 769px) and (max-height: 992px)"),
      hSM: mq("(min-height: 577px) and (max-height: 768px)"),
      hXS: mq("(max-height: 576px)"),
      portrait: mq("(orientation: portrait)"),
      landscape: mq("(orientation: landscape)"),
      retina: mq("(min-resolution: 2dppx)"),
    };
  };

  const schedule = (opts = {}) => {
    if (opts.force) pendingHard = true;
    if (scheduled) return;
    if (rafId) cancelAnimationFrame(rafId);
    scheduled = true;
    rafId = requestAnimationFrame(() => {
      scheduled = false;
      const now = performance.now();
      const dt = now - lastRun;
      if (dt < MIN_INTERVAL) {
        setTimeout(() => schedule(), MIN_INTERVAL - dt);
        return;
      }
      lastRun = performance.now();
      tick();
    });
  };

  const onChange = () => schedule();
  const onBeforeSwap = () => {
    detach();
  };
  const onAfterSwap = () => {
    startBodyObserver();
    buildQueries();
    attach();
    pendingHard = true;
    lastRun = 0;
    tick();
  };

  const attach = () => {
    addEventListener("resize", onChange, { passive: true });
    addEventListener("orientationchange", onChange, { passive: true });
    addEventListener("pageshow", onChange, { passive: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) onChange();
      },
      { passive: true },
    );

    Object.values(mqs).forEach((m) =>
      m.addEventListener
        ? m.addEventListener("change", onChange)
        : m.addListener(onChange),
    );

    document.addEventListener("astro:before-swap", onBeforeSwap);
    document.addEventListener("astro:after-swap", onAfterSwap);
    document.addEventListener("astro:page-load", onAfterSwap);
    addEventListener("astro:before-swap", onBeforeSwap);
    addEventListener("astro:after-swap", onAfterSwap);

    addEventListener("popstate", onChange);
  };

  const detach = () => {
    removeEventListener("resize", onChange);
    removeEventListener("orientationchange", onChange);
    removeEventListener("pageshow", onChange);
    document.removeEventListener("visibilitychange", onChange);

    if (mqs) {
      Object.values(mqs).forEach((m) =>
        m.removeEventListener
          ? m.removeEventListener("change", onChange)
          : m.removeListener(onChange),
      );
    }

    document.removeEventListener("astro:before-swap", onBeforeSwap);
    document.removeEventListener("astro:after-swap", onAfterSwap);
    document.removeEventListener("astro:page-load", onAfterSwap);
    removeEventListener("astro:before-swap", onBeforeSwap);
    removeEventListener("astro:after-swap", onAfterSwap);

    removeEventListener("popstate", onChange);

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const startBodyObserver = () => {
    try {
      bodyObserver?.disconnect();
    } catch {}
    bodyObserver = new MutationObserver(() => {
      const b = document.body;
      if (b && !b.classList.contains("media-aware")) {
        pendingHard = true;
        tick();
      }
    });
    bodyObserver.observe(document.documentElement, {
      childList: true,
      subtree: false,
    });
  };

  const isRetina = () =>
    (window.devicePixelRatio || 1) >= 2 || mqs.retina.matches;

  const pickSize = () => ({
    width: Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    ),
    height: Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0,
    ),
  });

  const stepForWidth = (w) => {
    const STEPS = [
      200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600,
    ];
    let s = STEPS[0];
    for (let i = 0; i < STEPS.length; i++) {
      if (STEPS[i] <= w) s = STEPS[i];
      else break;
    }
    return s;
  };

  const scale = () => {
    const STEPS = [
      200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600,
    ];
    const RANGE = [15, 25];
    const min = (a) => a.reduce((x, y) => (x < y ? x : y), a[0]);
    const max = (a) => a.reduce((x, y) => (x > y ? x : y), a[0]);
    const linear = (dMin, dMax, rMin, rMax) => (x) => {
      const t = Math.max(dMin, Math.min(dMax, x));
      const u = (t - dMin) / (dMax - dMin || 1);
      return rMin + u * (rMax - rMin);
    };
    return linear(min(STEPS), max(STEPS), min(RANGE), max(RANGE));
  };

  const compute = () => {
    const size = pickSize();
    const point = scale()(stepForWidth(size.width));
    const f = mqs;

    const currentWidth = f.wXXL.matches
      ? "w-xxl"
      : f.wXL.matches
        ? "w-xl"
        : f.wLG.matches
          ? "w-lg"
          : f.wMD.matches
            ? "w-md"
            : f.wSM.matches
              ? "w-sm"
              : "w-xs";

    const currentHeight = f.hXXL.matches
      ? "h-xxl"
      : f.hXL.matches
        ? "h-xl"
        : f.hLG.matches
          ? "h-lg"
          : f.hMD.matches
            ? "h-md"
            : f.hSM.matches
              ? "h-sm"
              : "h-xs";

    return {
      widthIsExtraExtraLarge: f.wXXL.matches,
      widthIsExtraLarge: f.wXL.matches,
      widthIsLarge: f.wLG.matches,
      widthIsMedium: f.wMD.matches,
      widthIsSmall: f.wSM.matches,
      widthIsExtraSmall: f.wXS.matches,

      heightIsExtraExtraLarge: f.hXXL.matches,
      heightIsExtraLarge: f.hXL.matches,
      heightIsLarge: f.hLG.matches,
      heightIsMedium: f.hMD.matches,
      heightIsSmall: f.hSM.matches,
      heightIsExtraSmall: f.hXS.matches,

      isPortrait: f.portrait.matches,
      isLandscape: f.landscape.matches,
      isRetina: isRetina(),

      currentOrientation: f.portrait.matches ? "portrait" : "landscape",
      currentWidth,
      currentHeight,
      currentWidthClass: withPrefix(currentWidth),
      currentHeightClass: withPrefix(currentHeight),

      screenWidth: size.width,
      screenHeight: size.height,
      point,
    };
  };

  const shallowEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const ka = Object.keys(a),
      kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (a[k] !== b[k]) return false;
    return true;
  };

  const updateClasses = () => {
    const b = document.body;
    if (!b || !mqs) return;

    const map = {
      [withPrefix("w-xxl")]: mqs.wXXL.matches,
      [withPrefix("w-xl")]: mqs.wXL.matches,
      [withPrefix("w-lg")]: mqs.wLG.matches,
      [withPrefix("w-md")]: mqs.wMD.matches,
      [withPrefix("w-sm")]: mqs.wSM.matches,
      [withPrefix("w-xs")]: mqs.wXS.matches,

      [withPrefix("h-xxl")]: mqs.hXXL.matches,
      [withPrefix("h-xl")]: mqs.hXL.matches,
      [withPrefix("h-lg")]: mqs.hLG.matches,
      [withPrefix("h-md")]: mqs.hMD.matches,
      [withPrefix("h-sm")]: mqs.hSM.matches,
      [withPrefix("h-xs")]: mqs.hXS.matches,

      [withPrefix("is-portrait")]: mqs.portrait.matches,
      [withPrefix("is-landscape")]: mqs.landscape.matches,
      [withPrefix("is-retina")]: isRetina(),
    };

    const nextSig =
      "media-aware " +
      Object.keys(map)
        .filter((k) => map[k])
        .sort()
        .join(" ");
    if (nextSig === lastClassSig && !pendingHard) return;

    b.classList.remove(...CLASS_KEYS);
    b.classList.add("media-aware");
    for (const k in map) if (map[k]) b.classList.add(k);
    lastClassSig = nextSig;
    pendingHard = false;
  };

  const setData = (state) => {
    if (!withDataEnabled() || !document.body) return;
    for (const [k, v] of Object.entries(state)) {
      const key = "data-" + k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      document.body.setAttribute(key, String(v));
    }
  };

  const tick = () => {
    rafId = 0;
    const next = compute();
    if (pendingHard || !shallowEqual(next, cached)) {
      cached = next;
      updateClasses();
      setData(next);
      dispatchEvent(new CustomEvent("media-state:update", { detail: next }));
    }
  };

  const initial = () => {
    buildQueries();
    attach();
    startBodyObserver();
    pendingHard = true;
    lastRun = 0;
    tick();
  };

  const start = () => {
    if (document.body) initial();
    else addEventListener("DOMContentLoaded", initial, { once: true });
  };

  const stop = () => {
    try {
      bodyObserver?.disconnect();
    } catch {}
    detach();
  };

  window.__mediaAwareBody = {
    start,
    stop,
    recompute: () => schedule({ force: true }),
  };
  start();
})();
