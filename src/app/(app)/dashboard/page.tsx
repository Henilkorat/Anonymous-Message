
'use client'
import { MessageCard } from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Message } from '@/Model/user'
import { acceptMessageScema } from '@/schemas/acceptMessageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const DashboardPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`)
    }
  }, [])

  const fetchAiSuggestions = async () => {
    setIsAiLoading(true)
    try {
      const res = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      })

      const data = await res.json()
      if (data.error) {
        toast.error(data.error.message)
        return
      }

      setAiSuggestions(data.messages)
      toast.success('AI suggestions loaded')
    } catch {
      toast.error('Failed to fetch AI suggestions')
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (deletingId === messageId) return
    setDeletingId(messageId)
    try {
      const response = await axios.delete(`/api/delete-message/${messageId}`)
      if (response.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
      } else {
        console.warn(response.data.message)
      }
    } catch (error: any) {
      console.error('Error deleting message:', error.response?.data || error.message)
    }
  }

  const { data: session } = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageScema),
  })

  const { register, watch, setValue } = form
  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true)
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessage ?? false)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Failed to fetch accept messages status')
    } finally {
      setIsSwitchLoading(false)
    }
  }, [setValue])

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true)
      setIsSwitchLoading(true)
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages')
        setMessages(response.data.messages || [])
        if (refresh) {
          toast.success('Messages refreshed')
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast.error(axiosError.response?.data.message || 'Failed to fetch messages')
      } finally {
        setIsLoading(false)
        setIsSwitchLoading(false)
      }
    },
    [setIsLoading, setMessages]
  )

  useEffect(() => {
    if (!session || !session.user) return
    fetchMessages()
    fetchAcceptMessages()
  }, [session, setValue, fetchMessages, fetchAcceptMessages])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      })
      setValue('acceptMessages', !acceptMessages)
      toast.success(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Failed to update message settings')
    }
  }

  const username = session?.user?.username || ''
  const profileUrl = `${baseUrl}/u/${username}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success('Profile URL copied to clipboard')
  }

  if (!session || !session.user) {
    return <div className="text-center text-lg text-gray-600 mt-20">Please Login</div>
  }

  if (isLoading) return <p className="text-center text-gray-500 mt-6">Loading messages...</p>

  return (
    <div className="my-6 mx-3 sm:mx-6 md:mx-12 lg:mx-auto p-6 sm:p-8 bg-white shadow-md rounded-2xl w-full max-w-5xl transition-all duration-300">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 text-gray-800 tracking-tight">
        User Dashboard
      </h1>

      {/* Copy Profile Link */}
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 text-gray-700">Your Unique Link</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full p-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 focus:outline-none"
          />
          <Button onClick={copyToClipboard} className="w-full sm:w-auto">Copy</Button>
        </div>
      </div>

      <Separator />

      {/* Refresh Button */}
      <div className="mt-5 flex justify-end">
        <Button
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition rounded-lg px-4 py-2"
          variant="outline"
          onClick={(e) => {
            e.preventDefault()
            fetchMessages(true)
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Messages Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={String(message._id)}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No messages to display.</p>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
