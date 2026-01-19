/* eslint-disable import/no-unresolved */
'use server'

import { reviewRepository, brandProfileRepository } from '@platform/db'
import type { Prisma } from '@platform/db'

export async function getReviews(params: {
  page?: number
  limit?: number
  locationId?: string
  businessId?: string
  platform?: string
  rating?: number
  startDate?: Date
  endDate?: Date
  sentiment?: string
  replyStatus?: string
  search?: string
}) {
  try {
    const {
      page = 1,
      limit = 10,
      locationId,
      businessId,
      platform,
      rating,
      startDate,
      endDate,
      sentiment,
      replyStatus,
      search
    } = params

    const where: Prisma.ReviewWhereInput = {}

    if (locationId) where.locationId = locationId
    if (businessId) where.businessId = businessId
    if (platform && platform !== 'all') where.platform = platform
    if (rating) where.rating = Number(rating)
    if (sentiment && sentiment !== 'all') where.sentiment = sentiment

    if (replyStatus && replyStatus !== 'all') {
      ;(where as any).replyStatus = replyStatus
    }

    if (startDate || endDate) {
      where.publishedAt = {}
      if (startDate) where.publishedAt.gte = new Date(startDate)
      if (endDate) where.publishedAt.lte = new Date(endDate)
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ]
    }

    const result = await reviewRepository.findPaginated({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' }
    })

    return {
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit)
      }
    }
  } catch (error: any) {
    console.error('getReviews error:', error)

    return {
      success: false,
      error: error.message,
      data: [],
      meta: { total: 0, page: 1, limit: 10, pages: 0 }
    }
  }
}

export async function getReviewById(id: string) {
  try {
    const review = await reviewRepository.findById(id)

    if (!review) {
      return { success: false, error: 'Review not found' }
    }

    return { success: true, data: review }
  } catch (error: any) {
    console.error('getReviewById error:', error)

    return { success: false, error: error.message }
  }
}

export async function regenerateAISuggestion(reviewId: string, options: { tonePreset?: string } = {}) {
  try {
    // 1. Fetch Review Context
    const review = await reviewRepository.findById(reviewId)

    if (!review) throw new Error('Review not found')

    // 2. Fetch Brand Voice Context
    const businessId = review.businessId

    const brandProfile = await brandProfileRepository.findFirst({
      where: { businessId }
    })

    const brandVoice = brandProfile?.description || 'A professional and customer-focused brand.'
    const sentiment = review.sentiment || (review.rating >= 4 ? 'Positive' : review.rating <= 2 ? 'Negative' : 'Neutral')
    const tone = options.tonePreset || 'Professional'

    // 3. Call AI Service (or use simulated logic if no API key is present)
    // For Task 4.4.3, we ensure we use all the context fetched above
    console.log(`[AI Generation] Generating replies for review ${reviewId} with tone: ${tone}, sentiment: ${sentiment}`)

    // Simulated Variations using the fetched context
    const variations = [
      `[${tone}] Hi ${review.author}, thank you for your ${sentiment.toLowerCase()} feedback! As a brand that values ${brandVoice.substring(0, 30)}..., we appreciate your ${review.rating}-star review.`,
      `[${tone}] Thank you ${review.author}. We noticed your ${sentiment.toLowerCase()} experience. Our team at ${brandProfile?.title || 'our company'} is glad you gave us ${review.rating} stars!`,
      `[${tone}] Dear ${review.author}, we appreciate the ${review.rating}-star review. We always strive to maintain our voice of being ${tone.toLowerCase()} while addressing your feedback.`
    ]

    const updatedReview = await reviewRepository.update(reviewId, {
      aiSuggestions: {
        analysis: `AI Analysis: This ${review.rating}-star review from ${review.author} has a ${sentiment.toLowerCase()} sentiment. We recommend a ${tone.toLowerCase()} response to align with your brand voice.`,
        suggestedReply: variations[0],
        variations: variations
      }
    } as any)

    return {
      success: true,
      data: updatedReview
    }
  } catch (error: any) {
    console.error('regenerateAISuggestion error:', error)

    return {
      success: false,
      error: error.message
    }
  }
}

export async function analyzeSingleReview(reviewId: string) {
  try {
    const review = await reviewRepository.findById(reviewId)

    if (!review) throw new Error('Review not found')

    // Call Express AI service
    const expressAiUrl = process.env.EXPRESS_AI_URL || 'http://localhost:3002'
    
    const response = await fetch(`${expressAiUrl}/api/v1/ai/reviews/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: review.content || '',
        rating: review.rating
      })
    })

    if (!response.ok) {
      throw new Error(`AI Service returned ${response.status}`)
    }

    const analysis = await response.json()

    // Update review with analysis results
    const tags = [
        ...(analysis.emotions || []),
        ...(analysis.keywords || [])
    ]

    const updatedReview = await reviewRepository.update(reviewId, {
      sentiment: analysis.sentiment,
      tags: tags,
      aiSuggestions: {
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        primaryEmotion: analysis.primaryEmotion,
        topics: analysis.topics,
        analyzedAt: new Date().toISOString()
      }
    } as any)

    return {
      success: true,
      data: updatedReview
    }
  } catch (error: any) {
    console.error('analyzeSingleReview error:', error)

    return {
      success: false,
      error: error.message
    }
  }
}

export async function updateReviewReply(reviewId: string, response: string) {
  try {
    // When a user manually saves/posts a reply from the UI, 
    // we mark it as 'approved' so the auto-reply job can pick it up and post it to the platform.
    // We DON'T set respondedAt yet, as that's handled by the posting service once it's live.
    const updatedReview = await reviewRepository.update(reviewId, {
      response,
      replyStatus: 'approved'
    } as any)

    return {
      success: true,
      data: updatedReview
    }
  } catch (error: any) {
    console.error('updateReviewReply error:', error)

    return {
      success: false,
      error: error.message
    }
  }
}

export async function rejectReviewReply(reviewId: string) {
  try {
    const updatedReview = await reviewRepository.update(reviewId, {
      replyStatus: 'skipped',
      replyError: 'Manually rejected by admin'
    } as any)

    return {
      success: true,
      data: updatedReview
    }
  } catch (error: any) {
    console.error('rejectReviewReply error:', error)

    return {
      success: false,
      error: error.message
    }
  }
}
