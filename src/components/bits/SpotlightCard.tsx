import { type MouseEvent, type ReactNode, useRef } from "react";

export function SpotlightCard({ children, className = "", onClick, as = "div" }: { children: ReactNode; className?: string; onClick?: () => void; as?: "div" | "button" }) {
  const ref = useRef<HTMLElement>(null);
  const move = (event: MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  };
  const Component = as;
  return <Component ref={ref as never} className={`spotlight-card ${className}`} onMouseMove={move} onClick={onClick}>{children}</Component>;
}
