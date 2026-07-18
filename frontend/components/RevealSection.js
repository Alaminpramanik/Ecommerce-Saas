import useReveal from "./useReveal";

export default function RevealSection({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ animationDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
