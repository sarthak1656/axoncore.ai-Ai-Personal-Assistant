"use client";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { useAssistant } from "@/context/AssistantContext";
import { ChevronRight, Bot, Plus } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import AddNewAssistant from "./AddNewAssistant";

function EmptyChatState() {
  const { assistants } = useAssistant();

  // If no assistant is selected, show the welcome message
  if (!assistants) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-blue-600" />
          </div>
          <SparklesText className="text-3xl text-center font-bold mb-4">
            Welcome to your AI Workspace!
          </SparklesText>
          <p className="text-gray-600 mb-8">
            Create your first AI assistant to get started. Choose from our
            pre-built templates or create a custom one.
          </p>
          <AddNewAssistant>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Assistant
            </Button>
          </AddNewAssistant>
        </div>
      </div>
    );
  }

  // If assistant is selected, show the chat suggestions
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <SparklesText className="text-4xl text-center font-bold">
        How can I assist you today?
      </SparklesText>
      <div className="mt-7">
        {assistants?.sampleQuestions?.map(
          (suggestion: string, index: number) => (
            <div className="" key={index}>
              <h2 className="text-xl p-4 mt-1 border rounded-xl hover:bg-gray-100 cursor-pointer flex items-center justify-between gap-10 ">
                {suggestion} <ChevronRight className="w-4 h-4" />
              </h2>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default EmptyChatState;
