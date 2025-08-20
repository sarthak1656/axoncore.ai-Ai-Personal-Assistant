"use client";
import React from "react";
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
import Image from "next/image";
import {
  ArrowLeft,
  Github,
  Linkedin,
  Mail,
  Globe,
  Code,
  Database,
  Palette,
  Zap,
  Shield,
  Smartphone,
  Server,
  Brain,
  Award,
  Calendar,
  MapPin,
} from "lucide-react";

export default function AboutDeveloperPage() {
  const router = useRouter();

  const skills = [
    { name: "React", icon: <Code className="h-5 w-5" />, category: "Frontend" },
    {
      name: "Next.js",
      icon: <Zap className="h-5 w-5" />,
      category: "Frontend",
    },
    {
      name: "TypeScript",
      icon: <Code className="h-5 w-5" />,
      category: "Frontend",
    },
    {
      name: "JavaScript",
      icon: <Code className="h-5 w-5" />,
      category: "Frontend",
    },
    {
      name: "Node.js",
      icon: <Server className="h-5 w-5" />,
      category: "Backend",
    },
    {
      name: "MongoDB",
      icon: <Database className="h-5 w-5" />,
      category: "Backend",
    },
    {
      name: "Express.js",
      icon: <Server className="h-5 w-5" />,
      category: "Backend",
    },
    {
      name: "WebRTC",
      icon: <Smartphone className="h-5 w-5" />,
      category: "Real-time",
    },
    {
      name: "Socket.io",
      icon: <Zap className="h-5 w-5" />,
      category: "Real-time",
    },
    {
      name: "OpenRouter",
      icon: <Brain className="h-5 w-5" />,
      category: "AI Integration",
    },
  ];

  const projects = [
    {
      title: "axoncore.ai",
      description:
        "AI-powered conversation platform with multiple specialized assistants",
      tech: ["Next.js", "MongoDB", "Razorpay", "OpenRouter"],
      status: "Active",
    },
    {
      title: "Confreto - Video Conferencing",
      description: "Modern video conferencing app with real-time communication",
      tech: ["TypeScript", "WebRTC", "React", "Node.js"],
      status: "Completed",
    },
    {
      title: "Chatty - Real-time Chat",
      description:
        "Full-stack real-time chat application with instant messaging",
      tech: ["JavaScript", "Socket.io", "MongoDB", "Express"],
      status: "Completed",
    },
    {
      title: "EverWrite - Notes App",
      description: "Full-stack notes application with rich text editing",
      tech: ["JavaScript", "React", "Node.js", "MongoDB"],
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-900">axoncore.ai</span>
        </div>
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src="/bug-fixer.avif"
                alt="Developer"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hi, I'm <span className="text-blue-600">Sarthak Panigrahi</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Full Stack Developer & AI Enthusiast
            </p>
            <div className="flex justify-center space-x-4 mb-8">
              <Badge variant="secondary" className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                India
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                3+ Years Experience
              </Badge>
              <Badge variant="secondary" className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                AI Specialist
              </Badge>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                window.open("https://github.com/sarthak1656", "_blank")
              }
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/sarthak-panigrahi-aa239925b/",
                  "_blank"
                )
              }
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                window.open("mailto:sarthaknsipun@gmail.com", "_blank")
              }
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() =>
                window.open(
                  "https://sarthak-portfolio-beta.vercel.app/",
                  "_blank"
                )
              }
            >
              <Globe className="h-4 w-4 mr-2" />
              Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About Me
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  I'm a passionate Full Stack Developer from Odisha, India,
                  specializing in building full-stack web applications using
                  MERN Stack & Next.js. I love creating innovative solutions
                  that solve real-world problems.
                </p>
                <p>
                  Currently pursuing MCA and actively working on multiple
                  real-world SaaS and EdTech projects. I specialize in AI-driven
                  solutions and real-time WebRTC applications, with expertise in
                  building scalable, high-performance platforms.
                </p>
                <p>
                  When I'm not coding, you can find me exploring new
                  technologies, contributing to open-source projects, or sharing
                  knowledge with the developer community. I'm passionate about
                  writing clean, scalable code and solving complex technical
                  challenges.
                </p>
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Education:</span>
                    <span className="font-semibold">MCA (Pursuing)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-semibold">37+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technologies:</span>
                    <span className="font-semibold">15+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold">Odisha, India</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Skills & Technologies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {skills.map((skill, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-2">{skill.icon}</div>
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  <Badge variant="outline" className="mt-2">
                    {skill.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge
                      variant={
                        project.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="outline"
                        className="text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Let's Work Together
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Interested in collaborating on a project or have a question? I'd
            love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-4"
              onClick={() => router.push("/sign-in")}
            >
              Try axoncore.ai
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
            >
              Contact Me
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p>&copy; 2024 axoncore.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}
