import React, { useState, useContext, useEffect, useRef } from "react";
import EmptyChatState from "./EmptyChatState";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AiModelOptions from "@/services/AiModelOptions";
import { AssistanceContext } from "@/context/AssistantContext";
import { apiClient } from "@/lib/api";
import Image from "next/image";
import { marked } from "marked";
import { AuthContext } from "@/context/AuthContext";
import { calculateTokenUsage } from "@/lib/tokenCalculator";
import { AuthContextType } from "@/types";
import { useUserOperations, useMessageOperations } from "@/lib/useDatabase";

// Configure marked to prevent HTML nesting issues
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Recursively extract human-readable text from unknown structures (arrays, AST, React elements)
function extractText(value: any): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value))
    return value.map(extractText).filter(Boolean).join("\n\n");
  // React element: { type, props: { children } }
  if (value && typeof value === "object") {
    // Common markdown AST
    if (typeof (value as any).value === "string") return (value as any).value;
    if (typeof (value as any).text === "string") return (value as any).text;
    if (typeof (value as any).content === "string")
      return (value as any).content;
    if ((value as any).children) return extractText((value as any).children);
    if ((value as any).props && (value as any).props.children)
      return extractText((value as any).props.children);
  }
  return "";
}

// Helper: normalize arbitrary content to a string for markdown, or JSON pretty text
function normalizeContentForMarkdown(content: any): {
  text: string;
  isJson: boolean;
} {
  if (typeof content === "string") {
    return { text: content, isJson: false };
  }
  if (Array.isArray(content)) {
    // Try to extract readable text from nested structures
    const extracted = extractText(content);
    if (extracted) return { text: extracted, isJson: false };
    try {
      return { text: JSON.stringify(content, null, 2), isJson: true };
    } catch {
      return {
        text: content
          .map((c) => (typeof c === "string" ? c : extractText(c) || String(c)))
          .join("\n\n"),
        isJson: false,
      };
    }
  }
  if (content && typeof content === "object") {
    // Prefer common text-like fields if present
    if (typeof (content as any).text === "string")
      return { text: (content as any).text, isJson: false };
    if (typeof (content as any).content === "string")
      return { text: (content as any).content, isJson: false };
    const extracted = extractText(content);
    if (extracted) return { text: extracted, isJson: false };
    try {
      return { text: JSON.stringify(content, null, 2), isJson: true };
    } catch {
      return { text: String(content), isJson: false };
    }
  }
  return { text: String(content ?? ""), isJson: false };
}

// Custom renderer to prevent HTML nesting issues
const renderer: any = new (marked as any).Renderer();

// Override code block rendering (use token signature)
(renderer as any).code = ({ text, lang }: any) => {
  const language = typeof lang === "string" ? lang : undefined;
  const langClass = language ? `language-${language}` : "";
  return `<pre class="bg-gray-900 p-3 rounded-md text-sm overflow-x-auto my-4"><code class="${langClass}">${text}</code></pre>`;
};

