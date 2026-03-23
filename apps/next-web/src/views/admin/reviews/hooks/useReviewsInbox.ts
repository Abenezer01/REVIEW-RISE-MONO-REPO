'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useApiGet, useApiPost } from '@/hooks/useApi'
import { SERVICES_CONFIG } from '@/configs/services'

const REVIEWS_API = SERVICES_CONFIG.review.url

// Filter state for the feed
export interface ReviewFeedFilters {
    rating?: string
    replyStatus?: string
    sentiment?: string
    search?: string
}

// Shape of a single review returned from the API
export interface InboxReview {
    id: string
    authorName: string
    authorPhotoUrl?: string
    rating: number
    timeAgo: string
    content: string
    platform: 'google' | 'yelp' | 'facebook'
    sentiment: 'Positive' | 'Neutral' | 'Negative'
    isReplied: boolean
    aiSuggestedReply?: string
}

export function useReviewsInbox(locationId: string) {
    const queryClient = useQueryClient()

    const [filters, setFilters] = useState<ReviewFeedFilters>({
        replyStatus: 'unanswered',
        rating: 'all',
        sentiment: 'all'
    })

    const [isGenerating, setIsGenerating] = useState(false)

    /**
     * --------------- Reviews Feed ---------------
     */
    const reviewsQuery = useApiGet<{ reviews: InboxReview[]; total: number; page: number }>(
        ['reviews', 'inbox', locationId, JSON.stringify(filters)],
        `${REVIEWS_API}/reviews/locations/${locationId}/reviews`,
        {
            ...(filters.rating && filters.rating !== 'all' ? { rating: filters.rating } : {}),
            ...(filters.replyStatus && filters.replyStatus !== 'all' ? { replyStatus: filters.replyStatus } : {}),
            ...(filters.sentiment && filters.sentiment !== 'all' ? { sentiment: filters.sentiment } : {}),
            limit: 20
        },
        { enabled: !!locationId }
    )

    /**
     * --------------- Review Stats (for the hero card) ---------------
     */
    const statsQuery = useApiGet(
        ['reviews', 'stats', locationId],
        `${REVIEWS_API}/reviews/locations/${locationId}/stats`,
        {},
        { enabled: !!locationId }
    )

    /**
     * --------------- Post Reply ---------------
     */
    const postReplyMutation = useApiPost<unknown, { reviewId: string; content: string }>(
        `${REVIEWS_API}/reviews/PLACEHOLDER/reply`,
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['reviews', 'inbox', locationId] })
                queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', locationId] })
            }
        }
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const postReply = async ({ reviewId, content }: { reviewId: string; content: string }) => {
        await postReplyMutation.mutateAsync({ reviewId, content })
    }

    /**
     * --------------- Generate AI Reply ---------------
     */

    const generateAiReply = async ({ reviewId, tone }: { reviewId: string; tone: string }): Promise<string> => {
        setIsGenerating(true)

        try {
            const response = await fetch(`${SERVICES_CONFIG.ai.url}/review-reply/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reviewId, tone })
            })

            if (!response.ok) {
                throw new Error('Failed to generate AI reply')
            }

            const json = await response.json()

            // The service returns { variations: [{ tone, reply }] } — pick the matching tone or first
            const variations: Array<{ tone: string; reply: string }> = json?.data?.variations || []
            const match = variations.find(v => v.tone.toLowerCase() === tone.toLowerCase())

            return (match?.reply || variations[0]?.reply || 'No reply generated.')
        } finally {
            setIsGenerating(false)
        }
    }

    /**
     * Expose a normalized post helper that uses the real endpoint
     */

    const postReplyForReview = async ({ reviewId, content }: { reviewId: string; content: string }) => {

        /**
         * POST /api/v1/reviews/:reviewId/reply
         */
        const response = await fetch(`${REVIEWS_API}/reviews/${reviewId}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ comment: content })
        })

        if (!response.ok) throw new Error('Failed to post reply')

        queryClient.invalidateQueries({ queryKey: ['reviews', 'inbox', locationId] })
        queryClient.invalidateQueries({ queryKey: ['reviews', 'stats', locationId] })
    }

    return {
        reviews: reviewsQuery.data?.reviews ?? [],
        total: reviewsQuery.data?.total ?? 0,
        isLoading: reviewsQuery.isLoading,
        isError: reviewsQuery.isError,

        stats: statsQuery.data,
        statsLoading: statsQuery.isLoading,

        filters,
        setFilters,

        postReply: postReplyForReview,
        isPosting: postReplyMutation.isPending,

        generateAiReply,
        isGenerating
    }
}
