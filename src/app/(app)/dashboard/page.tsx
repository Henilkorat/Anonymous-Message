'use client'
import { MessageCard } from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Message } from '@/Model/user'
import { acceptMessageScema } from '@/schemas/acceptMessageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { Axios, AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { set } from 'mongoose'
import { useSession } from 'next-auth/react'
import React, { use, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const DashboardPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);


  const fetchAiSuggestions = async () => {
  setIsAiLoading(true);
  try {
    const res = await fetch('/api/suggest-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });

    const data = await res.json();

    if (data.error) {
      toast.error(data.error.message);
      return;
    }

    setAiSuggestions(data.messages);
    toast.success('AI suggestions loaded');
  } catch (err) {
    toast.error('Failed to fetch AI suggestions');
  } finally {
    setIsAiLoading(false);
  }
};







  const handleDeleteMessage = async (messageId: string) => {
    if (deletingId === messageId) return;
    setDeletingId(messageId);
    try {
      const response = await axios.delete(`/api/delete-message/${messageId}`);

      if (response.data.success) {
        // ✅ Remove only once
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } else {
        console.warn(response.data.message);
      }
    } catch (error: any) {
      console.error("Error deleting message:", error.response?.data || error.message);
    }
  };



  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageScema)
  })

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages")
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue("acceptMessages", response.data.isAcceptingMessage ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to fetch accept messages status')


    }
    finally {
      setIsSwitchLoading(false)
    }

  }, [setValue])

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true)
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if (refresh) {
        toast.success('Messages refreshed')
      }

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to fetch accept messages status')

    } finally {
      setIsLoading(false)
      setIsSwitchLoading(false)
    }
  }, [setIsLoading, setMessages])

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessages()
  }, [session, setValue, fetchMessages, fetchAcceptMessages])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      })
      setValue('acceptMessages', !acceptMessages)
      toast.success(response.data.message)

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to fetch accept messages status')
    }
  }
  const username = session?.user?.username || "";
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success('Profile URL copied to clipboard')
  }

  if (!session || !session.user) {
    return <div>Please Login</div>
  }
  const handleMessageDelete = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg._id !== id));
  };

  if (isLoading) return <p className="text-center">Loading messages...</p>;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <Separator />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default DashboardPage;
