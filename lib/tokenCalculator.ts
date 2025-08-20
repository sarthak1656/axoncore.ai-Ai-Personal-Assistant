// Token calculation utility for accurate usage tracking
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ModelPricing {
  inputCostPer1k: number; // Cost per 1000 input tokens
  outputCostPer1k: number; // Cost per 1000 output tokens
}

// Pricing data from OpenRouter (approximate costs)
export const MODEL_PRICING: Record<string, ModelPricing> = {
  "google/gemini-2.0-flash-lite-001": {
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
  },
  "openai/gpt-4o-mini": {
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
  },
  "openai/gpt-3.5-turbo": {
    inputCostPer1k: 0.0005,
    outputCostPer1k: 0.0015,
  },
  "mistralai/mistral-saba": {
    inputCostPer1k: 0.00014,
    outputCostPer1k: 0.00042,
  },
  "anthropic/claude-3-5-haiku": {
    inputCostPer1k: 0.00025,
    outputCostPer1k: 0.00125,
  },
  "deepseek/deepseek-coder-33b-instruct": {
    inputCostPer1k: 0.00007,
    outputCostPer1k: 0.00014,
  },
  "google/gemini-2.5-flash-lite": {
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
  },
};

// Rough token estimation (words to tokens conversion)
export function estimateTokens(text: string): number {
  if (!text || !text.trim()) return 0;

  // Rough estimation: 1 token ≈ 0.75 words for English
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 0.75);
}

// Calculate token usage and cost
export function calculateTokenUsage(
  userInput: string,
  aiResponse: string,
  modelName: string
): TokenUsage {
  const inputTokens = estimateTokens(userInput);
  const outputTokens = estimateTokens(aiResponse);
  const totalTokens = inputTokens + outputTokens;

  const pricing =
    MODEL_PRICING[modelName] || MODEL_PRICING["openai/gpt-3.5-turbo"];

  const inputCost = (inputTokens / 1000) * pricing.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputCostPer1k;
  const estimatedCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCost,
  };
}

// Get model pricing info
export function getModelPricing(modelName: string): ModelPricing {
  return MODEL_PRICING[modelName] || MODEL_PRICING["openai/gpt-3.5-turbo"];
}

// Calculate cost per 1000 tokens for a model
export function getCostPer1kTokens(modelName: string): number {
  const pricing = getModelPricing(modelName);
  return pricing.inputCostPer1k + pricing.outputCostPer1k;
}
