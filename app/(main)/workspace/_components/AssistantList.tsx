"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Plus } from "lucide-react";
import Image from "next/image";
import { useAssistantOperations } from "@/lib/useDatabase";
import { ASSISTANT } from "@/types/assistant";
import { useAuth } from "@/context/AuthContext";
import { useAssistant } from "@/context/AssistantContext";
import AddNewAssistant from "./AddNewAssistant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NoSSR from "@/components/NoSSR";
import Profile from "./Profile";
import { secureStorage } from "@/lib/secureStorage";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";

const AssistantList = () => {
  const { user, setUser } = useAuth();
  const { assistants, setAssistants } = useAssistant();
  const { getAllUserAssistants } = useAssistantOperations();
  const router = useRouter();

  const [assistantList, setAssistantList] = useState<ASSISTANT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    try {
      // Clear user data from secure storage
      secureStorage.clearUser();

      // Clear user from context
      setUser(null);

      logger.info("User logged out successfully");

      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      logger.error("Error during logout", error);
    }
  };

  // Filter assistants based on search query
  const filteredAssistants = assistantList.filter(
    (assistant) =>
      assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assistant.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Professional automatic loading
  useEffect(() => {
    const loadAssistants = async () => {
      // Skip if already loaded or no user
      if (hasLoaded || !user?._id || isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Auto-loading assistants for user:", user._id);
        const result = await getAllUserAssistants.execute(user._id);

        console.log("✅ Assistants loaded:", result?.length || 0);
        setAssistantList(result || []);
        setHasLoaded(true);

        // Auto-select first assistant if available and none selected
        if (result && result.length > 0 && !assistants) {
          console.log("✅ Auto-selecting first assistant:", result[0].name);
          setAssistants(result[0]);
        }
      } catch (err) {
        console.error("❌ Failed to load assistants:", err);
        setError("Failed to load assistants");
        setAssistantList([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure user data is fully available
    const timer = setTimeout(loadAssistants, 50);
    return () => clearTimeout(timer);
  }, [
    user?._id,
    hasLoaded,
    isLoading,
    getAllUserAssistants,
    assistants,
    setAssistants,
  ]);

  // Manual refresh function
  const refreshAssistants = async () => {
    if (!user?._id || isLoading) return;

    setIsLoading(true);
    setError(null);
    setHasLoaded(false);

    try {
      console.log("🔄 Manually refreshing assistants...");
      const result = await getAllUserAssistants.execute(user._id);
      setAssistantList(result || []);
      setHasLoaded(true);

      if (result && result.length > 0 && !assistants) {
        setAssistants(result[0]);
      }
    } catch (err) {
      console.error("❌ Failed to refresh assistants:", err);
      setError("Failed to refresh assistants");
    } finally {
      setIsLoading(false);
    }
  };

  const selectAssistant = (assistant: ASSISTANT) => {
    console.log("Selecting assistant:", assistant.name);
    setAssistants(assistant);
  };

  // Show loading until hydration is complete
  if (!isHydrated) {
    return (
      <div className="p-4 bg-white border-r-[1px] h-screen flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <NoSSR>
      <div className="p-4 bg-white border-r-[1px] h-screen flex flex-col">
        <div className="h-[calc(100vh-150px)] overflow-y-auto">
          <h2 className="font-semibold text-lg">Your personal AI assistants</h2>

          <AddNewAssistant>
            <Button className="mt-4 w-full">+ Add new assistant</Button>
          </AddNewAssistant>

          <Input
            className="mt-4 bg-white"
            placeholder="Search assistants"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Search Results Count */}
          {searchQuery && (
            <div className="mt-2 text-xs text-gray-500">
              {filteredAssistants.length} of {assistantList.length} assistants
            </div>
          )}

          {/* Status and Refresh */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {isLoading
                ? "Loading..."
                : error
                ? "Error loading"
                : `${assistantList.length} assistant${
                    assistantList.length !== 1 ? "s" : ""
                  }`}
            </div>
            {hasLoaded && (
              <Button
                onClick={refreshAssistants}
                size="sm"
                variant="ghost"
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? "⏳" : "🔄"}
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !hasLoaded && (
            <div className="mt-4 flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">
                  Loading assistants...
                </span>
              </div>
            </div>
          )}

          {/* Assistants List */}
          <div className="mt-5 mb-4">
            {!isLoading && filteredAssistants.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  {searchQuery ? "No assistants found" : "No assistants yet"}
                </p>
                {!searchQuery && (
                  <AddNewAssistant>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Assistant
                    </Button>
                  </AddNewAssistant>
                )}
              </div>
            ) : (
              filteredAssistants.map((assistant, index) => (
                <div
                  key={index}
                  className={`p-2 flex items-center gap-4 hover:bg-gray-200 rounded-md cursor-pointer transition-colors ${
                    assistants?.id === assistant?.id
                      ? "bg-gray-200 border-l-4 border-blue-500"
                      : ""
                  }`}
                  onClick={() => selectAssistant(assistant)}
                >
                  <Image
                    src={assistant.image}
                    alt={assistant.name}
                    width={50}
                    height={50}
                    className="rounded-full w-[60px] h-[60px]"
                  />
                  <div className="flex flex-col">
                    <h3 className="font-semibold">{assistant.name}</h3>
                    <p className="text-sm text-gray-600">{assistant.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer profile section */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex gap-3 items-center w-[90%] p-2 rounded-xl hover:bg-gray-200 cursor-pointer">
                {/* Profile Picture */}
                {user?.picture &&
                user.picture !== "" &&
                user.picture !== null ? (
                  <Image
                    src={user.picture}
                    alt="user"
                    width={35}
                    height={35}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-[35px] h-[35px] bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}

                {/* User Info */}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{user?.name}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setOpenProfile(true)}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (window.location.href = "/about-developer")}
            >
              About Developer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dialog */}
        <Profile openDialog={openProfile} setOpenDialog={setOpenProfile} />
      </div>
    </NoSSR>
  );
};

export default AssistantList;
