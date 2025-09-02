'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { signUpSchema } from '@/schemas/signUpSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormMessage, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const Page = () => {
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ Use debounced value instead of manual callback
    const [debouncedUsername] = useDebounceValue(username, 500);

    const router = useRouter();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
        }
    });

    // ✅ Check username when debouncedUsername changes
    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (debouncedUsername.length < 3) {
                setUsernameMessage("Username must be at least 3 characters long");
                return;
            }

            try {
                setIsCheckingUsername(true);
                setUsernameMessage('');
                const response = await axios.get(`/api/check-username?username=${debouncedUsername}`);
                setUsernameMessage(response.data.message);
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                setUsernameMessage(
                    axiosError.response?.data.message ?? 'Error checking username'
                );
            } finally {
                setIsCheckingUsername(false);
            }
        };

        if (debouncedUsername) {
            checkUsernameUnique();
        } else {
            setUsernameMessage('');
        }
    }, [debouncedUsername]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data);
            toast.success(`Success: ${response.data.message}`);
            router.replace(`/verify/${data.username}`);
        } catch (error) {
            console.error("Error in sign up", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(`Signup Failed: ${axiosError.response?.data.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Anonymous Message
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Username Field */}
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="username"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(e);
                                                setUsername(value);
                                            }}
                                        />
                                    </FormControl>
                                    {isCheckingUsername ? (
                                        <Loader2 className="animate-spin h-4 w-4 mt-1" />
                                    ) : (
                                        usernameMessage && (
                                            <p
                                                className={`text-sm mt-1 ${usernameMessage.includes("available") ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {usernameMessage}
                                            </p>
                                        )
                                    )}
                                    <FormDescription>This is your public display name.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email Field */}
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link
                            href="/sign-in"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Page;
