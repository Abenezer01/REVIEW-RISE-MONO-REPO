import axios from 'axios';
import * as cheerio from 'cheerio';

import { resolve } from 'dns/promises';

export interface ExtractedData {
    title: {
        exists: boolean;
        length: number;
        value: string;
    };
    metaDescription: {
        exists: boolean;
        length: number;
    };
    headings: {
        h1Count: number;
        h2Count: number;
    };
    keywords: {
        foundInTitleOrH1: boolean;
        foundInContent: boolean;
    };
    images: {
        altCoverage: number;
        modernFormatRatio: number;
        properlySized: boolean;
    };
    favicon: {
        exists: boolean;
    };
    canonical: {
        matchesCurrent: boolean;
        value: string;
    };
    metaRobots: {
        noindex: boolean;
    };
    compression: {
        enabled: boolean;
    };
    page: {
        htmlSizeKb: number;
        domNodes: number;
    };
    html: {
        lang: number; // > 0 if exists
    };
    network: {
        requestCount: number;
    };
    performance: {
        renderBlockingCount: number;
        hasRenderBlockingResources: boolean;
    };
    metrics: {
        ttfb: number;
        fcp: number;
        lcp: number;
        cls: number;
    };
    security: {
        isHttps: boolean;
        sslValid: boolean;
        wwwResolveMatch: boolean;
        http2Enabled: boolean;
        mixedContentFound: boolean;
        unsafeCrossLinks: boolean;
        xContentTypeOptions: boolean;
    };
    headers: {
        hsts: boolean;
    };
    mobile: {
        viewportExists: boolean;
        mediaQueriesFound: boolean;
        horizontalScroll: boolean;
        tapTargetIssues: boolean;
    };
    advanced: {
        robotsTxtExists: boolean;
        sitemapExists: boolean;
        schemaDetected: boolean;
        custom404Exists: boolean;
        adsTxtExistsOrNotRelevant: boolean;
        spfRecordExists: boolean;
    };
    analytics: {
        detected: boolean;
    };
    content: {
        wordCount: number;
    };
    social: {
        ogTitle: boolean;
        ogImage: boolean;
        twitterCard: boolean;
    };
}

