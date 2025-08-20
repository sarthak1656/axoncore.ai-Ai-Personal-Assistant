"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { ASSISTANT } from "@/types/assistant";

interface AssistanceContextType {
  assistants: ASSISTANT | null;
  setAssistants: (assistant: ASSISTANT | null) => void;
}

export const AssistanceContext = createContext<AssistanceContextType>({
  assistants: null,
  setAssistants: () => {},
});

// Custom hook to use the assistant context
export const useAssistant = () => {
  const context = useContext(AssistanceContext);
  if (!context) {
    throw new Error(
      "useAssistant must be used within an AssistanceContext.Provider"
    );
  }
  return context;
};

// Provider component
interface AssistanceProviderProps {
  children: ReactNode;
}

export const AssistanceProvider = ({ children }: AssistanceProviderProps) => {
  const [assistants, setAssistants] = useState<ASSISTANT | null>(null);

  return (
    <AssistanceContext.Provider value={{ assistants, setAssistants }}>
      {children}
    </AssistanceContext.Provider>
  );
};
