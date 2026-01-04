import { prisma } from '@platform/db/src/client'
import { Prisma } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface ExtractedBrandData {
  title: string
  description: string
  assets: Array<{ type: string; url: string; altText?: string }>
  colors: Array<{ hexCode: string; type: string }>
  fonts: Array<{ family: string; usage: string; url?: string }>
  socialLinks: Array<{ platform: string; url: string }>
  pages: Array<{ type: string; url: string; summary?: string }>
}

const extractBrandData = async (websiteUrl: string): Promise<ExtractedBrandData> => {
  try {
    const response = await axios.get(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000 // 10s timeout
    })
    // eslint-disable-next-line no-console
    console.log(`Scraping ${websiteUrl} - Status: ${response.status}, Data Length: ${response.data?.length}`)
    const $ = cheerio.load(response.data)

    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || ''
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || ''

    const assets: ExtractedBrandData['assets'] = []

    // Helper to add unique assets
    const addAsset = (type: string, urlStr: string | undefined, altText: string = '') => {
      if (!urlStr) return
      try {
        const fullUrl = new URL(urlStr, websiteUrl).toString()
        if (!assets.some(a => a.url === fullUrl)) {
          assets.push({ type, url: fullUrl, altText })
        }
      } catch { /* ignore */ }
    }

    // Favicon & Icons
    addAsset('favicon', $('link[rel="icon"]').attr('href'), 'Favicon')
    addAsset('favicon', $('link[rel="shortcut icon"]').attr('href'), 'Favicon')
    addAsset('apple_touch_icon', $('link[rel="apple-touch-icon"]').attr('href'), 'Apple Touch Icon')

    // OG Image
    addAsset('og_image', $('meta[property="og:image"]').attr('content'), 'OG Image')

    // Logo Detection - Look for images with 'logo' in class, id, or src
    $('img').each((_, el) => {
      const src = $(el).attr('src')
      const alt = $(el).attr('alt') || ''
      const className = $(el).attr('class') || ''
      const id = $(el).attr('id') || ''

      if (src && (
        alt.toLowerCase().includes('logo') ||
        className.toLowerCase().includes('logo') ||
        id.toLowerCase().includes('logo') ||
        src.toLowerCase().includes('logo')
      )) {
        addAsset('logo', src, alt || 'Detected Logo')
      }
    })

    const socialLinks: ExtractedBrandData['socialLinks'] = []
    const socialPlatforms = ['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'pinterest.com']

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (href) {
        try {
          const fullUrl = new URL(href, websiteUrl).toString()
          const platform = socialPlatforms.find(p => fullUrl.toLowerCase().includes(p))
          if (platform) {
            // Clean platform name
            let cleanPlatform = platform.split('.')[0]
            if (cleanPlatform === 'x') cleanPlatform = 'twitter'
            if (cleanPlatform === 'youtu') cleanPlatform = 'youtube'

            if (!socialLinks.some(l => l.url === fullUrl)) {
              socialLinks.push({ platform: cleanPlatform, url: fullUrl })
            }
          }
        } catch { /* ignore */ }
      }
    })

    const fonts: ExtractedBrandData['fonts'] = []
    $('link[href*="fonts.googleapis.com"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href) {
        try {
          const urlObj = new URL(href, websiteUrl)
          const familyParam = urlObj.searchParams.get('family')
          if (familyParam) {
            const families = familyParam.split('|')
            families.forEach(familyStr => {
              const familyName = familyStr.split(':')[0]
              if (familyName) {
                const cleanName = familyName.replace(/\+/g, ' ').trim()
                if (cleanName && !fonts.some(f => f.family === cleanName)) {
                  fonts.push({ family: cleanName, usage: 'unknown', url: href })
                }
              }
            })
          }
        } catch { /* ignore invalid URL */ }
      }
    })

    // Colors Detection
    const colors: ExtractedBrandData['colors'] = []
    const colorCounts = new Map<string, number>()
    const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g

    // 1. Theme Color
    const themeColor = $('meta[name="theme-color"]').attr('content')
    if (themeColor) {
      if (themeColor.startsWith('#')) {
        colorCounts.set(themeColor.toLowerCase(), 100) // High weight
      }
      colors.push({ hexCode: themeColor, type: 'theme' })
    }

    const processText = (text: string, weight = 1) => {
      const matches = text.match(hexRegex) || []
      matches.forEach(c => {
        if (c.length === 4 || c.length === 7) {
          const norm = c.toLowerCase()
          // Skip pure black and white usually
          if (norm !== '#000000' && norm !== '#ffffff' && norm !== '#fff' && norm !== '#000') {
            colorCounts.set(norm, (colorCounts.get(norm) || 0) + weight)
          }
        }
      })
    }

    // 2. Internal Styles
    $('style').each((_, el) => {
      processText($(el).html() || '')
    })
    $('[style]').each((_, el) => {
      processText($(el).attr('style') || '')
    })

    // 3. External Stylesheets (limit to top 3 to avoid timeouts)
    const cssLinks: string[] = []
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && !href.includes('fonts.googleapis')) {
        try {
          cssLinks.push(new URL(href, websiteUrl).toString())
        } catch { /* ignore */ }
      }
    })

    // Fetch CSS in parallel
    const cssPromises = cssLinks.slice(0, 3).map(link =>
      axios.get(link, { timeout: 5000 }).then(res => res.data).catch(() => '')
    )

    if (cssPromises.length > 0) {
      const cssContents = await Promise.all(cssPromises)
      cssContents.forEach(css => {
        if (typeof css === 'string') processText(css)
      })
    }

    // Sort by frequency
    const sortedColors = [...colorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Get top 8
      .map(([hex]) => ({ hexCode: hex, type: 'detected' }))

    sortedColors.forEach(c => {
      if (!colors.some(existing => existing.hexCode.toLowerCase() === c.hexCode)) {
        colors.push(c)
      }
    })

    return {
      title,
      description,
      assets,
      colors,
      fonts,
      socialLinks,
      pages: []
    }
  } catch (error) {
    console.error(`Scraping failed for ${websiteUrl}:`, error)
    return {
      title: '',
      description: '',
      assets: [],
      colors: [],
      fonts: [],
      socialLinks: [],
      pages: []
    }
  }
}

