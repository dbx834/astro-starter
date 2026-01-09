import React from "react";

const SvgSymbol = ({ size = 225, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={900}
    height={900}
    viewBox="0 0 900 900"
    {...props}
  >
    <g fill="none" fillRule="evenodd">
      <circle cx={445} cy={445} r={434} stroke="#000" strokeWidth={18} />
      <circle cx={445} cy={445} r={size} fill="#000" />
    </g>
  </svg>
);

export default SvgSymbol;
