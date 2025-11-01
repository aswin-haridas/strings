import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

export { Button };
