import React from "react";
import { compiler } from "markdown-to-jsx";

const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function Markdown({
  className = "",
  markdown = "",
  style = {},
  overrides = {},
  forceBlock = false,
}) {
  return (
    <div className={cx("md", className)} style={style}>
      {compiler(markdown, {
        wrapper: null,
        forceBlock,
        overrides,
      })}
    </div>
  );
}
