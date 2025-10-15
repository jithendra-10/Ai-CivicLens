'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Bot, LoaderCircle, Send, User as UserIcon } from 'lucide-react';
import type { Report } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { summarizeCivicIssues } from '@/ai/flows/summarize-civic-issue-reports';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ConversationalAnalytics({ reports }: { reports: Report[] }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, startTransition] = useTransition();
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        const currentQuery = input;
        setInput('');

        startTransition(async () => {
            try {
                const relevantReports = reports.map(r => ({
                    issueType: r.issueType,
                    severity: r.severity,
                    aiDescription: r.aiDescription,
                    location: r.location,
                    status: r.status,
                    createdAt: r.createdAt,
                }));
                
                const result = await summarizeCivicIssues({ reports: relevantReports, query: currentQuery });
                setMessages(prev => [...prev, { role: 'assistant', content: result.summary }]);
            } catch (error) {
                console.error("AI analytics failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'AI Error',
                    description: 'The AI assistant could not process your request.'
                });
                // Remove the user's message if the AI fails
                setMessages(prev => prev.slice(0, prev.length -1));
            }
        });
    };
    
    const suggestionPrompts = [
        "Are there any new high-severity reports?",
        "What's the most common issue type?",
        "List unresolved graffiti reports."
    ]

    return (
        <Card className="h-full flex flex-col rounded-lg shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Bot className="text-primary/80 animate-ai-pulse" />
                    <span>AI Analytics Assistant</span>
                </CardTitle>
                <CardDescription>
                    Ask questions about the report data to get instant insights.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow h-full overflow-hidden">
                <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
                    <div className="space-y-4 h-full">
                        {messages.length === 0 ? (
                             <div className="flex flex-col items-center justify-center text-center p-4 border-dashed border-2 border-muted-foreground/30 rounded-lg h-full">
                                <Bot className="w-24 h-24 text-primary/30 mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ask anything about the civic reports. For example:
                                </p>
                                <div className="space-y-2">
                                {suggestionPrompts.map(prompt => (
                                    <Button key={prompt} variant="outline" size="sm" className="w-full" onClick={() => setInput(prompt)}>
                                        "{prompt}"
                                    </Button>
                                ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'flex items-start gap-3',
                                        message.role === 'user' ? 'justify-end' : ''
                                    )}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex-shrink-0">
                                            <AvatarFallback><Bot size={18} /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={cn(
                                            'p-3 rounded-lg max-w-sm',
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-card-foreground/5'
                                        )}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="w-8 h-8 bg-muted text-muted-foreground flex-shrink-0">
                                            <AvatarFallback><UserIcon size={18} /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))
                        )}
                         {isGenerating && (
                            <div className="flex items-start gap-3">
                                <Avatar className="w-8 h-8 bg-primary text-primary-foreground flex-shrink-0">
                                    <AvatarFallback><LoaderCircle size={18} className="animate-spin" /></AvatarFallback>
                                </Avatar>
                                <div className="p-3 rounded-lg bg-background border">
                                    <p className="text-sm text-muted-foreground">Thinking...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="mt-4 flex items-center gap-2 pt-4 border-t">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., How many potholes were reported this week?"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isGenerating}
                    />
                    <Button onClick={handleSendMessage} disabled={isGenerating}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
