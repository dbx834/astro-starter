import * as React from "react";
const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M15.71 8.29a1 1 0 0 0-1.41 0l-2.3 2.3-2.29-2.3a1 1 0 0 0-1.42 1.42l2.3 2.29-2.3 2.29A1 1 0 1 0 9.7 15.7l2.3-2.29 2.29 2.29a1 1 0 0 0 1.41-1.41L13.41 12l2.29-2.29a1 1 0 0 0 .01-1.42Z" />
    <path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9Z" />
  </svg>
);
export default SvgComponent;
