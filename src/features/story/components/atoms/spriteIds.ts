import { useId } from "react";

/** Ids for a drawing's own gradients: React's useId, made safe for url(#…), so two copies of a sprite never share one. */
export function useIds() {
  const base = useId().replace(/[^\w-]/g, "");
  return (name: string) => `${base}-${name}`;
}

export const url = (id: string) => `url(#${id})`;
