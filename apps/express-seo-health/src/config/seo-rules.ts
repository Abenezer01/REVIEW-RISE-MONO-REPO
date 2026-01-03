export const seoRules = {
  "meta": {
    "version": "2.1",
    "engine": "seo-health-rules",
    "scoring": {
      "severityWeights": {
        "HIGH": 3,
        "MEDIUM": 2,
        "LOW": 1
      },
      "statusScores": {
        "PASS": 1.0,
        "WARNING": 0.5,
        "FAIL": 0.0
      }
    }
  },
  "categories": [
    // 1. Common SEO & On-Page (30 Points)
    {
      "id": "common_seo",
      "name": "Common SEO & On-Page",
      "maxPoints": 30,
      "rules": [
        {
          "id": "meta_title",
          "severity": "HIGH",
          "checks": [
            { "field": "title.exists", "operator": "equals", "value": true }
          ],
          "thresholds": {
            "pass": { "field": "title.length", "operator": "between", "value": [30, 65] },
            "warning": { "field": "title.length", "operator": "outside", "value": [30, 65] }
          },
          "message": "Meta title missing or incorrect length",
          "recommendation": "Ensure title exists and is between 30–65 characters."
        },
        {
          "id": "meta_description",
          "severity": "MEDIUM",
          "checks": [
            { "field": "metaDescription.exists", "operator": "equals", "value": true }
          ],
          "thresholds": {
            "pass": { "field": "metaDescription.length", "operator": "between", "value": [120, 220] },
            "warning": { "field": "metaDescription.length", "operator": "outside", "value": [120, 220] }
          },
          "message": "Meta description missing or suboptimal length",
          "recommendation": "Add a meta description between 120–220 characters."
        },
        {
          "id": "h1_unique",
          "severity": "HIGH",
          "checks": [
            { "field": "headings.h1Count", "operator": "equals", "value": 1 }
          ],
          "message": "H1 heading missing or multiple found",
          "recommendation": "Ensure exactly one H1 tag per page."
        },
        {
          "id": "h2_structure",
          "severity": "LOW",
          "checks": [
            { "field": "headings.h2Count", "operator": "gte", "value": 1 }
          ],
          "message": "No H2 headings found",
          "recommendation": "Use H2 headings to structure content."
        },
        {
          "id": "keyword_usage",
          "severity": "MEDIUM",
          "checks": [
            { "field": "keywords.foundInTitleOrH1", "operator": "equals", "value": true },
            { "field": "keywords.foundInContent", "operator": "equals", "value": true }
          ],
          "message": "Primary keywords missing from critical areas",
          "recommendation": "Include primary keywords in the Title or H1 and within the body content."
        },
        {
          "id": "image_alt",
          "severity": "MEDIUM",
          "thresholds": {
            "pass": { "field": "images.altCoverage", "operator": "gte", "value": 0.95 },
            "warning": { "field": "images.altCoverage", "operator": "between", "value": [0.80, 0.95] }
          },
          "message": "Images missing alt attributes",
          "recommendation": "Ensure at least 95% of images have descriptive alt text."
        },
        {
          "id": "canonical_tag",
          "severity": "MEDIUM",
          "checks": [
            { "field": "canonical.matchesCurrent", "operator": "equals", "value": true }
          ],
          "message": "Canonical tag missing or incorrect",
          "recommendation": "Set a canonical URL that matches the preferred domain version."
        }
      ]
    },

    // 2. Speed & Performance (25 Points)
    {
      "id": "speed_performance",
      "name": "Speed & Performance",
      "maxPoints": 25,
      "rules": [
        {
          "id": "compression",
          "severity": "HIGH",
          "checks": [
            { "field": "compression.enabled", "operator": "equals", "value": true }
          ],
          "message": "Text compression (GZIP/Brotli) not enabled",
          "recommendation": "Enable GZIP or Brotli compression on the server."
        },
        {
          "id": "html_size",
          "severity": "LOW",
          "thresholds": {
            "pass": { "field": "page.htmlSizeKb", "operator": "lt", "value": 100 },
            "warning": { "field": "page.htmlSizeKb", "operator": "between", "value": [100, 250] }
          },
          "message": "HTML document size is too large",
          "recommendation": "Reduce HTML size to under 100KB where possible."
        },
        {
          "id": "dom_size",
          "severity": "LOW",
          "checks": [
            { "field": "page.domNodes", "operator": "lt", "value": 1500 }
          ],
          "message": "Excessive DOM size",
          "recommendation": "Reduce DOM complexity (aim for < 1500 nodes)."
        },
        {
          "id": "http_requests",
          "severity": "MEDIUM",
          "thresholds": {
            "pass": { "field": "network.requestCount", "operator": "lte", "value": 40 },
            "warning": { "field": "network.requestCount", "operator": "between", "value": [41, 80] }
          },
          "message": "High number of HTTP requests",
          "recommendation": "Combine files or lazy load assets to keep requests under 40."
        },
        {
          "id": "render_blocking",
          "severity": "HIGH",
          "checks": [
            { "field": "performance.renderBlockingCount", "operator": "equals", "value": 0 }
          ],
          "message": "Render-blocking resources detected",
          "recommendation": "Defer or inline critical CSS/JS to remove render-blocking resources."
        },
        {
          "id": "modern_image_formats",
          "severity": "MEDIUM",
          "checks": [
            { "field": "images.modernFormatRatio", "operator": "gte", "value": 0.7 }
          ],
          "message": "Legacy image formats used",
          "recommendation": "Serve images in modern formats like WebP or AVIF."
        },
        {
          "id": "image_sizing",
          "severity": "MEDIUM",
          "checks": [
            { "field": "images.properlySized", "operator": "equals", "value": true }
          ],
          "message": "Images not properly sized or distorted",
          "recommendation": "Ensure images are sized for the viewport and aspect ratios are correct."
        },
        {
          "id": "core_web_vitals",
          "severity": "HIGH",
          "subRules": [
            { "metric": "LCP", "pass": 2.5, "severity": "HIGH" },
            { "metric": "TTFB", "pass": 0.8, "severity": "MEDIUM" },
            { "metric": "CLS", "pass": 0.1, "severity": "MEDIUM" },
            { "metric": "FCP", "pass": 1.8, "severity": "MEDIUM" }
          ],
          "message": "Core Web Vitals poor",
          "recommendation": "Optimize LCP (<2.5s), TTFB (<0.8s), and CLS (<0.1)."
        }
      ]
    },

    // 3. Server & Security (15 Points)
    {
      "id": "server_security",
      "name": "Server & Security",
      "maxPoints": 15,
      "rules": [
        {
          "id": "https_ssl",
          "severity": "HIGH",
          "checks": [
            { "field": "security.isHttps", "operator": "equals", "value": true },
            { "field": "security.sslValid", "operator": "equals", "value": true }
          ],
          "message": "Site not secure (HTTPS/SSL)",
          "recommendation": "Enforce HTTPS and ensure a valid SSL certificate."
        },
        {
          "id": "url_canonicalization",
          "severity": "HIGH",
          "checks": [
            { "field": "security.wwwResolveMatch", "operator": "equals", "value": true }
          ],
          "message": "WWW and non-WWW versions do not resolve to same URL",
          "recommendation": "Redirect www to non-www (or vice versa) consistently."
        },
        {
          "id": "http2_usage",
          "severity": "MEDIUM",
          "checks": [
            { "field": "security.http2Enabled", "operator": "equals", "value": true }
          ],
          "message": "HTTP/2 not enabled",
          "recommendation": "Upgrade server configuration to support HTTP/2."
        },
        {
          "id": "hsts_header",
          "severity": "LOW",
          "checks": [
            { "field": "headers.hsts", "operator": "equals", "value": true }
          ],
          "message": "HSTS header missing",
          "recommendation": "Enable Strict-Transport-Security header."
        },
        {
          "id": "mixed_content",
          "severity": "HIGH",
          "checks": [
            { "field": "security.mixedContentFound", "operator": "equals", "value": false }
          ],
          "message": "Mixed content (HTTP assets on HTTPS) detected",
          "recommendation": "Update all resource links to use HTTPS."
        },
        {
          "id": "unsafe_cross_origin",
          "severity": "LOW",
          "checks": [
            { "field": "security.unsafeCrossLinks", "operator": "equals", "value": false }
          ],
          "message": "Unsafe target='_blank' links found",
          "recommendation": "Add rel='noopener noreferrer' to external links opening in new tabs."
        }
      ]
    },

    // 4. Mobile Usability (15 Points)
    {
      "id": "mobile_usability",
      "name": "Mobile Usability",
      "maxPoints": 15,
      "rules": [
        {
          "id": "viewport_meta",
          "severity": "HIGH",
          "checks": [
            { "field": "mobile.viewportExists", "operator": "equals", "value": true }
          ],
          "message": "Viewport meta tag missing",
          "recommendation": "Add <meta name='viewport' content='width=device-width, initial-scale=1'>."
        },
        {
          "id": "responsive_css",
          "severity": "MEDIUM",
          "checks": [
            { "field": "mobile.mediaQueriesFound", "operator": "equals", "value": true }
          ],
          "message": "Responsive CSS (media queries) not detected",
          "recommendation": "Use CSS media queries to adapt layout for mobile devices."
        },
        {
          "id": "mobile_layout_issues",
          "severity": "MEDIUM",
          "checks": [
            { "field": "mobile.horizontalScroll", "operator": "equals", "value": false },
            { "field": "mobile.tapTargetIssues", "operator": "equals", "value": false }
          ],
          "message": "Mobile layout issues detected",
          "recommendation": "Ensure no horizontal scrolling and tap targets are appropriately sized."
        }
      ]
    },

    // 5. Advanced SEO & Structured Data (15 Points)
    {
      "id": "advanced_seo",
      "name": "Advanced SEO",
      "maxPoints": 15,
      "rules": [
        {
          "id": "robots_txt",
          "severity": "HIGH",
          "checks": [
            { "field": "advanced.robotsTxtExists", "operator": "equals", "value": true }
          ],
          "message": "robots.txt file missing",
          "recommendation": "Add a valid robots.txt file to control crawler access."
        },
        {
          "id": "sitemap_xml",
          "severity": "HIGH",
          "checks": [
            { "field": "advanced.sitemapExists", "operator": "equals", "value": true }
          ],
          "message": "XML Sitemap missing",
          "recommendation": "Create and link a sitemap.xml file."
        },
        {
          "id": "structured_data",
          "severity": "HIGH",
          "checks": [
            { "field": "advanced.schemaDetected", "operator": "equals", "value": true }
          ],
          "message": "Structured Data (Schema.org) missing",
          "recommendation": "Implement JSON-LD structured data (e.g., Organization, LocalBusiness)."
        },
        {
          "id": "custom_404",
          "severity": "MEDIUM",
          "checks": [
            { "field": "advanced.custom404Exists", "operator": "equals", "value": true }
          ],
          "message": "Custom 404 page missing",
          "recommendation": "Configure a user-friendly custom 404 error page."
        },
        {
          "id": "ads_txt",
          "severity": "LOW",
          "checks": [
            { "field": "advanced.adsTxtExistsOrNotRelevant", "operator": "equals", "value": true }
          ],
          "message": "Ads.txt missing (if ads are present)",
          "recommendation": "If running ads, ensure ads.txt is present and valid."
        },
        {
          "id": "spf_record",
          "severity": "LOW",
          "checks": [
            { "field": "advanced.spfRecordExists", "operator": "equals", "value": true }
          ],
          "message": "SPF record missing",
          "recommendation": "Add an SPF DNS record to improve domain trust and email deliverability."
        }
      ]
    }
  ]
};
