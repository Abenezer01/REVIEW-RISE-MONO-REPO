import axios from 'axios';
import robotsParser from 'robots-parser';

interface FetchResult {
  html: string;
  statusCode: number;
  headers: any;
  redirected: boolean;
  finalUrl: string;
  fetchTime: number;
  error?: string;
}

export async function fetchWebsite(url: string, userAgent: string = 'SEO-Health-Checker-Bot/1.0'): Promise<FetchResult> {
  const startTime = Date.now();
  
  try {
    // Validate URL
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    
    // Check robots.txt
    const robotsAllowed = await checkRobotsTxt(baseUrl, url, userAgent);
    if (!robotsAllowed) {
      throw new Error('Access denied by robots.txt');
    }
    
    // Fetch the website
    const response = await axios.get(url, {
      timeout: 30000, // 30 second timeout
      maxRedirects: 5,
      validateStatus: () => true, // Accept any status code
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
      },
    });
    
    const fetchTime = Date.now() - startTime;
    
    // Check if response is HTML
    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`Invalid content type: ${contentType}. Expected HTML.`);
    }
    
    return {
      html: response.data,
      statusCode: response.status,
      headers: response.headers,
      redirected: response.request?.res?.responseUrl !== url,
      finalUrl: response.request?.res?.responseUrl || url,
      fetchTime,
    };
    
  } catch (error: any) {
    const fetchTime = Date.now() - startTime;
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - website took too long to respond');
    }
    
    if (error.code === 'ENOTFOUND') {
      throw new Error('Website not found - check the URL is correct');
    }
    
    return {
      html: '',
      statusCode: 0,
      headers: {},
      redirected: false,
      finalUrl: url,
      fetchTime,
      error: error.message || 'Failed to fetch website',
    };
  }
}

async function checkRobotsTxt(baseUrl: string, targetUrl: string, userAgent: string): Promise<boolean> {
  try {
    const robotsUrl = `${baseUrl}/robots.txt`;
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      validateStatus: () => true,
    });
    
    if (response.status === 200) {
      const robots = robotsParser(robotsUrl, response.data);
      return robots.isAllowed(targetUrl, userAgent) ?? true;
    }
    
    // If robots.txt doesn't exist, allow by default
    return true;
    
  } catch {
    // If we can't fetch robots.txt, allow by default
    return true;
  }
}
