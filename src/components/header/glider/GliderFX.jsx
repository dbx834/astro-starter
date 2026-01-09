import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useId,
} from "react";
import { createPortal } from "react-dom";
import classnames from "classnames";
import { useSpring, animated } from "@react-spring/web";

import Close from "./Close";

import Settings from "./panels/Settings";

/* ---------- Helpers ---------- */
const getFocusable = (root) =>
  root
    ? Array.from(
        root.querySelectorAll(
          [
            "a[href]",
            "area[href]",
            "button:not([disabled])",
            "input:not([disabled]):not([type=hidden])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "details",
            "summary",
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]',
          ].join(","),
        ),
      ).filter(
        (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"),
      )
    : [];

/** Accessible sliding side panel with deferred content mount */
const GliderIsland = ({
  open = false,
  mediaState,
  title,
  children,
  panel,
  close, // node to render in header (e.g., a Close button)
  onClose, // optional: () => void
  className,
}) => {
  const [sw, setSw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    let rAF = 0;
    const onResize = () => {
      // rAF throttling to avoid spamming renders
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => setSw(window.innerWidth));
    };

    window.addEventListener("resize", onResize, { passive: true });
    onResize(); // set initial
    return () => {
      cancelAnimationFrame(rAF);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const { currentWidth, screenWidth } = mediaState || {};
  const isMobile =
    currentWidth === "w-xs" ||
    currentWidth === "w-sm" ||
    currentWidth === "w-md";

  // SSR-safe viewport width fallback
  // const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  // const targetWidth = useMemo(() => {
  //   // let base = 0.33
  //   // let forceW = undefined
  //   // switch (panel) {
  //   //   case 'about':
  //   //     base = 0.45
  //   //     break
  //   //   case 'subscriptions':
  //   //     base = 0.55
  //   //     break
  //   //   case 'support':
  //   //     forceW = 600
  //   //     break
  //   //   case 'settings':
  //   //     base = 0.5
  //   //     break
  //   //   case 'menu':
  //   //     base = 1
  //   //     break
  //   //   default:
  //   //     base = 0.33
  //   // }
  //   // if (isMobile) {
  //   //   base = 1
  //   // }
  //   // const w = (screenWidth || vw) * base
  //   // console.debug(
  //   //   panel,
  //   //   currentWidth,
  //   //   isMobile,
  //   //   'w',
  //   //   isMobile ? vw : forceW ? forceW : Math.min(Math.max(w, 320), 900)
  //   // )
  //   // return isMobile ? vw : forceW ? forceW : Math.min(Math.max(w, 320), 900)
  //   console.debug('sw', sw)
  //   return Math.round(Math.min(sw * 0.66, 600))
  // }, [sw, panel])

  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const targetWidth = Math.round(Math.min(Math.max(vw * 0.66, 350), 750));

  // ---------- Nano state object ----------
  const [state, setState] = useState({
    reducedMotion: false,
    slideFinishedAt: 0,
    showContent: false,
  });
  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  // Reduced motion
  // useEffect(() => {
  //   if (typeof window === 'undefined' || !window.matchMedia) return
  //   const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  //   const apply = () => set({ reducedMotion: !!mq.matches })
  //   apply()
  //   mq.addEventListener?.('change', apply)
  //   return () => mq.removeEventListener?.('change', apply)
  // }, [])

  // Body scroll lock while open
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus management
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    if (open) {
      lastActiveRef.current =
        typeof document !== "undefined" ? document.activeElement : null;
      const t = setTimeout(() => {
        const focusables = getFocusable(panelRef.current);
        (focusables[0] || panelRef.current)?.focus?.();
      }, 0);
      return () => clearTimeout(t);
    } else if (lastActiveRef.current) {
      lastActiveRef.current?.focus?.();
      lastActiveRef.current = null;
    }
  }, [open]);

  // Trap focus & Esc
  const onKeyDown = useCallback(
    (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "Tab") {
        const focusables = getFocusable(panelRef.current);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [open, onClose],
  );

  // Backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) onClose?.();
    },
    [onClose],
  );

  // Slide animation
  const slideSpring = useSpring({
    from: { x: 100, opacity: 0 },
    to: { x: open ? 0 : 100, opacity: open ? 1 : 0 },
    config: { tension: 300, friction: 30, clamp: true },
    immediate: state.reducedMotion,
    onRest: () => {
      if (!open) return;
      // begin deferred content mount
      set({ slideFinishedAt: Date.now() });
    },
  });

  // Deferred content (mounted after slide end + delay)
  const delayRef = useRef(null);
  useEffect(() => {
    if (!open) {
      set({ showContent: false, slideFinishedAt: 0 });
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      return;
    }
    if (state.slideFinishedAt && open) {
      if (delayRef.current) clearTimeout(delayRef.current);
      delayRef.current = setTimeout(() => {
        set({ showContent: true });
        delayRef.current = null;
      }, 750);
    }
    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
    };
  }, [open, state.slideFinishedAt]);

  // Content fade
  const contentSpring = useSpring({
    from: { opacity: 0, transform: "translateY(4px)" },
    to: {
      opacity: state.showContent ? 1 : 0,
      transform: state.showContent ? "translateY(0px)" : "translateY(4px)",
    },
    config: { tension: 250, friction: 24, clamp: true },
    immediate: state.reducedMotion,
  });

  const asideStyles = {
    width: targetWidth,
    maxWidth: targetWidth,
    transform: slideSpring.x.to((v) => `translate3d(${v}%,0,0)`),
    opacity: slideSpring.opacity,
    boxShadow: open ? "-5rem -1rem 200rem var(--dark)" : "0 0 0 transparent",
    outline: "none",
  };

  const layerStyle = {
    pointerEvents: open ? "auto" : "none",
  };
  const backdropStyle = {
    opacity: open ? 1 : 0,
    transition: "opacity 300ms ease",
  };

  const content = (
    <div
      className={classnames("glider-layer", { open })}
      // aria-hidden={!open}
      style={layerStyle}
    >
      {/* Backdrop */}
      <div
        className={classnames("glider-backdrop", { open })}
        onMouseDown={handleBackdropClick}
        aria-hidden="true"
        style={backdropStyle}
      />
      {/* Panel */}
      <animated.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        ref={panelRef}
        className={classnames(
          "glider",
          { active: open, passive: !open },
          className,
        )}
        style={asideStyles}
        onKeyDown={onKeyDown}
      >
        <div className="glider-inner">
          <div className="l-r top">
            <div className="l">
              <p id={headingId} className="sub-head">
                {title}
              </p>
            </div>
            <div className="r">
              <button
                type="button"
                className="close linklike"
                onClick={onClose}
                aria-label="Close panel"
              >
                <Close />
              </button>
            </div>
          </div>

          {/* Deferred content */}
          {state.showContent ? (
            <animated.div
              style={{
                ...contentSpring,
              }}
            >
              {children}
            </animated.div>
          ) : null}
        </div>
      </animated.aside>
    </div>
  );

  // Portal so it isn't clipped by parent stacking/overflow
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
};

