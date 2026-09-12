import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={`
        w-full
        rounded-2xl
        border border-white/10
        bg-zinc-900
        px-5
        py-4
        text-white
        placeholder:text-zinc-500
        outline-none
        transition
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-500/20
        ${className}
      `}
    />
  );
}