import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        shadow-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}