export async function extractSEOData(url: string, html: string, fetchResult: any): Promise<ExtractedData> {
    const $ = cheerio.load(html);
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // --- On-Page ---
    const title = $('title').first().text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;

    // Keyword usage
    const domainWords = hostname.replace('www.', '').split('.')[0];
    const contentText = $('body').text();
    const cleanText = contentText.replace(/\s+/g, ' ').trim();
    const wordCount = cleanText.split(' ').length; // Rough word count

    const hasKeywordsInTitleOrH1 = title.toLowerCase().includes(domainWords) || $('h1').text().toLowerCase().includes(domainWords);
    const hasKeywordsInContent = contentText.toLowerCase().includes(domainWords);

    // Images
    const imgs = $('img');
    const totalImages = imgs.length;
    let imagesWithAlt = 0;
    let modernImages = 0;
    imgs.each((_, el) => {
        if ($(el).attr('alt')) imagesWithAlt++;
        const src = $(el).attr('src') || '';
        if (src.endsWith('.webp') || src.endsWith('.avif')) modernImages++;
    });
    const altCoverage = totalImages > 0 ? imagesWithAlt / totalImages : 1;
    const modernFormatCoverage = totalImages > 0 ? modernImages / totalImages : 1;

    // Favicon
    const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
    const htmlLang = $('html').attr('lang') || '';

    // Canonical
    const canonicalHref = $('link[rel="canonical"]').attr('href');
    let canonicalMatches = false;
    if (canonicalHref) {
        try {
            const absoluteCanonical = new URL(canonicalHref, url).href;
            const absoluteFinal = new URL(fetchResult.finalUrl).href;
            canonicalMatches = absoluteCanonical.replace(/\/$/, '') === absoluteFinal.replace(/\/$/, '');
        } catch { /* ignore */ }
    }

    // Meta Robots
    const metaRobots = $('meta[name="robots"]').attr('content') || '';
    const noindex = metaRobots.toLowerCase().includes('noindex');

    // Social Meta
    const ogTitle = $('meta[property="og:title"]').length > 0;
    const ogImage = $('meta[property="og:image"]').length > 0;
    const twitterCard = $('meta[name="twitter:card"]').length > 0;


    // --- Speed & Performance ---
    const compressionEnabled = !!(fetchResult.headers['content-encoding'] || '');
    const htmlSizeKb = Buffer.byteLength(html) / 1024;
    const domNodes = $('*').length;

    // HTTP Requests (Estimate)
    const scripts = $('script[src]').length;
    const styles = $('link[rel="stylesheet"]').length;
    const reqCount = 1 + scripts + styles + totalImages;

    // Render Blocking
    const blockingScripts = $('head script[src]:not([async]):not([defer])').length;
    const blockingStyles = $('head link[rel="stylesheet"]').length;
    const renderBlocking = (blockingScripts + blockingStyles) > 0;

    // Metrics (Mocked/Estimated)
    const ttfb = (fetchResult.fetchTime / 1000) * 0.4;
    const fcp = (fetchResult.fetchTime / 1000) * 1.5;
    const lcp = (fetchResult.fetchTime / 1000) * 2.0;

    // --- Security ---
    const sslValid = urlObj.protocol === 'https:';
    const hsts = !!(fetchResult.headers['strict-transport-security']);
    const xContentTypeOptions = !!(fetchResult.headers['x-content-type-options']) && fetchResult.headers['x-content-type-options'].toLowerCase().includes('nosniff');

    // Mixed Content
    let mixedContent = false;
    if (sslValid) {
        $('script[src], link[href], img[src], iframe[src]').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('href') || '';
            if (src.startsWith('http://')) mixedContent = true;
        });
    }

    // Unsafe blank
    let unsafeBlankLinks = false;
    $('a[target="_blank"]').each((_, el) => {
        const rel = $(el).attr('rel') || '';
        if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
            unsafeBlankLinks = true;
        }
    });

    // --- Mobile ---
    const viewport = $('meta[name="viewport"]').length > 0;
    const styleText = $('style').text() + ' ' + $('[style]').attr('style');
    const mediaQueries = styleText.includes('@media') || html.includes('media=');

    // --- Advanced ---
    let validRobots = false;
    try {
        const robotsUrl = `${urlObj.origin}/robots.txt`;
        const robotsRes = await axios.get(robotsUrl, { timeout: 3000, validateStatus: () => true });
        validRobots = robotsRes.status === 200;
    } catch { /* ignore */ }

    let sitemapDetected = false;
    try {
        const sitemapUrl = `${urlObj.origin}/sitemap.xml`;
        const sitemapRes = await axios.get(sitemapUrl, { method: 'HEAD', timeout: 3000, validateStatus: () => true });
        sitemapDetected = sitemapRes.status === 200;
    } catch { /* ignore */ }

    const schemaDetected = $('script[type="application/ld+json"]').length > 0;

    let adsTxtPresent = false;
    try {
        const adsUrl = `${urlObj.origin}/ads.txt`;
        const adsRes = await axios.get(adsUrl, { method: 'HEAD', timeout: 3000, validateStatus: () => true });
        adsTxtPresent = adsRes.status === 200;
    } catch { /* ignore */ }

    let hasSpf = false;
    try {
        const txtRecords = await resolve(hostname, 'TXT');
        hasSpf = txtRecords.some(records => records.some(r => r.includes('v=spf1')));
    } catch { /* ignore */ }

    const scriptsText = $('script').text() + $('script').map((_, el) => $(el).attr('src')).get().join(' ');
    const analyticsDetected = /google-analytics|googletagmanager|plausible|segment|mixpanel/i.test(scriptsText);

    return {
        title: { exists: !!title, length: title.length, value: title },
        metaDescription: { exists: !!metaDesc, length: metaDesc.length },
        headings: { h1Count: h1Count, h2Count: h2Count },
        keywords: { foundInTitleOrH1: hasKeywordsInTitleOrH1, foundInContent: hasKeywordsInContent },
        images: {
            altCoverage: totalImages === 0 ? 1 : altCoverage,
            modernFormatRatio: totalImages === 0 ? 1 : modernFormatCoverage,
            properlySized: true // Assume properly sized for now
        },
        favicon: { exists: favicon },
        canonical: { matchesCurrent: canonicalMatches, value: canonicalHref || '' },
        metaRobots: { noindex: noindex },
        compression: { enabled: compressionEnabled },
        page: { htmlSizeKb: htmlSizeKb, domNodes: domNodes },
        html: { lang: htmlLang.length },
        network: { requestCount: reqCount },
        performance: {
            renderBlockingCount: blockingScripts + blockingStyles,
            hasRenderBlockingResources: renderBlocking
        },
        metrics: { ttfb: ttfb, fcp: fcp, lcp: lcp, cls: 0.05 },
        security: {
            isHttps: sslValid,
            sslValid: sslValid,
            wwwResolveMatch: true, // Assume www resolves correctly for now
            http2Enabled: false, // Placeholder
            mixedContentFound: mixedContent,
            unsafeCrossLinks: unsafeBlankLinks,
            xContentTypeOptions: xContentTypeOptions
        },
        headers: { hsts: hsts },
        mobile: {
            viewportExists: viewport,
            mediaQueriesFound: mediaQueries,
            horizontalScroll: false, // Placeholder
            tapTargetIssues: false // Placeholder
        },
        advanced: {
            robotsTxtExists: validRobots,
            sitemapExists: sitemapDetected,
            schemaDetected: schemaDetected,
            custom404Exists: true, // Placeholder
            adsTxtExistsOrNotRelevant: adsTxtPresent || true, // Consider not relevant if not present
            spfRecordExists: hasSpf
        },
        analytics: { detected: analyticsDetected },
        content: { wordCount: wordCount },
        social: { ogTitle: ogTitle, ogImage: ogImage, twitterCard: twitterCard }
    };
}
