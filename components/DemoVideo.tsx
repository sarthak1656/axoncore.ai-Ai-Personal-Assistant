"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface DemoVideoProps {
  onClose: () => void;
}

export default function DemoVideo({ onClose }: DemoVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white">
        <CardContent className="p-0">
          <div className="relative">
            {/* Video Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-2xl font-bold mb-2">AI Assistant Demo</h3>
                <p className="text-blue-100">
                  Watch how our AI assistants transform your workflow
                </p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 rounded-lg p-3">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMuteToggle}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Demo Features */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">What You'll See:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Multi-Assistant Selection</h4>
                  <p className="text-sm text-gray-600">
                    Choose from specialized AI assistants
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Real-time Conversations</h4>
                  <p className="text-sm text-gray-600">
                    Instant responses with context awareness
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Secure Authentication</h4>
                  <p className="text-sm text-gray-600">
                    Google OAuth with enterprise security
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Subscription Management</h4>
                  <p className="text-sm text-gray-600">
                    Easy upgrade and cancellation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
