import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PlusIcon } from "lucide-react";
import AiAssistantsList from "@/services/AiAssistantsList";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AiModelOptions from "@/services/AiModelOptions";
import { Textarea } from "@/components/ui/textarea";
import AssistantAvatar from "./AssistantAvatar";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { AssistanceContext } from "@/context/AssistantContext";
import { useAssistantOperations } from "@/lib/useDatabase";
import { getModelName, getModelLogo } from "@/lib/utils";

const defaultAssistant = {
  image: "/bug-fixer.avif",
  name: "",
  title: "",
  id: 0,
  sampleQuestion: "",
  userInstruction: "",
  aiModelId: "deepseek/deepseek-coder-33b-instruct",
};

function AddNewAssistant({ children }: { children: React.ReactNode }) {
  const [selectedAssistant, setSelectedAssistant] =
    useState<any>(defaultAssistant);

  const [isLoading, setIsLoading] = useState(false);

  const { assistants, setAssistants } = useContext(AssistanceContext);

  const onHandleInputChange = (key: string, value: string) => {
    setSelectedAssistant((prev: any) => ({ ...prev, [key]: value }));
  };

  const { insertSelectedAssistants } = useAssistantOperations();

  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const onSave = async () => {
    if (
      !selectedAssistant.name ||
      !selectedAssistant.title ||
      !selectedAssistant.userInstruction
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    if (!user?._id) {
      toast.error("Please login to add an assistant");
      return;
    }

    setIsLoading(true);
    try {
      const result = await insertSelectedAssistants.execute(
        [selectedAssistant],
        user._id
      );
      toast.success("Assistant added successfully");
      setAssistants(null);
      console.log(result);
    } catch (error) {
      console.error("Error adding assistant:", error);
      toast.error("Failed to add assistant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new assistant</DialogTitle>
          <DialogDescription asChild>
            <div className="grid grid-cols-3 gap-5 mt-5">
              <div className="mt-5 border-r border-gray-200 pr-5    ">
                <h2 className="text-lg font-semibold">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedAssistant(defaultAssistant)}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add new assistant
                  </Button>
                  <div className="mt-2">
                    {AiAssistantsList.map((assistant) => (
                      <div
                        key={assistant.id}
                        className=" p-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
                        onClick={() => setSelectedAssistant(assistant)}
                      >
                        <Image
                          src={assistant.image}
                          alt={assistant.name}
                          width={60}
                          height={60}
                          className="rounded-lg w-[30px] h-[30px] object-cover"
                        />
                        <h3 className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors duration-200">
                          {assistant.title}
                        </h3>
                      </div>
                    ))}
                  </div>
                </h2>
              </div>
              <div className="col-span-2">
                <div className="flex gap-5">
                  {selectedAssistant && (
                    <AssistantAvatar
                      selectedImage={(image) =>
                        onHandleInputChange("image", image)
                      }
                    >
                      <Image
                        src={selectedAssistant?.image}
                        alt="assistant"
                        width={100}
                        height={100}
                        className="w-[100px] h-[100px] object-cover rounded-lg cursor-pointer"
                      />
                    </AssistantAvatar>
                  )}
                  <div className="flex flex-col gap-3 mt-5 w-full ">
                    <Input
                      type="text"
                      placeholder="Enter assistant name"
                      className="w-full"
                      value={selectedAssistant?.name}
                      onChange={(e) =>
                        onHandleInputChange("name", e.target.value)
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Enter assistant Title"
                      className="w-full"
                      value={selectedAssistant?.title}
                      onChange={(e) =>
                        onHandleInputChange("title", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-gray-700">Model:</h2>
                  <Select
                    defaultValue={
                      selectedAssistant?.aiModelId ||
                      "deepseek/deepseek-coder-33b-instruct"
                    }
                    onValueChange={(value) =>
                      onHandleInputChange("aiModelId", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Model">
                        {selectedAssistant?.aiModelId && (
                          <div className="flex items-center gap-2">
                            <Image
                              src={getModelLogo(selectedAssistant.aiModelId)}
                              alt={getModelName(selectedAssistant.aiModelId)}
                              width={20}
                              height={20}
                              className="mr-2 rounded-full"
                            />
                            <span>
                              {getModelName(selectedAssistant.aiModelId)}
                            </span>
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
                <div className="mt-4">
                  <h2 className="text-gray-700">Instructions:</h2>
                  <Textarea
                    placeholder="Enter instructions"
                    className="w-full h-[180px] mt-2 bg-white"
                    value={selectedAssistant?.userInstruction}
                    onChange={(e) =>
                      onHandleInputChange("userInstruction", e.target.value)
                    }
                  />
                </div>
                <div className="flex gap-3 mt-5 justify-end">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={onSave} disabled={isLoading}>
                    {" "}
                    {isLoading ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}{" "}
                  </Button>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewAssistant;
