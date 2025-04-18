// src/app/components/chartTheme.js
import { Chart as ChartJS, registerables } from "chart.js";

// register all built‑in elements/controllers/plugins
ChartJS.register(...registerables);

// Fallback colors for SSR
const FALLBACK_FG = "#ededed";
const FALLBACK_BG = "#14161a";

// Only read CSS variables in the browser
let fg = FALLBACK_FG;
let bg = FALLBACK_BG;
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const styles = getComputedStyle(document.documentElement);
  fg = styles.getPropertyValue("--foreground").trim() || FALLBACK_FG;
  bg = styles.getPropertyValue("--background").trim() || FALLBACK_BG;
}

// Global Chart.js defaults
ChartJS.defaults.color = fg;
ChartJS.defaults.font.family = "Arial, Helvetica, sans-serif";
ChartJS.defaults.font.size = 13;
ChartJS.defaults.plugins.legend.labels.color = fg;
ChartJS.defaults.plugins.tooltip.backgroundColor = "rgba(0,0,0,0.7)";
ChartJS.defaults.plugins.tooltip.titleColor = "#fff";
ChartJS.defaults.plugins.tooltip.bodyColor = "#fff";
ChartJS.defaults.elements.line.tension = 0.4;
ChartJS.defaults.elements.line.borderWidth = 2;
ChartJS.defaults.elements.point.radius = 3;
ChartJS.defaults.elements.point.hoverRadius = 6;
ChartJS.defaults.scales = {
  x: {
    grid: { color: "rgba(255,255,255,0.1)" },
    ticks: { color: fg },
  },
  y: {
    grid: { color: "rgba(255,255,255,0.1)" },
    ticks: { color: fg },
  },
};

export default ChartJS;
