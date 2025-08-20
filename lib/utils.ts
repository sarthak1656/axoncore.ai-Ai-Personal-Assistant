import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import AiModelOptions from "@/services/AiModelOptions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get model name from model ID
export function getModelName(modelId: string): string {
  const model = AiModelOptions.find((m) => m.model === modelId);
  return model?.name || modelId;
}

// Get model logo from model ID
export function getModelLogo(modelId: string): string {
  const model = AiModelOptions.find((m) => m.model === modelId);
  return model?.logo || "/chatgpt.png";
}
