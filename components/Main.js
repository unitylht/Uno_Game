import { useEffect } from "react";
import classnames from "classnames";
const MAIN_COLORS = {
  green: "bg-green-900",
  gray: "bg-gray-900",
  gradient: "bg-gradient-to-br from-slate-950 via-slate-900 to-black",
};
const JUSTIFY = {
  start: "",
  center: "justify-center",
};
const PRIMARY_BACKGROUND = {
  green: "#064e3b",
  gray: "#111827",
  gradient: "#0b1224",
};

function setViewportHeight() {
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  document.documentElement.style.setProperty("font-size", `${vh * 2}px`);
}

if (typeof window !== "undefined") {
  // We listen to the resize event
  window.addEventListener("resize", setViewportHeight);
  setViewportHeight();
}

export default function Main({ children, color = "gray", justify = "start" }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const background = PRIMARY_BACKGROUND[color] || PRIMARY_BACKGROUND.gray;
    document.documentElement.style.setProperty("--primary-bg-color", background);
    if (color === "gradient") {
      document.body.style.background =
        "linear-gradient(135deg, #0b1224 0%, #111827 40%, #0b0f1a 100%)";
    } else {
      document.body.style.background = background;
      document.body.style.backgroundColor = background;
    }
  }, [color]);

  const className = classnames([
    "flex flex-col height-screen",
    MAIN_COLORS[color],
    JUSTIFY[justify],
  ]);

  return <main className={className}>{children}</main>;
}
