export const seoRules = {
  "meta": {
    "version": "1.1",
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
    {
      "id": "common_seo",
      "name": "Common SEO & On-Page",
      "maxPoints": 30,
      "rules": [
        {
          "id": "meta_title",
          "severity": "HIGH",
          "checks": [
            {
              "field": "title.length",
              "operator": "between",
              "value": [30, 65]
            }
          ],
          "message": "Meta title is missing or not optimized",
          "recommendation": "Use a unique title between 30–65 characters."
        },
        {
          "id": "meta_description",
          "severity": "MEDIUM",
          "checks": [
            {
              "field": "metaDescription.exists",
              "operator": "equals",
              "value": true
            }
          ],
          "thresholds": {
            "pass": {
              "field": "metaDescription.length",
              "operator": "between",
              "value": [120, 220]
            },
            "warning": {
              "field": "metaDescription.length",
              "operator": "outside",
              "value": [120, 220]
            }
          },
          "message": "Meta description is missing or poorly sized",
          "recommendation": "Add a compelling meta description (120–220 characters)."
        },
        {
          "id": "h1_unique",
          "severity": "HIGH",
          "checks": [
            {
              "field": "headings.h1",
              "operator": "equals",
              "value": 1
            }
          ],
          "message": "Page should have exactly one H1",
          "recommendation": "Ensure one clear H1 heading is present."
        },
        {
          "id": "h2_present",
          "severity": "LOW",
          "checks": [
            {
              "field": "headings.h2",
              "operator": "gte",
              "value": 1
            }
          ],
          "message": "No H2 headings detected",
          "recommendation": "Use H2 headings to structure sections."
        },
        {
          "id": "keyword_usage",
          "severity": "MEDIUM",
          "checks": [
            {
              "field": "keywords.inTitleOrH1",
              "operator": "equals",
              "value": true
            },
            {
              "field": "keywords.inContent",
              "operator": "equals",
              "value": true
            }
          ],
          "message": "Primary keywords are weakly used",
          "recommendation": "Include primary keywords naturally in titles, headings, and content."
        },
        {
          "id": "image_alt",
          "severity": "MEDIUM",
          "thresholds": {
            "pass": {
              "field": "images.altCoverage",
              "operator": "gte",
              "value": 0.95
            },
            "warning": {
              "field": "images.altCoverage",
              "operator": "gte",
              "value": 0.8
            }
          },
          "message": "Images missing alt attributes",
          "recommendation": "Add descriptive alt text to images."
        },
        {
          "id": "favicon",
          "severity": "LOW",
          "checks": [
            {
              "field": "favicon.exists",
              "operator": "equals",
              "value": true
            }
          ],
          "message": "Favicon not detected",
          "recommendation": "Add a favicon for branding and UX."
        },
        {
          "id": "canonical",
          "severity": "MEDIUM",
          "checks": [
            {
              "field": "canonical.matchesFinalUrl",
              "operator": "equals",
              "value": true
            }
          ],
          "message": "Canonical tag missing or incorrect",
          "recommendation": "Add a canonical tag pointing to the preferred URL."
        },
        {
          "id": "indexation",
          "severity": "MEDIUM",
          "checks": [
            {
              "field": "metaRobots.noindex",
              "operator": "equals",
              "value": false
            }
          ],
          "message": "Page blocked from indexing",
          "recommendation": "Remove unintended noindex directives."
        }
      ]
    },

    {
      "id": "speed_performance",
      "name": "Speed & Performance",
      "maxPoints": 25,
      "rules": [
        {
          "id": "compression",
          "severity": "HIGH",
          "checks": [
            {
              "field": "compression.enabled",
              "operator": "equals",
              "value": true
            }
          ],
          "message": "HTML compression disabled",
          "recommendation": "Enable GZIP or Brotli compression."
        },
        {
          "id": "html_size",
          "severity": "LOW",
          "thresholds": {
            "pass": { "field": "html.sizeKb", "operator": "lt", "value": 100 },
            "warning": { "field": "html.sizeKb", "operator": "lt", "value": 250 }
          },
          "message": "HTML document is large",
          "recommendation": "Reduce unnecessary markup."
        },
        {
          "id": "dom_size",
          "severity": "LOW",
          "checks": [
            {
              "field": "dom.nodes",
              "operator": "lt",
              "value": 1500
            }
          ],
          "message": "DOM size too large",
          "recommendation": "Simplify page structure."
        },
        {
          "id": "http_requests",
          "severity": "MEDIUM",
          "thresholds": {
            "pass": { "field": "requests.count", "operator": "lte", "value": 40 },
            "warning": { "field": "requests.count", "operator": "lte", "value": 80 }
          },
          "message": "Too many HTTP requests",
          "recommendation": "Reduce scripts, styles, and images."
        },
        {
          "id": "render_blocking",
          "severity": "HIGH",
          "checks": [
            {
              "field": "renderBlocking.detected",
              "operator": "equals",
              "value": false
            }
          ],
          "message": "Render-blocking resources detected",
          "recommendation": "Defer or async non-critical JS and CSS."
        },
        {
          "id": "modern_images",
          "severity": "MEDIUM",
          "checks": [
            {
              "field": "images.modernFormatCoverage",
              "operator": "gte",
              "value": 0.7
            }
          ],
          "message": "Modern image formats not widely used",
          "recommendation": "Use WebP or AVIF for large images."
        },
        {
          "id": "image_sizing",
          "severity": "MEDIUM",
          "checks": [
            {
              "field": "images.oversized",
              "operator": "equals",
              "value": false
            }
          ],
          "message": "Oversized or distorted images detected",
          "recommendation": "Serve properly sized responsive images."
        },
        {
          "id": "core_web_vitals",
          "severity": "HIGH",
          "checks": [
            { "field": "metrics.ttfb", "operator": "lt", "value": 0.8 },
            { "field": "metrics.fcp", "operator": "lt", "value": 1.8 },
            { "field": "metrics.lcp", "operator": "lt", "value": 2.5 },
            { "field": "metrics.cls", "operator": "lt", "value": 0.1 }
          ],
          "message": "Core Web Vitals need improvement",
          "recommendation": "Optimize server response, rendering, and layout stability."
        }
      ]
    },

    {
      "id": "server_security",
      "name": "Server & Security",
      "maxPoints": 15,
      "rules": [
        {
          "id": "https_ssl",
          "severity": "HIGH",
          "checks": [
            { "field": "security.sslValid", "operator": "equals", "value": true }
          ],
          "message": "HTTPS or SSL issues detected",
          "recommendation": "Use HTTPS with a valid SSL certificate."
        },
        {
          "id": "canonical_domain",
          "severity": "HIGH",
          "checks": [
            { "field": "security.singleCanonicalDomain", "operator": "equals", "value": true }
          ],
          "message": "www / non-www canonical conflict",
          "recommendation": "Redirect all variants to a single canonical domain."
        },
        {
          "id": "http2",
          "severity": "MEDIUM",
          "checks": [
            { "field": "security.http2", "operator": "equals", "value": true }
          ],
          "message": "HTTP/2 not enabled",
          "recommendation": "Enable HTTP/2 on the server."
        },
        {
          "id": "hsts",
          "severity": "LOW",
          "checks": [
            { "field": "headers.hsts", "operator": "equals", "value": true }
          ],
          "message": "HSTS header missing",
          "recommendation": "Add Strict-Transport-Security header."
        },
        {
          "id": "mixed_content",
          "severity": "HIGH",
          "checks": [
            { "field": "security.mixedContent", "operator": "equals", "value": false }
          ],
          "message": "Mixed content detected",
          "recommendation": "Ensure all resources load over HTTPS."
        },
        {
          "id": "unsafe_blank",
          "severity": "LOW",
          "checks": [
            { "field": "security.unsafeBlankLinks", "operator": "equals", "value": false }
          ],
          "message": "Unsafe target=\"_blank\" usage detected",
          "recommendation": "Add rel=\"noopener noreferrer\" to external links."
        }
      ]
    },

    {
      "id": "mobile",
      "name": "Mobile Usability",
      "maxPoints": 15,
      "rules": [
        {
          "id": "viewport",
          "severity": "HIGH",
          "checks": [
            { "field": "mobile.viewport", "operator": "equals", "value": true }
          ],
          "message": "Viewport meta tag missing",
          "recommendation": "Add a responsive viewport meta tag."
        },
        {
          "id": "responsive_css",
          "severity": "MEDIUM",
          "checks": [
            { "field": "mobile.mediaQueries", "operator": "equals", "value": true }
          ],
          "message": "Responsive CSS not detected",
          "recommendation": "Use media queries for responsive layouts."
        },
        {
          "id": "mobile_layout",
          "severity": "MEDIUM",
          "checks": [
            { "field": "mobile.layoutIssues", "operator": "equals", "value": false }
          ],
          "message": "Mobile layout usability issues detected",
          "recommendation": "Fix horizontal scrolling and small tap targets."
        }
      ]
    },

    {
      "id": "advanced_seo",
      "name": "Advanced SEO & Structured Data",
      "maxPoints": 15,
      "rules": [
        {
          "id": "robots",
          "severity": "HIGH",
          "checks": [
            { "field": "robots.valid", "operator": "equals", "value": true }
          ],
          "message": "robots.txt missing or invalid",
          "recommendation": "Add a valid robots.txt file."
        },
        {
          "id": "sitemap",
          "severity": "HIGH",
          "checks": [
            { "field": "sitemap.detected", "operator": "equals", "value": true }
          ],
          "message": "Sitemap not detected",
          "recommendation": "Add and submit sitemap.xml."
        },
        {
          "id": "structured_data",
          "severity": "HIGH",
          "checks": [
            { "field": "schema.detected", "operator": "equals", "value": true }
          ],
          "message": "Structured data missing",
          "recommendation": "Add JSON-LD structured data."
        },
        {
          "id": "custom_404",
          "severity": "MEDIUM",
          "checks": [
            { "field": "errors.custom404", "operator": "equals", "value": true }
          ],
          "message": "Custom 404 page not detected",
          "recommendation": "Create a helpful custom 404 page."
        },
        {
          "id": "ads_txt",
          "severity": "LOW",
          "checks": [
            { "field": "adsTxt.present", "operator": "equals", "value": true }
          ],
          "message": "ads.txt missing",
          "recommendation": "Add ads.txt if running ads."
        },
        {
          "id": "spf",
          "severity": "LOW",
          "checks": [
            { "field": "dns.spf", "operator": "equals", "value": true }
          ],
          "message": "SPF record missing",
          "recommendation": "Add an SPF DNS record."
        },
        {
          "id": "analytics",
          "severity": "LOW",
          "checks": [
            { "field": "analytics.detected", "operator": "equals", "value": true }
          ],
          "message": "Analytics not detected",
          "recommendation": "Install Google Analytics or GTM."
        }
      ]
    }
  ]
};
