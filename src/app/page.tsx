import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, BarChart, CheckCircle, Shield, Bell, CopyCheck } from 'lucide-react';
import Link from 'next/link';
import { WavyTimeline } from '@/components/wavy-timeline';
import HeroAnimation from '@/components/hero-animation';


export default function HomePage() {
  const features = [
    {
      icon: <Bot className="h-10 w-10 text-primary" />,
      title: 'AI-Powered Reporting',
      description:
        'Automatically categorize and assess the severity of civic issues using advanced AI analysis of user-uploaded photos.',
    },
    {
      icon: <CopyCheck className="h-10 w-10 text-primary" />,
      title: 'Duplicate Detection',
      description:
        'Intelligent duplicate detection prevents multiple reports for the same issue, streamlining the process for authorities.',
    },
    {
      icon: <BarChart className="h-10 w-10 text-primary" />,
      title: 'Insightful Analytics',
      description:
        'Gain valuable insights into issue patterns with AI-powered summaries to help predict and prevent future problems.',
    },
  ];

  const stats = [
    {
      icon: <ArrowRight className="h-8 w-8 text-white" />,
      value: '90%',
      label: 'Faster Routing',
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      value: '92%',
      label: 'AI Accuracy',
    },
    {
      icon: <Bell className="h-8 w-8 text-white" />,
      value: '100%',
      label: 'Transparency',
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">CivicAI</span>
          </Link>
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <HeroAnimation />
            <h1 className="text-5xl font-bold font-headline tracking-tighter sm:text-6xl md:text-7xl">
              AI CivicLens
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
              The definitive AI-powered compliance and citizen engagement
              platform. Transform governance from reactive to proactive.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <WavyTimeline />

        {/* Stats Section */}
        <section className="bg-primary text-primary-foreground py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400">
                <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label}>
                    {stat.icon}
                    <div className="mt-4 text-4xl font-bold">{stat.value}</div>
                    <p className="mt-1 text-lg opacity-80">{stat.label}</p>
                    </div>
                ))}
                </div>
            </div>
        </section>


        {/* CTA Section */}
        <section className="py-20 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-headline">
              Ready to transform civic engagement?
            </h2>
            <Button size="lg" className="mt-6" asChild>
              <Link href="/login">Start Reporting Issues</Link>
            </Button>
          </div>
        </section>
      </main>

       <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
             <Logo className="h-6 w-6 text-primary" />
             <span className="font-semibold font-headline">CivicAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CivicAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
