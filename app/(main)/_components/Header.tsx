"use client";
import { useAuth } from "@/context/AuthContext";

import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { secureStorage } from "@/lib/secureStorage";
import { logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();

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

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    user && (
      <div className="shadow-sm p-3 justify-between items-center px-14 flex bg-white border-b border-gray-200">
        <div
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <Image src={"/logo.svg"} alt="logo" width={40} height={40} priority />
          <span className="text-3xl font-bold text-gray-900">axoncore.ai</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-lg font-medium text-gray-700">
            Welcome, {user?.name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold leading-none">
                    {user?.name}
                  </p>
                  <p className="text-sm leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  );
}

export default Header;
