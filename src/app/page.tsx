'use client';

import { AppLogo } from '@/components/app-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useSpring, animated } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroBackground } from '@/components/hero-background';
import { FloatingElement } from '@/components/floating-element';
import { TechStack } from '@/components/tech-stack';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeatureShowcase } from '@/components/feature-showcase';
import { FloatingContactButton } from '@/components/floating-contact-button';

const TeamMember = ({ name, role, image, description, skills }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const animation = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.div ref={ref} style={animation}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <h3 className="text-2xl font-bold text-center mb-2">{name}</h3>
          <p className="text-primary font-medium text-center mb-4">{role}</p>
          <p className="text-muted-foreground text-center">{description}</p>
        </CardContent>
      </Card>
    </animated.div>
  );
};

export default function HomePage() {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
  });

  const [feedbackRef, feedbackInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const teamMembers = [
    {
      name: "Dadapeer K",
      role: "Full Stack Developer",
      image: "/team/dadapeer.jpg",
      description: "Lead developer and architect of Vyapaar Sahayak, specializing in AI integration and system design.",
      skills: ["React", "Node.js", "AI/ML", "System Architecture", "TypeScript"],
      github: "https://github.com/dadapeer",
      linkedin: "https://linkedin.com/in/dadapeer"
    },
    {
      name: "Apeksha C Rao",
      role: "UI/UX Designer",
      image: "/team/apeksha.jpg",
      description: "Creative lead responsible for the intuitive user experience and modern design aesthetics.",
      skills: ["UI Design", "User Research", "Figma", "Prototyping", "Motion Design"],
      github: "https://github.com/apeksha",
      linkedin: "https://linkedin.com/in/apeksha"
    },
    {
      name: "Amrutha BR",
      role: "Backend Developer",
      image: "/team/amrutha.jpg",
      description: "Core backend developer focusing on data security and business logic implementation.",
      skills: ["Node.js", "Database Design", "API Development", "Security", "Cloud Services"],
      github: "https://github.com/amrutha",
      linkedin: "https://linkedin.com/in/amrutha"
    }
  ];

  const features = [
    "AI-Powered Business Analytics",
    "Smart Inventory Management",
    "Automated Invoice Generation",
    "Real-time Financial Tracking",
    "UPI Payment Integration",
    "Multi-language Support"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <AppLogo />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="hidden md:flex gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section with Background */}
        <HeroBackground />
        <FloatingContactButton />
        <section className="w-full py-20 md:py-32 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 z-0" />
          <animated.div style={fadeIn} className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Welcome to Vyapaar Sahayak
              </h1>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl lg:text-2xl">
                Your intelligent business companion for the modern retail world
              </p>
              <div className="flex gap-4 mt-8">
                <Button size="lg" asChild>
                  <Link href="/signup">Start Your Journey</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </animated.div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 bg-muted/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <animated.div key={index} style={useSpring({
                  from: { opacity: 0, transform: 'scale(0.8)' },
                  to: { opacity: 1, transform: 'scale(1)' },
                  delay: index * 100,
                })}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="mb-2">{index + 1}</Badge>
                      <h3 className="text-xl font-semibold mb-2">{feature}</h3>
                    </CardContent>
                  </Card>
                </animated.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <TeamMember key={index} {...member} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <animated.section 
          ref={feedbackRef}
          style={useSpring({
            opacity: feedbackInView ? 1 : 0,
            transform: feedbackInView ? 'translateY(0)' : 'translateY(50px)',
          })}
          className="w-full py-16 bg-muted/50"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <p className="italic mb-4">"Vyapaar Sahayak has transformed how I manage my store. The AI features are incredible!"</p>
                  <p className="font-semibold">- Rajesh Kumar</p>
                  <p className="text-sm text-muted-foreground">Local Store Owner</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="italic mb-4">"The UPI integration and automated invoicing save me hours every day. Highly recommended!"</p>
                  <p className="font-semibold">- Priya Sharma</p>
                  <p className="text-sm text-muted-foreground">Retail Business Owner</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="italic mb-4">"Finally, a business tool that understands Indian retail needs. Simply amazing!"</p>
                  <p className="font-semibold">- Mohammed Ali</p>
                  <p className="text-sm text-muted-foreground">Shop Manager</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </animated.section>
      </main>

      <footer className="w-full border-t py-6 bg-background">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Vyapaar Sahayak. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