const GliderFX = ({
  // Fallback title if not provided by the event
  defaultTitle = "Panel",

  // Optional: override or extend the built-in mapping
  panels: panelsProp,
  mediaState = { currentWidth: "w-md", screenWidth: 1440 },
  topKeywords,
  themes,
  topContributors,
  latestIssue,
}) => {
  // ---------- nano state object ----------
  const [state, setState] = useState({ open: false, panel: null, title: "" });
  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  // Listen for global events
  useEffect(() => {
    const onOpen = (e) => {
      const detail = e?.detail || {};
      const panelId = detail.panel || null;
      const title = detail.title || defaultTitle;
      set({ open: true, panel: panelId, title });
    };
    const onClose = () => set({ open: false, panel: null });

    document.addEventListener("glider:open", onOpen);
    document.addEventListener("glider:close", onClose);

    // expose helpers for convenience (optional)
    window.openGlider = (panel, title) =>
      document.dispatchEvent(
        new CustomEvent("glider:open", { detail: { panel, title } }),
      );
    window.closeGlider = () =>
      document.dispatchEvent(new CustomEvent("glider:close"));

    return () => {
      document.removeEventListener("glider:open", onOpen);
      document.removeEventListener("glider:close", onClose);
      delete window.openGlider;
      delete window.closeGlider;
    };
  }, [defaultTitle]);

  // Click-to-open via data attribute (e.g., data-glider-open-menu)
  useEffect(() => {
    const onClick = (e) => {
      const trigger = e.target.closest("[data-glider-open-menu]");
      if (!trigger) return;

      // prevent default if it's an <a> or <button> that might navigate/submit
      e.preventDefault();

      // Reuse your global event channel
      document.dispatchEvent(
        new CustomEvent("glider:open", {
          detail: { panel: "menu", title: "Menu" },
        }),
      );
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const handleClose = () => set({ open: false, panel: null });

  // Panel registry (id -> React node or renderer)
  const panels = useMemo(
    () => ({
      about: {
        title: (
          <>
            About <i>Equals One</i>
          </>
        ),
        content: <div>About Equals One</div>,
      },
      contact: {
        title: <>Contact us</>,
        content: <div>Contact us</div>,
      },
      settings: {
        title: <>Customise</>,
        content: <Settings handleClose={handleClose} />,
      },
      ...(panelsProp || {}), // allow caller to inject/override
    }),
    [panelsProp],
  );

  // Resolve content
  const content =
    state.panel && panels[state.panel] ? panels[state.panel].content : null;
  const title =
    state.panel && panels[state.panel] ? panels[state.panel].title : null;

  return (
    <GliderIsland
      open={state.open}
      title={title}
      panel={state.panel && panels[state.panel] ? state.panel : null}
      mediaState={mediaState}
      onClose={handleClose}
    >
      {content || <div style={{ padding: "var(--p)" }}>Nothing to show.</div>}
    </GliderIsland>
  );
};

export default GliderFX;
