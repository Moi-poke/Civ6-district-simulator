import React from "react";

export function Button({ className = "", size, children, ...props }) {
  const sizeCls = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-bold transition ${sizeCls} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
