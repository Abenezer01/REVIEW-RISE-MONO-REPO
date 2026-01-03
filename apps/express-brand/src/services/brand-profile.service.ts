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

    const title = $('title').text() || ''
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || ''

    const assets: ExtractedBrandData['assets'] = []
    // Favicon
    const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
    if (favicon) {
      try {
        assets.push({ type: 'favicon', url: new URL(favicon, websiteUrl).toString(), altText: 'Favicon' })
      } catch { /* ignore invalid URL */ }
    }
    // OG Image
    const ogImage = $('meta[property="og:image"]').attr('content')
    if (ogImage) {
      try {
        assets.push({ type: 'og_image', url: new URL(ogImage, websiteUrl).toString(), altText: 'OG Image' })
      } catch { /* ignore invalid URL */ }
    }

    const socialLinks: ExtractedBrandData['socialLinks'] = []
    const socialPlatforms = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com']
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (href) {
        try {
          const fullUrl = new URL(href, websiteUrl).toString()
          const platform = socialPlatforms.find(p => fullUrl.includes(p))
          if (platform) {
            if (!socialLinks.some(l => l.url === fullUrl)) {
              socialLinks.push({ platform: platform.split('.')[0], url: fullUrl })
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

    const colors: ExtractedBrandData['colors'] = []

    // 1. Theme Color
    const themeColor = $('meta[name="theme-color"]').attr('content')
    if (themeColor) {
      colors.push({ hexCode: themeColor, type: 'theme' })
    }

    // 2. Scan for hex codes in style tags and attributes
    const colorCounts = new Map<string, number>()
    const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g

    // Helper to process text for colors
    const processText = (text: string) => {
      const matches = text.match(hexRegex) || []
      matches.forEach(c => {
        // Validate it's a real color length (3 or 6 chars + #)
        if (c.length === 4 || c.length === 7) {
          const norm = c.toLowerCase()
          // Filter out pure black/white as they are usually not "brand" colors, but let's keep them if they are dominant
          colorCounts.set(norm, (colorCounts.get(norm) || 0) + 1)
        }
      })
    }

    // Scan style tags
    $('style').each((_, el) => {
      processText($(el).html() || '')
    })

    // Scan inline styles
    $('[style]').each((_, el) => {
      processText($(el).attr('style') || '')
    })

    // Sort by frequency and take top 5
    const sortedColors = [...colorCounts.entries()]
      .sort((a, b) => b[1] - a[1]) // Descending frequency
      .slice(0, 5)
      .map(([hex]) => ({ hexCode: hex, type: 'detected' }))

    // Add to results, avoiding duplicates with theme color
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

        const finalData = {
          ...dataToStore,
          title: extractedData.title
        }

        await prisma.brandProfile.update({
          where: { id: newBrandProfile.id },
          data: {
            status: 'pending_confirmation',
            currentExtractedData: finalData as Prisma.JsonObject,
          },
        })
        // eslint-disable-next-line no-console
        console.log(`Extraction completed for ${websiteUrl}. Title: ${extractedData.title}`)
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
      pages: true
    },
  })
}

export const updateBrandProfile = async (id: string, updates: any) => {
  return prisma.brandProfile.update({
    where: { id },
    data: { ...updates, updatedAt: new Date() },
  })
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

        await prisma.brandProfile.update({
          where: { id },
          data: {
            status: 'pending_confirmation',
            currentExtractedData: { ...(dataToStore as object), reExtracted: true, timestamp: new Date().toISOString() } as Prisma.JsonObject,
            updatedAt: new Date(),
          },
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
        socialLinks: true
      }
    })
  })
}