// Override inline code rendering
(renderer as any).codespan = ({ text }: any) => {
  return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${text}</code>`;
};

// Use default renderer behavior for paragraphs, lists, headings, etc.

// Set the custom renderer
marked.use({ renderer: renderer as any });

// Custom markdown renderer to prevent HTML nesting issues
const SafeMarkdown = ({ content }: { content: any }) => {
  const { text, isJson } = normalizeContentForMarkdown(content);

  if (isJson) {
    return (
      <pre className="bg-gray-900 p-3 rounded-md text-sm overflow-x-auto my-4">
        <code className="language-json">{text}</code>
      </pre>
    );
  }

  const htmlContent = marked(text);
  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

function ChatUi() {
  const [input, setInput] = useState("");
  const { assistants } = useContext(AssistanceContext);
  const [messages, setMessages] = useState<any[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<any>(null);
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const setUser = authContext?.setUser;
  const { updateUserTokens } = useUserOperations();
  const { saveMessage, getMessagesByAssistant } = useMessageOperations();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    if (assistants?._id && user?._id) {
      loadMessageHistory();
    }
  }, [assistants]);

  const loadMessageHistory = async () => {
    if (!assistants?._id || !user?._id) return;

    setIsLoadingHistory(true);
    try {
      const history = await getMessagesByAssistant.execute({
        userId: user._id,
        assistantId: assistants._id,
        limit: 50,
      });

      const formattedMessages = history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading message history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results: number[] = [];
    messages.forEach((message, index) => {
      const text = normalizeContentForMarkdown(
        message.content
      ).text.toLowerCase();
      if (text.includes(searchQuery.toLowerCase())) {
        results.push(index);
      }
    });
    setSearchResults(results);
    setCurrentSearchIndex(0);
  }, [searchQuery, messages]);

  const scrollToMessage = (index: number) => {
    const messageElement = document.getElementById(`message-${index}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      messageElement.classList.add("bg-yellow-100");
      setTimeout(() => {
        messageElement.classList.remove("bg-yellow-100");
      }, 2000);
    }
  };

  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToMessage(searchResults[nextIndex]);
  };

  const prevSearchResult = () => {
    if (searchResults.length === 0) return;
    const prevIndex =
      currentSearchIndex === 0
        ? searchResults.length - 1
        : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    scrollToMessage(searchResults[prevIndex]);
  };

  const onSendMessage = async () => {
    if (!input.trim()) return;

    // Check if an assistant is selected
    if (!assistants?._id || !assistants?.aiModelId) {
      const errorMessage = {
        role: "assistant",
        content: "Please select an assistant first to start chatting.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsChatLoading(true);
    setShowTimeoutWarning(false);

    try {
      // Save user message
      if (user?._id && assistants?._id) {
        await saveMessage.execute({
          userId: user._id,
          assistantId: assistants._id,
          role: "user",
          content: input,
        });
      }

      const selectedModel = AiModelOptions.find(
        (model) => model.model === assistants?.aiModelId
      );

      if (!selectedModel) {
        console.error(
          "Selected model not found for aiModelId:",
          assistants?.aiModelId
        );
        console.log(
          "Available models:",
          AiModelOptions.map((m) => m.name)
        );
        throw new Error("Selected model not found");
      }

      const response = await apiClient.post("/openRouter-ai-model", {
        message: input,
        model: selectedModel.model,
        systemPrompt: assistants?.userInstruction || "",
      });

      const assistantMessage = {
        role: "assistant",
        content:
          response.data?.content || "Sorry, I couldn't process your request.",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Get actual tokens used from API response (if available) or fallback to calculation
      const actualTokensUsed =
        response.data?.tokensUsed ||
        calculateTokenUsage(
          input,
          response.data?.content || "",
          selectedModel.model
        ).totalTokens;

      console.log("Tokens used in this request:", actualTokensUsed);

      // Save assistant message
      if (user?._id && assistants?._id) {
        await saveMessage.execute({
          userId: user._id,
          assistantId: assistants._id,
          role: "assistant",
          content: response.data?.content || "",
          tokensUsed: actualTokensUsed,
          modelUsed: selectedModel.model,
        });
      }

      // Update user's token count using actual usage
      if (user?._id && actualTokensUsed > 0) {
        await handleTokenUpdate(actualTokensUsed);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTokenUpdate = async (tokensUsed: number) => {
    if (!user || !user._id || tokensUsed <= 0) return;

    console.log("Updating user tokens:", {
      userId: user._id,
      tokensUsed: tokensUsed,
      currentMonthlyUsage: user.monthlyUsage,
      currentCredits: user.credits,
    });

    try {
      const result = await updateUserTokens.execute(user._id, tokensUsed);

      // Update user state to reflect new token usage
      if (user && setUser) {
        const newMonthlyUsage = (user.monthlyUsage || 0) + tokensUsed;
        const newCredits = Math.max(0, (user.credits || 0) - tokensUsed);

        setUser({
          ...user,
          monthlyUsage: newMonthlyUsage,
          credits: newCredits,
        });

        console.log("User state updated:", {
          oldMonthlyUsage: user.monthlyUsage,
          newMonthlyUsage: newMonthlyUsage,
          oldCredits: user.credits,
          newCredits: newCredits,
        });
      }

      console.log("Token update successful:", result);
    } catch (error) {
      console.error("Error updating user tokens:", error);
      // Don't throw the error to prevent breaking the chat flow
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b bg-white border-gray-200">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search in chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {searchQuery && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{searchResults.length} results</span>
                {searchResults.length > 0 && (
                  <>
                    <span>
                      {currentSearchIndex + 1} of {searchResults.length}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={prevSearchResult}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={nextSearchResult}
                    >
                      ↓
                    </Button>
                  </>
                )}
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSearch(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Search Toggle Button */}
      {!showSearch && messages.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSearch(true)}
            className="bg-white/80 backdrop-blur-sm"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      )}

      {/* Scrollable Chat Area */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 pb-16 pt-2 bg-white"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyChatState />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                id={`message-${index}`}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex gap-3 items-start">
                  {msg.role === "assistant" && assistants?.image && (
                    <Image
                      alt="assistant"
                      width={30}
                      height={30}
                      src={assistants.image}
                      className="w-[30px] h-[30px] rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`p-3 rounded-lg max-w-xs sm:max-w-md lg:max-w-2xl break-words overflow-hidden message-container ${
                      msg.role === "user"
                        ? "bg-gray-200 text-black"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    <SafeMarkdown content={msg.content} />
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-start">
                  {assistants?.image && (
                    <Image
                      alt="assistant"
                      width={30}
                      height={30}
                      src={assistants.image}
                      className="w-[30px] h-[30px] rounded-full object-cover"
                    />
                  )}
                  <div className="p-3 rounded-lg max-w-xs sm:max-w-md lg:max-w-2xl bg-gray-800 text-white overflow-hidden message-container">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-400">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="absolute bottom-16 left-0 w-full px-4 py-2 bg-white border-t border-gray-200 shadow-md">
        {showTimeoutWarning && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              ⏱️ The AI is taking longer than usual. Please wait...
            </p>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <Input
            placeholder={
              !assistants?._id || !assistants?.aiModelId
                ? "Select an assistant to start chatting..."
                : !user?.monthlyCredits ||
                  (user?.monthlyUsage || 0) >= (user?.monthlyCredits || 0)
                ? "Monthly token limit reached"
                : "Ask me anything..."
            }
            value={input}
            disabled={
              !user?.monthlyCredits ||
              (user?.monthlyUsage || 0) >= (user?.monthlyCredits || 0) ||
              !assistants?._id ||
              !assistants?.aiModelId
            }
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={onSendMessage}
            disabled={
              !user?.monthlyCredits ||
              (user?.monthlyUsage || 0) >= (user?.monthlyCredits || 0) ||
              !assistants?._id ||
              !assistants?.aiModelId
            }
          >
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatUi;
