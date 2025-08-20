import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AiAssistantsList from "@/services/AiAssistantsList";
import Image from "next/image";

function AssistantAvatar({ children,selectedImage }: {children: React.ReactNode,selectedImage: (image: string) => void}) {
  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="grid grid-cols-5 gap-2">
          {AiAssistantsList.map((assistant) => (
            <div
              key={assistant.id}
              className="flex flex-col items-center justify-center"
            >
              <Image
                src={assistant.image}
                alt={assistant.name}
                width={100}
                height={100}
                className="w-[50px] h-[50px] object-cover rounded-lg cursor-pointer"
                onClick={()=>selectedImage(assistant.image)}
              />
             
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default AssistantAvatar;
