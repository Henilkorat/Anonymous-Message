

'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
    return messageString.split(specialChar);
};

const initialMessageString =
    "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
    const params = useParams<{ username: string }>();
    const username = params.username;

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
    });

    const messageContent = form.watch('content');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);
    const [suggestedMessages, setSuggestedMessages] = useState<string[]>(
        parseStringMessages(initialMessageString)
    );

    const handleMessageClick = (message: string) => {
        form.setValue('content', message);
    };

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse>('/api/send-message', {
                ...data,
                username,
            });

            if (response.data.success) {
                toast.success(response.data.message || 'Message sent successfully!');
                form.reset({ content: '' });
            } else {
                toast.error(response.data.message || 'Failed to send message');
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || 'Something went wrong!');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSuggestedMessages = async () => {
        try {
            setIsSuggestLoading(true);
            const response = await fetch('/api/suggest-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
                setSuggestedMessages(data.messages);
            } else {
                toast.error('No messages received from AI');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch suggested messages');
        } finally {
            setIsSuggestLoading(false);
        }
    };

    return (
        <div className="container mx-auto my-8 p-6 bg-white rounded-xl shadow-md max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">
                Public Profile Link
            </h1>

            {/* Form Section */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg font-semibold">
                                    Send Anonymous Message to @{username}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write your anonymous message here..."
                                        className="resize-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            disabled={isLoading || !messageContent}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Send It'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Suggest Messages Section */}
            <div className="space-y-4 my-8">
                <div className="space-y-2">
                    <Button
                        onClick={fetchSuggestedMessages}
                        className="my-2"
                        disabled={isSuggestLoading}
                    >
                        {isSuggestLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Fetching Suggestions...
                            </>
                        ) : (
                            'Suggest Messages'
                        )}
                    </Button>
                    <p className="text-gray-700 text-sm">
                        Click on any message below to select it.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <h3 className="text-xl font-semibold">Messages</h3>
                    </CardHeader>
                    {/* <CardContent className="flex flex-wrap gap-2">
                        {suggestedMessages.map((message, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="px-3 py-2 text-sm rounded-lg border border-gray-300 break-words max-w-full sm:max-w-xs text-left"
                                onClick={() => handleMessageClick(message)}
                            >
                                {message}
                            </Button>
                        ))}
                    </CardContent> */}
                    <CardContent className="flex flex-col gap-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestedMessages.map((message, index) => (
            <Button
                key={index}
                variant="outline"
                onClick={() => handleMessageClick(message)}
                className="whitespace-normal break-words text-left p-3 h-auto w-full min-h-[48px] rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100"
            >
                {message}
            </Button>
        ))}
    </div>
</CardContent>
                </Card>
            </div>

            <Separator className="my-6" />

            <div className="text-center">
                <div className="mb-4 text-gray-700">Get Your Message Board</div>
                <Link href={'/sign-up'}>
                    <Button>Create Your Account</Button>
                </Link>
            </div>
        </div>
    );
}
