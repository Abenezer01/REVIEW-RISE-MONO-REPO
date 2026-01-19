/* eslint-disable import/no-unresolved */
'use server'

import { reviewRepository } from '@platform/db'
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
      search
    } = params

    const where: Prisma.ReviewWhereInput = {}

    if (locationId) where.locationId = locationId
    if (businessId) where.businessId = businessId
    if (platform && platform !== 'all') where.platform = platform
    if (rating) where.rating = Number(rating)
    if (sentiment && sentiment !== 'all') where.sentiment = sentiment

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

export async function regenerateAISuggestion(reviewId: string) {
  try {
    const review = await reviewRepository.findById(reviewId)

    if (!review) throw new Error('Review not found')

    // Mock AI regeneration logic - in a real app, this would call an LLM
    const variations = [
      `Hi ${review.author}, we really appreciate your ${review.rating}-star feedback! We're constantly working to improve and hope to see you again.`,
      `Thank you ${review.author} for the ${review.rating}-star review. Your support means a lot to our team!`,
      `Dear ${review.author}, thanks for sharing your experience. We're glad you gave us ${review.rating} stars and we look forward to serving you better next time.`
    ]
    
    const newReply = variations[Math.floor(Math.random() * variations.length)]
    
    const updatedReview = await reviewRepository.update(reviewId, {
      aiSuggestions: {
        analysis: `Regenerated analysis: This ${review.rating}-star review from ${review.author} has been re-evaluated.`,
        suggestedReply: newReply
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
    const updatedReview = await reviewRepository.update(reviewId, {
      response,
      respondedAt: new Date()
    })

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
