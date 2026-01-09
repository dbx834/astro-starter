import React, { useEffect, useState } from "react";

import times from "lodash/times";

import { useStore } from "@nanostores/react";
import {
  dayNightMode,
  setDayNightMode,
  theme,
  setTheme,
  size,
  setSize,
  // fontFace,
  // setFontFace,
} from "@/store/theme.ts";

import { DarkModeSwitch } from "react-toggle-dark-mode";
import Sizer from "./Sizer";
import YinYang from "../../toolbar/YinYang";

function stripByPrefix(root, prefix) {
  const toRemove = [];
  root.classList.forEach((c) => {
    if (c.indexOf(prefix) === 0) toRemove.push(c);
  });
  toRemove.forEach((c) => root.classList.remove(c));
}

const themes = times(10, (i) => `t-${i + 1}`);

export default function HeaderToggle() {
  const sizeMap = {
    "s-1": 225,
    "s-2": 270,
    "s-3": 315,
    "s-4": 360,
    "s-5": 405,
  };

  const currentMode = useStore(dayNightMode);
  const currentTheme = useStore(theme);
  const currentSize = useStore(size);
  // const currentFontFace = useStore(fontFace);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    stripByPrefix(root, "s-");
    if (currentSize) root.classList.add(currentSize);
    root.dataset.size = currentSize || "";
  }, [currentSize]);

  // useEffect(() => {
  //   if (typeof document === "undefined") return;
  //   const root = document.documentElement;
  //   stripByPrefix(root, "ff-");
  //   if (currentFontFace) root.classList.add(currentFontFace);
  //   root.dataset.fontFace = currentFontFace || "";
  // }, [currentFontFace]);

  return (
    <div>
      <p>
        <strong>Color scheme:</strong>
      </p>
      <div className="settings-grid grid">
        {themes.map((theme) => (
          <div>
            <button
              type="button"
              className={`linklike ${theme}`}
              aria-label="Change color theme"
              onClick={() => setTheme(theme)}
            >
              <YinYang className="yin-yang" role="img" />
            </button>
            <span className={currentTheme === theme ? "active" : "passive"} />
          </div>
        ))}
      </div>
      <br />
      <br />
      <p>
        <strong>Light/dark mode:</strong>
      </p>
      <div className="settings-grid grid">
        <div>
          {mounted ? (
            <DarkModeSwitch
              moonColor="#e7f5ff"
              sunColor="#fab005"
              size={60}
              checked={false}
              onChange={() => setDayNightMode("day")}
            />
          ) : null}
          <span className={currentMode === "day" ? "active" : "passive"} />
        </div>
        <div>
          {mounted ? (
            <DarkModeSwitch
              moonColor="#e7f5ff"
              sunColor="#fab005"
              size={60}
              checked={true}
              onChange={() => setDayNightMode("night")}
            />
          ) : null}
          <span className={currentMode === "night" ? "active" : "passive"} />
        </div>
      </div>
      <br />
      <br />
      <p>
        <strong>Font size:</strong>
      </p>
      <div className="settings-grid grid">
        <div>
          <button
            type="button"
            className="linklike s-1"
            aria-label="Change color theme"
            onClick={() => setSize("s-1")}
          >
            <Sizer className="sizer" role="img" size={sizeMap["s-1"]} />
          </button>
          <span className={currentSize === "s-1" ? "active" : "passive"} />
        </div>
        <div>
          <button
            type="button"
            className="linklike s-2"
            aria-label="Change color theme"
            onClick={() => setSize("s-2")}
          >
            <Sizer className="sizer" role="img" size={sizeMap["s-2"]} />
          </button>
          <span className={currentSize === "s-2" ? "active" : "passive"} />
        </div>
        <div>
          <button
            type="button"
            className="linklike s-3"
            aria-label="Change color theme"
            onClick={() => setSize("s-3")}
          >
            <Sizer className="sizer" role="img" size={sizeMap["s-3"]} />
          </button>
          <span className={currentSize === "s-3" ? "active" : "passive"} />
        </div>
        <div>
          <button
            type="button"
            className="linklike s-4"
            aria-label="Change color theme"
            onClick={() => setSize("s-4")}
          >
            <Sizer className="sizer" role="img" size={sizeMap["s-4"]} />
          </button>
          <span className={currentSize === "s-4" ? "active" : "passive"} />
        </div>
        <div>
          <button
            type="button"
            className="linklike s-5"
            aria-label="Change color theme"
            onClick={() => setSize("s-5")}
          >
            <Sizer className="sizer" role="img" size={sizeMap["s-5"]} />
          </button>
          <span className={currentSize === "s-5" ? "active" : "passive"} />
        </div>
      </div>
      {/* <br />
      <br />
      <p>
        <strong>Font family:</strong>
      </p>
      <div className="settings-grid grid">
        <div>
          <button
            type="button"
            className="linklike ff-90"
            aria-label="Change color theme"
            onClick={() => setFontFace('ff-90')}
          >
            <FontFamily className="font-family" role="img" />
          </button>
          <span
            className={currentFontFace === 'ff-90' ? 'active' : 'passive'}
          />
        </div>
        <div>
          <button
            type="button"
            className="linklike ff-91"
            aria-label="Change color theme"
            onClick={() => setFontFace('ff-91')}
          >
            <FontFamily className="font-family" role="img" />
          </button>
          <span
            className={currentFontFace === 'ff-91' ? 'active' : 'passive'}
          />
        </div>
      </div>*/}
      {/* <p>
        <strong>Roundedness:</strong>
      </p>
      <div class="x-rectangle"></div>
      <div class="x-circle"></div>*/}
    </div>
  );
}
