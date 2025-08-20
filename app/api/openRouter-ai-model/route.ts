import { NextRequest } from "next/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import {
  authenticateRequest,
  checkRateLimit,
  createSecureResponse,
  createErrorResponse,
} from "@/lib/auth";
import { userOperations } from "@/lib/database.server";

// Fallback function to try a different model
async function tryFallbackModel(env: any, userInput: string, user: any) {
  const fallbackPayload = {
    model: "openai/gpt-3.5-turbo", // More reliable fallback
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Respond naturally to the user's questions and requests.",
      },
      {
        role: "user",
        content: userInput,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  };

  try {
    logger.info("Making fallback API request with GPT-3.5-turbo");
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Personal AI Agent",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fallbackPayload),
      }
    );

    if (!response.ok) {
      throw new Error(`Fallback API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    if (!content || content.trim() === "") {
      logger.warn("Fallback model also returned empty content");
      return createSecureResponse({
        content:
          "I apologize, but I couldn't generate a response. Please try again.",
      });
    }

    // Update user's token usage for fallback model
    if (tokensUsed > 0 && user._id) {
      try {
        logger.info("Updating user token usage (fallback)", {
          userId: user._id,
          tokensUsed: tokensUsed,
        });

        await userOperations.updateUserTokens(user._id, tokensUsed);

        logger.info("User tokens updated successfully (fallback)", {
          userId: user._id,
          tokensUsed: tokensUsed,
        });
      } catch (error) {
        logger.error("Failed to update user tokens (fallback)", {
          userId: user._id,
          tokensUsed: tokensUsed,
          error: error,
        });
      }
    }

    logger.info("Fallback model successful", {
      contentLength: content.length,
      tokensUsed,
    });
    return createSecureResponse({
      content: content,
      tokensUsed: tokensUsed,
    });
  } catch (error) {
    logger.error("Fallback model failed", error);
    return createSecureResponse({
      content:
        "I apologize, but I couldn't generate a response. Please try again.",
    });
  }
}

export async function GET() {
  return createSecureResponse({ message: "OpenRouter API route is working" });
}

export async function POST(request: NextRequest) {
  try {
    logger.info("OpenRouter API request started");
    logger.info("Request URL:", request.url);
    logger.info("Request method:", request.method);

    // Rate limiting - stricter for AI requests
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(clientIP, 20, 60000)) {
      // 20 requests per minute for AI
      return createErrorResponse(
        "Rate limit exceeded. Please try again later.",
        429
      );
    }

    // Authentication
    logger.info("Authenticating request...");
    const user = await authenticateRequest(request);
    if (!user) {
      return createErrorResponse("Unauthorized. Please sign in.", 401);
    }
    logger.info("Authentication successful", {
      userId: user._id,
      email: user.email,
    });

    // Validate environment variables
    logger.info("Validating environment variables...");
    try {
      // Check if OpenRouter API key is available
      if (!env.OPENROUTER_API_KEY) {
        logger.error("OpenRouter API key is missing");
        throw new Error("OpenRouter API key is not configured");
      }
      logger.info("Environment validation successful");
    } catch (error) {
      logger.error("Environment validation failed", error);
      return createErrorResponse(
        "Server configuration error. Please contact support.",
        500
      );
    }

    // Log for debugging (remove in production)
    logger.info("Environment check", {
      hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
      keyLength: env.OPENROUTER_API_KEY?.length,
      keyPrefix: env.OPENROUTER_API_KEY?.substring(0, 10) + "...",
    });

    const { message, model, systemPrompt } = await request.json();
    logger.info("Request body parsed", {
      model,
      messageLength: message?.length,
      hasSystemPrompt: !!systemPrompt,
    });

    // Validate required fields
    if (!message || !message.trim()) {
      return createErrorResponse("User input is required");
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    // Log the request payload for debugging
    const requestPayload = {
      model: model || "openai/gpt-3.5-turbo", // Use the provided model or fallback
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are a helpful AI assistant. Respond naturally to the user's questions and requests.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    };

    logger.info("OpenRouter request payload", requestPayload);

    try {
      logger.info("Making OpenRouter API request...");
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:3000", // Your site URL
            "X-Title": "Personal AI Agent", // Your site name
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        }
      );
      logger.info("OpenRouter API response received", {
        status: response.status,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("OpenRouter API error", {
          status: response.status,
          error: errorText,
        });
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();

      // Log the response for debugging
      logger.info("OpenRouter API response", {
        choices: data.choices,
        usage: data.usage,
      });

      const content = data.choices[0]?.message?.content;
      const tokensUsed = data.usage?.total_tokens || 0;

      logger.info("Extracted content", {
        content: content,
        contentLength: content?.length,
        isEmpty: !content || content.trim() === "",
        tokensUsed: tokensUsed,
      });

      // Check if content is empty or null
      if (!content || content.trim() === "") {
        logger.warn("OpenRouter returned empty content", {
          data,
          model: model,
          finishReason: data.choices[0]?.finish_reason,
        });

        // Try with a different model as fallback
        if (model !== "openai/gpt-3.5-turbo") {
          logger.info("Attempting fallback to GPT-3.5-turbo");
          return await tryFallbackModel(env, message, user);
        }

        return createSecureResponse({
          content:
            "I apologize, but I couldn't generate a response. Please try again.",
        });
      }

      // Update user's token usage
      if (tokensUsed > 0 && user._id) {
        try {
          logger.info("Updating user token usage", {
            userId: user._id,
            tokensUsed: tokensUsed,
          });

          await userOperations.updateUserTokens(user._id, tokensUsed);

          logger.info("User tokens updated successfully", {
            userId: user._id,
            tokensUsed: tokensUsed,
          });
        } catch (error) {
          logger.error("Failed to update user tokens", {
            userId: user._id,
            tokensUsed: tokensUsed,
            error: error,
          });
          // Don't fail the request if token update fails
        }
      }

      return createSecureResponse({
        content: content,
        tokensUsed: tokensUsed, // Include token usage in response
      });
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        logger.error("OpenRouter API timeout");
        return createErrorResponse(
          "AI model is taking too long to respond. Please try again.",
          408
        );
      }

      throw error;
    }
  } catch (error) {
    logger.error("OpenRouter API error", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });
    return createErrorResponse("Failed to get AI response", 500);
  }
}
