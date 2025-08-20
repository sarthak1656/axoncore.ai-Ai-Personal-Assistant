"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  MessageSquare,
  Zap,
  Shield,
  CreditCard,
  Users,
} from "lucide-react";

const features = [
  {
    id: "ai-conversations",
    icon: <Bot className="h-8 w-8" />,
    title: "AI Conversations",
    description:
      "Engage with intelligent AI assistants that understand context and provide meaningful responses.",
    demo: "Ask me anything about coding, writing, or analysis!",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "multi-assistant",
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Multi-Assistant Support",
    description:
      "Choose from specialized AI assistants for different tasks and domains.",
    demo: "Switch between coding, writing, and analysis assistants seamlessly.",
    color: "from-green-500 to-teal-600",
  },
  {
    id: "real-time",
    icon: <Zap className="h-8 w-8" />,
    title: "Real-time Processing",
    description:
      "Lightning-fast responses powered by advanced AI models and optimized infrastructure.",
    demo: "Get instant responses with our optimized AI infrastructure.",
    color: "from-yellow-500 to-orange-600",
  },
  {
    id: "security",
    icon: <Shield className="h-8 w-8" />,
    title: "Enterprise Security",
    description:
      "Bank-level security with encrypted data, secure authentication, and privacy protection.",
    demo: "Your data is protected with enterprise-grade security.",
    color: "from-red-500 to-pink-600",
  },
  {
    id: "pricing",
    icon: <CreditCard className="h-8 w-8" />,
    title: "Simple Pricing",
    description:
      "Simple pricing with one plan. Start with our Pro plan for unlimited AI assistance.",
    demo: "Simple $10/month plan with 100,000 tokens for unlimited AI assistance.",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: "collaboration",
    icon: <Users className="h-8 w-8" />,
    title: "Team Collaboration",
    description:
      "Share conversations and collaborate with team members seamlessly.",
    demo: "Work together with your team using shared AI assistants.",
    color: "from-emerald-500 to-cyan-600",
  },
];

export default function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFeatureClick = (feature: (typeof features)[0]) => {
    setIsAnimating(true);
    setActiveFeature(feature);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Experience the Power
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Click on any feature to see it in action
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeFeature.id === feature.id
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "hover:scale-105"
                }`}
                onClick={() => handleFeatureClick(feature)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {feature.description}
                      </p>
                    </div>
                    {activeFeature.id === feature.id && (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Interactive Demo */}
          <div className="relative">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${activeFeature.color} flex items-center justify-center text-white`}
                  >
                    {activeFeature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {activeFeature.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500">Live Demo</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`transition-all duration-300 ${
                    isAnimating ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">
                        AI Assistant
                      </span>
                    </div>
                    <p className="text-gray-800">{activeFeature.demo}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">You</span>
                    </div>
                    <p className="text-gray-800">Show me how this works!</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Typing...</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Try Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
