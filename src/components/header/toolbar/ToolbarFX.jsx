import React, { useEffect, useState, useCallback } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import YinYang from "./YinYang";

import { useStore } from "@nanostores/react";
import {
  dayNightMode,
  toggleDayNightMode,
  theme,
  cycleTheme,
} from "@/store/theme.js";

function stripByPrefix(root, prefix) {
  const toRemove = [];
  root.classList.forEach((c) => {
    if (c.indexOf(prefix) === 0) toRemove.push(c);
  });
  toRemove.forEach((c) => root.classList.remove(c));
}

export default function HeaderToggle() {
  const currentMode = useStore(dayNightMode);
  const currentTheme = useStore(theme);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (currentMode === "night") {
      root.classList.add("night");
      root.classList.remove("day");
    } else {
      root.classList.add("day");
      root.classList.remove("night");
    }
    root.dataset.mode = currentMode;
  }, [currentMode]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    stripByPrefix(root, "t-");
    if (currentTheme) root.classList.add(currentTheme);
    root.dataset.theme = currentTheme || "";
  }, [currentTheme]);

  const toggleMode = useCallback(() => {
    toggleDayNightMode();
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <li>
        <button
          type="button"
          className="linklike toolbar-button"
          aria-label="Change color theme"
          onClick={() => cycleTheme()}
          title="Change color theme"
        >
          <YinYang className="yin-yang" role="img" />
        </button>
      </li>
      <li>
        <button
          type="button"
          className="linklike dm-toggle toolbar-button"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {mounted ? (
            <DarkModeSwitch
              moonColor="#e7f5ff"
              sunColor="#fab005"
              size={24}
              checked={currentMode === "night"}
              onChange={toggleMode}
            />
          ) : null}
        </button>
      </li>
    </>
  );
}
