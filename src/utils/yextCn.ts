import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function yextCn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
