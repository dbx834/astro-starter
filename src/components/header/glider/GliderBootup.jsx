import { useEffect } from "react";

export default function GliderBoot(props) {
  useEffect(() => {
    let mounted = false;
    let mounting = false;
    const queue = [];

    const afterEverything = (cb) => {
      const go = () =>
        window.requestIdleCallback
          ? window.requestIdleCallback(cb)
          : setTimeout(cb, 1);
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    };

    async function mount() {
      if (mounted || mounting) return;
      mounting = true;
      // Import only when needed (separate chunk)
      const [{ createElement }, { createRoot }, { default: GliderFX }] =
        await Promise.all([
          import("react"),
          import("react-dom/client"),
          import("./GliderFX.jsx"),
        ]);

      const node = document.createElement("div");
      document.body.appendChild(node);
      const root = createRoot(node);
      root.render(createElement(GliderFX, props));
      mounted = true;
      mounting = false;

      // Re-dispatch any queued open events so Glider opens immediately after mount
      queue.splice(0).forEach((evt) => document.dispatchEvent(evt));
    }

    // If a user tries to open before we've loaded, mount then replay the event.
    const onEarlyOpen = (e) => {
      if (mounted) return;
      queue.push(new CustomEvent("glider:open", { detail: e.detail }));
      mount();
    };
    document.addEventListener("glider:open", onEarlyOpen);

    // Otherwise, mount after page load + idle
    afterEverything(() => mount());

    return () => {
      document.removeEventListener("glider:open", onEarlyOpen);
    };
  }, []);

  return null;
}
