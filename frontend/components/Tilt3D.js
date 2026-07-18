import { useRef } from "react";

export default function Tilt3D({ children, className = "", max = 12, scale = 1.03 }) {
  const ref = useRef(null);
  const frame = useRef(null);

  const handleMove = (e) => {
    const node = ref.current;
    if (!node) return;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * max * 2;
      const rotateX = (0.5 - py) * max * 2;

      node.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      node.style.setProperty("--glare-x", `${px * 100}%`);
      node.style.setProperty("--glare-y", `${py * 100}%`);
      node.style.setProperty("--glare-opacity", "0.35");
    });
  };

  const handleLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    node.style.setProperty("--glare-opacity", "0");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-3d ${className}`}
      style={{
        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}
