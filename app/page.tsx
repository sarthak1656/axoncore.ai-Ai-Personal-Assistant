"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { secureStorage } from "@/lib/secureStorage";
import { logger } from "@/lib/logger";
import { useUserOperations } from "@/lib/useDatabase";
import FeatureShowcase from "@/components/FeatureShowcase";
import PlanDetails from "@/components/PlanDetails";
import {
  Brain,
  MessageSquare,
  Zap,
  Shield,
  CreditCard,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Bot,
  Lock,
  Globe,
  Smartphone,
  Palette,
  BarChart3,
  Home,
  Settings,
  Loader2,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getUser } = useUserOperations();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isGetStartedLoading, setIsGetStartedLoading] = useState(false);
  const [isAboutDeveloperLoading, setIsAboutDeveloperLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkExistingUser = async () => {
      const token = secureStorage.getToken();
      if (token && !user) {
        try {
          // Try to get user data if token exists but user not in context
          const userInfo = await getUser.execute(token);
          if (userInfo) {
            // User is authenticated but not in context - this will be handled by Provider
            logger.info("User authenticated but not in context");
          }
        } catch (error) {
          logger.error("Error checking user authentication", error);
        }
      }
      setIsLoading(false);
    };

    checkExistingUser();
  }, [user, getUser]);

  // Navigation button handlers
  const handleSignIn = async () => {
    setIsSignInLoading(true);
    try {
      await router.push("/sign-in");
    } catch (error) {
      logger.error("Error navigating to sign-in", error);
    } finally {
      setIsSignInLoading(false);
    }
  };

  const handleGetStarted = async () => {
    setIsGetStartedLoading(true);
    try {
      await router.push("/sign-in");
    } catch (error) {
      logger.error("Error navigating to get started", error);
    } finally {
      setIsGetStartedLoading(false);
    }
  };

  const handleAboutDeveloper = async () => {
    setIsAboutDeveloperLoading(true);
    try {
      await router.push("/about-developer");
    } catch (error) {
      logger.error("Error navigating to about developer", error);
    } finally {
      setIsAboutDeveloperLoading(false);
    }
  };

  const handleGoToWorkspace = async () => {
    try {
      await router.push("/workspace");
    } catch (error) {
      logger.error("Error navigating to workspace", error);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Conversations",
      description:
        "Engage with intelligent AI assistants that understand context and provide meaningful responses.",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Multi-Assistant Support",
      description:
        "Choose from specialized AI assistants for different tasks and domains.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Processing",
      description:
        "Lightning-fast responses powered by advanced AI models and optimized infrastructure.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description:
        "Bank-level security with encrypted data, secure authentication, and privacy protection.",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Simple Pricing",
      description:
        "Simple pricing with one plan. Start with our Pro plan for unlimited AI assistance.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description:
        "Share conversations and collaborate with team members seamlessly.",
    },
  ];

  const pricingPlans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "per month",
      features: [
        "5,000 tokens per month",
        "Access to basic AI models",
        "Standard support",
        "Basic features",
      ],
      popular: false,
    },
    {
      name: "Pro Plan",
      price: "$10",
      period: "per month",
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
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      content:
        "This AI assistant has transformed how I work. The multi-assistant feature is game-changing!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Developer",
      content:
        "The real-time processing and security features give me confidence in using it for sensitive work.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      content:
        "I love how easy it is to switch between different AI assistants for different tasks.",
      rating: 5,
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "1M+", label: "Conversations" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <span className="text-3xl font-bold text-gray-900">axoncore.ai</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-600">Welcome, {user.name}</span>
                              <Button
                  variant="outline"
                  onClick={handleAboutDeveloper}
                  className="flex items-center gap-2"
                  disabled={isAboutDeveloperLoading}
                >
                  <Home className="h-4 w-4" />
                  About Developer
                  {isAboutDeveloperLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
                <Button
                  onClick={handleGoToWorkspace}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Go to Workspace
                </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleSignIn} disabled={isSignInLoading}>
                Sign In
                {isSignInLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
              <Button onClick={handleGetStarted} disabled={isGetStartedLoading}>
                Get Started
                {isGetStartedLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Authenticated User Welcome Section */}
      {user && (
        <section className="bg-blue-50 border-b border-blue-200 py-8 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Ready to continue your AI journey? Your workspace is waiting for
              you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              <Button
                  size="lg"
                  onClick={handleGoToWorkspace}
                  className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Go to Workspace
                </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4"
                onClick={handleAboutDeveloper}
                disabled={isAboutDeveloperLoading}
              >
                <Home className="mr-2 h-5 w-5" />
                About Developer
                {isAboutDeveloperLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Only for unauthenticated users */}
      {!user && (
        <section className="text-center py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The Future of
              <span className="text-blue-600"> AI</span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-600">
                Starts Here
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience axoncore.ai - your intelligent platform for AI-powered
              conversations, multiple specialized assistants, and seamless
              productivity. Secure, fast, and cutting-edge technology all in one
              place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleSignIn}
                className="text-lg px-8 py-4"
                disabled={isSignInLoading}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
                {isSignInLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4"
                onClick={handleAboutDeveloper}
                disabled={isAboutDeveloperLoading}
              >
                About Developer
                {isAboutDeveloperLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section - Only for unauthenticated users */}
      {!user && (
        <section className="py-16 px-6 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interactive Features Showcase - Only for unauthenticated users */}
      {!user && <FeatureShowcase />}

      {/* Marketing Sections - Only for unauthenticated users */}
      {!user && (
        <>
          {/* Features Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Why Choose AI Assistant Pro?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Built with cutting-edge technology and designed for modern
                  workflows
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20 px-6 bg-white/50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Simple Pricing
                </h2>
                <p className="text-xl text-gray-600">
                  Choose the plan that fits your needs. Start free and upgrade
                  when you're ready.
                </p>
              </div>
              <PlanDetails />
              <div className="text-center mt-8">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                  onClick={handleSignIn}
                  disabled={isSignInLoading}
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                  {isSignInLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                </Button>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Loved by Users Worldwide
                </h2>
                <p className="text-xl text-gray-600">
                  See what our users have to say about their experience
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">
                          {testimonial.role}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of users who are already experiencing the power
                of AI assistants
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4"
                onClick={handleSignIn}
                disabled={isSignInLoading}
              >
                Start Your Free Trial Today
                <ArrowRight className="ml-2 h-5 w-5" />
                {isSignInLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              </Button>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                <span className="text-xl font-bold">axoncore.ai</span>
              </div>
              <p className="text-gray-400">
                The future of AI-powered conversations is here.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 axoncore.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
