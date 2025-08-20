"use client";
import React, { useState } from "react";
import { useAssistant } from "@/context/AssistantContext";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AiModelOptions from "@/services/AiModelOptions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Save, Trash } from "lucide-react";
import { toast } from "sonner";
import ConfirmationAlert from "../ConfirmationAlert";
import { useAssistantOperations } from "@/lib/useDatabase";
import { getModelName, getModelLogo } from "@/lib/utils";

function AssistantSettings() {
  const { assistants, setAssistants } = useAssistant();

  const onHandleInputChange = (value: string, field: string) => {
    if (assistants) {
      setAssistants({
        ...assistants,
        [field]: value,
      });
    }
  };

  const { updateUserAssistant, deleteUserAssistant } = useAssistantOperations();
  const [Loading, setLoading] = useState(false);
  const onSave = async () => {
    if (!assistants) return;

    console.log("Saving assistant with data:", {
      _id: assistants._id,
      userInstruction: assistants.userInstruction,
      aiModelId: assistants.aiModelId,
    });

    setLoading(true);
    try {
      const result = await updateUserAssistant.execute(
        assistants._id,
        assistants.userInstruction,
        assistants.aiModelId || ""
      );

      // Show success message
      console.log("Assistant updated successfully");
      console.log("Showing toast...");
      toast.success("Assistant updated successfully");
    } catch (error) {
      console.error("Error updating assistant:", error);
      toast.error("Failed to update assistant");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    console.log("Deleting assistant");
    setLoading(true);
    try {
      await deleteUserAssistant.execute(assistants?._id);
      toast.success("Assistant deleted successfully");
    } catch (error) {
      console.error("Error deleting assistant:", error);
      toast.error("Failed to delete assistant");
    } finally {
      setAssistants(null);
      setLoading(false);
    }
  };
  return (
    assistants && (
      <div className="p-5 bg-white border-l-[1px] h-full relative">
        <h2 className="text-xl font-bold">Assistant Settings</h2>
        <div className="mt-4 flex items-center gap-4">
          <Image
            src={assistants?.image}
            alt={assistants?.name}
            width={100}
            height={100}
            className="rounded-full h-[80px] w-[80px] object-cover"
          />
          <div className="flex flex-col ">
            <h2 className="text-lg font-bold">{assistants?.name}</h2>
            <p className="text-sm text-gray-700">{assistants?.title}</p>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-gray-700">Model:</h2>
          <Select
            value={assistants?.aiModelId}
            onValueChange={(value) => onHandleInputChange(value, "aiModelId")}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select Model">
                {assistants?.aiModelId && (
                  <div className="flex items-center gap-2">
                    <Image
                      src={getModelLogo(assistants.aiModelId)}
                      alt={getModelName(assistants.aiModelId)}
                      width={20}
                      height={20}
                      className="mr-2 rounded-full"
                    />
                    <span>{getModelName(assistants.aiModelId)}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {AiModelOptions.map((model) => (
                <SelectItem key={model.id} value={model.model}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={model.logo}
                      alt={model.name}
                      width={20}
                      height={20}
                      className="mr-2 rounded-full"
                    />
                    <h2 className=""> {model.name}</h2>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <h2 className="text-gray-700">Instructions:</h2>
          <Textarea
            placeholder="Enter instructions"
            value={assistants?.userInstruction}
            className="h-[180px] mt-2 bg-white"
            onChange={(e) =>
              onHandleInputChange(e.target.value, "userInstruction")
            }
          />
        </div>

        <div className="absolute bottom-20 flex right-5 gap-4">
          <ConfirmationAlert onDelete={onDelete} disabled={Loading} />
          <Button
            className="flex items-center gap-2"
            onClick={onSave}
            disabled={Loading}
          >
            {Loading ? <Loader2Icon className="animate-spin" /> : <Save />}
            Save
          </Button>
        </div>
      </div>
    )
  );
}

export default AssistantSettings;
