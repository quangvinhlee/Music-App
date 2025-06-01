import { useState } from "react";

export function useImageErrors() {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const hasImageError = (id: string) => imageErrors.has(id);

  return { handleImageError, hasImageError };
}
