interface BlossomSprigProps {
  variant?: "coral" | "blue" | "mixed" | "pink" | "cream";
  className?: string;
}

export function BlossomSprig({ variant = "mixed", className = "" }: BlossomSprigProps) {
  return (
    <span className={`blossom-sprig blossom-${variant} ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