export const onboardBrandProfile = async (businessId: string, websiteUrl: string) => {
  const newBrandProfile = await prisma.brandProfile.create({
    data: {
      businessId,
      websiteUrl,
      status: 'extracting',
      currentExtractedData: {},
    },
  })

    // Perform web scraping in the background
    ; (async () => {
      try {
        const extractedData = await extractBrandData(websiteUrl)

        // We store it as JSON compat object
        const dataToStore = extractedData as unknown as Prisma.JsonObject;

        console.log('Final Data to Store:', JSON.stringify(dataToStore, null, 2));

        const finalData = {
          ...dataToStore,
          title: extractedData.title
        }

        await prisma.brandProfile.update({
          where: { id: newBrandProfile.id },
          data: {
            status: 'pending_confirmation',
            title: extractedData.title,
            description: extractedData.description,
            currentExtractedData: finalData as Prisma.JsonObject,
          },
        })

        // Save to extraction history
        const versionCount = await prisma.extractedDataVersion.count({
          where: { brandProfileId: newBrandProfile.id }
        })
        await prisma.extractedDataVersion.create({
          data: {
            brandProfileId: newBrandProfile.id,
            versionNumber: versionCount + 1,
            extractedData: finalData as Prisma.JsonObject,
          }
        })
        // eslint-disable-next-line no-console
        console.log(`Extraction completed for ${websiteUrl}. Title: ${extractedData.title}. Database updated.`)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to extract data for ${websiteUrl}:`, error)
        await prisma.brandProfile.update({
          where: { id: newBrandProfile.id },
          data: {
            status: 'failed',
          },
        })
      }
    })()

  // eslint-disable-next-line no-console
  console.log(`Initiating onboarding for ${websiteUrl}. Brand Profile ID: ${newBrandProfile.id}`)
  return newBrandProfile
}

export const getBrandProfile = async (id: string) => {
  return prisma.brandProfile.findUnique({
    where: { id },
    include: {
      assets: true,
      colors: true,
      fonts: true,
      socialLinks: true,
      pages: true,
      extractedDataVersions: {
        orderBy: {
          versionNumber: 'desc'
        }
      }
    },
  })
}

export const updateBrandProfile = async (id: string, data: Partial<Prisma.BrandProfileUpdateInput>) => {
  // Use a transaction to update profile and log the change
  return prisma.$transaction(async (tx) => {
    const updated = await tx.brandProfile.update({
      where: { id },
      data,
      include: { business: true }
    });

    // Create audit log entry - explicitly setting user to undefined to satisfy optional relation
    await tx.auditLog.create({
      data: {
        action: 'UPDATE_BRAND_PROFILE',
        entityId: id,
        entityType: 'BrandProfile',
        details: data as any,
        user: undefined,
      }
    });

    return updated;
  });
}

export const reExtractBrandProfile = async (id: string) => {
  const brandProfile = await getBrandProfile(id)
  if (!brandProfile) {
    return undefined
  }

  // Update status to extracting first
  await prisma.brandProfile.update({
    where: { id },
    data: { status: 'extracting' }
  })

    ; (async () => {
      try {
        const extractedData = await extractBrandData(brandProfile.websiteUrl)
        const dataToStore = extractedData as unknown as Prisma.JsonObject

        const finalData = { ...(dataToStore as object), reExtracted: true, timestamp: new Date().toISOString() } as Prisma.JsonObject;

        await prisma.brandProfile.update({
          where: { id },
          data: {
            status: 'pending_confirmation',
            title: extractedData.title,
            description: extractedData.description,
            currentExtractedData: finalData,
            updatedAt: new Date(),
          },
        })

        // Save to extraction history
        const versionCount = await prisma.extractedDataVersion.count({
          where: { brandProfileId: id }
        })
        await prisma.extractedDataVersion.create({
          data: {
            brandProfileId: id,
            versionNumber: versionCount + 1,
            extractedData: finalData,
          }
        })
      } catch {
        await prisma.brandProfile.update({
          where: { id },
          data: { status: 'failed' } // Or revert to previous status
        })
      }
    })()

  return brandProfile
}

export const confirmExtraction = async (brandProfileId: string) => {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { id: brandProfileId },
  })

  if (!brandProfile || !brandProfile.currentExtractedData) {
    return undefined
  }

  const data = brandProfile.currentExtractedData as unknown as ExtractedBrandData

  // Transactionally update brand profile and create assets
  return prisma.$transaction(async (tx: any) => {
    // Clear existing configuration
    await tx.brandAsset.deleteMany({ where: { brandProfileId } })
    await tx.brandColor.deleteMany({ where: { brandProfileId } })
    await tx.brandFont.deleteMany({ where: { brandProfileId } })
    await tx.brandSocialLink.deleteMany({ where: { brandProfileId } })

    // Insert new
    if (data.assets?.length) {
      await tx.brandAsset.createMany({
        data: data.assets.map(a => ({ brandProfileId, type: a.type, url: a.url, altText: a.altText }))
      })
    }
    if (data.colors?.length) {
      await tx.brandColor.createMany({
        data: data.colors.map(c => ({ brandProfileId, hexCode: c.hexCode, type: c.type }))
      })
    }
    if (data.fonts?.length) {
      await tx.brandFont.createMany({
        data: data.fonts.map(f => ({ brandProfileId, family: f.family, usage: f.usage, url: f.url }))
      })
    }
    if (data.socialLinks?.length) {
      await tx.brandSocialLink.createMany({
        data: data.socialLinks.map(s => ({ brandProfileId, platform: s.platform, url: s.url }))
      })
    }

    return tx.brandProfile.update({
      where: { id: brandProfileId },
      data: {
        status: 'completed',
        updatedAt: new Date(),
        currentExtractedData: Prisma.DbNull,
      },
      include: {
        assets: true,
        colors: true,
        fonts: true,
        socialLinks: true,
        extractedDataVersions: {
          orderBy: {
            versionNumber: 'desc'
          }
        }
      }
    })
  })
}

export const getAllBrandProfiles = async (options: {
  page?: number
  limit?: number
  search?: string
  businessId?: string
  status?: string
}) => {
  const { page = 1, limit = 10, search, businessId, status } = options

  const where: any = {}

  if (search) {
    where.websiteUrl = {
      contains: search,
      mode: 'insensitive'
    }
  }

  if (businessId) {
    where.businessId = businessId
  }

  if (status) {
    where.status = status
  }

  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.brandProfile.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.brandProfile.count({ where })
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const deleteBrandProfile = async (id: string) => {
  return prisma.brandProfile.delete({
    where: { id }
  })
}

export const generateBrandTone = async (id: string, industry?: string, location?: string) => {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { id },
    include: { business: true }
  })

  if (!brandProfile) throw new Error('Brand profile not found')

  // In a real scenario, we would call an AI service (OpenAI/Gemini)
  // For now, we simulate a sophisticated tone generation based on industry and location
  const businessName = brandProfile.business.name
  const targetIndustry = industry || 'Professional Services'
  const targetLocation = location || 'Global'

  // Mocked AI Output
  const mockTone = {
    descriptors: ['Professional', 'Trustworthy', 'Innovative', 'Customer-Centric'],
    writingRules: {
      do: [
        'Use clear and concise language',
        'Address the customer directly',
        'Focus on benefits rather than just features',
        'Maintain a helpful and optimistic tone'
      ],
      dont: [
        'Avoid overly technical jargon',
        'Don’t use passive voice',
        'Never sound dismissive of customer concerns',
        'Avoid slang or overly casual abbreviations'
      ]
    },
    taglines: [
      `${businessName}: Your Partner in ${targetIndustry}`,
      `Innovating for a better ${targetLocation}`,
      `The Future of ${targetIndustry} is Here`,
      `Trust. Innovation. ${businessName}.`,
      `${targetLocation}'s Leading Choice for ${targetIndustry}`
    ],
    messagingPillars: [
      {
        pillar: 'Innovation',
        description: `We lead the ${targetIndustry} market with cutting-edge solutions tailored for ${targetLocation}.`,
        ctas: ['Explore Our Innovations', 'See What’s New']
      },
      {
        pillar: 'Reliability',
        description: 'Dependable service that businesses across the globe trust every single day.',
        ctas: ['Learn More', 'Contact Support']
      },
      {
        pillar: 'Community',
        description: `Proudly serving and growing with the ${targetLocation} community.`,
        ctas: ['Join Our Community', 'Get Involved']
      }
    ]
  }

  // Save to database
  await prisma.brandProfile.update({
    where: { id },
    data: { tone: mockTone as any }
  })

  return mockTone
}
