import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Zap,
  Crown,
  Users,
  Shield,
  BarChart3,
  DollarSign,
} from "lucide-react";

interface PlanDetailsProps {
  showFreePlan?: boolean;
  className?: string;
}

export default function PlanDetails({
  showFreePlan = true,
  className = "",
}: PlanDetailsProps) {
  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "per month",
      tokens: "5,000",
      features: [
        "Access to basic AI models",
        "Standard support",
        "Basic features",
        "5,000 tokens per month",
      ],
      popular: false,
      icon: <Shield className="h-6 w-6" />,
    },
    {
      name: "Pro Plan",
      price: "$10",
      period: "per month",
      tokens: "100,000",
      features: [
        "100,000 tokens per month",
        "Access to premium AI models",
        "Priority support",
        "Advanced features",
        "Custom assistants",
        "API access",
        "Usage analytics",
      ],
      popular: true,
      icon: <Crown className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative ${
              plan.popular ? "ring-2 ring-blue-500 shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <div className="flex items-center gap-2">
                {plan.icon}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              <CardDescription className="text-lg font-medium text-blue-600">
                {plan.tokens} tokens per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model Cost Comparison */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Model Cost Comparison</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Choose the most cost-effective model for your needs. DeepSeek models
          offer the lowest cost per token.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/deepseek.png"
                alt="DeepSeek"
                className="w-5 h-5 rounded"
              />
              <span className="font-medium text-sm">DeepSeek Models</span>
            </div>
            <div className="text-xs text-gray-600">
              <div>Input: $0.00007/1k tokens</div>
              <div>Output: $0.00014/1k tokens</div>
              <div className="text-green-600 font-medium mt-1">Lowest Cost</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <img src="/google.png" alt="Google" className="w-5 h-5 rounded" />
              <span className="font-medium text-sm">Gemini 2.0 Flash</span>
            </div>
            <div className="text-xs text-gray-600">
              <div>Input: $0.000075/1k tokens</div>
              <div>Output: $0.0003/1k tokens</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/chatgpt.png"
                alt="OpenAI"
                className="w-5 h-5 rounded"
              />
              <span className="font-medium text-sm">GPT-4o-mini</span>
            </div>
            <div className="text-xs text-gray-600">
              <div>Input: $0.00015/1k tokens</div>
              <div>Output: $0.0006/1k tokens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
