import axios from 'axios'

export const crawl = async (url: string): Promise<string | null> => {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error)
    return null
  }
}

export const extractBrandData = async (_htmlContent: string): Promise<any> => {
  // This is where the parsing logic will go.
  // For now, it's a placeholder.
  // eslint-disable-next-line no-console
  console.log('Extracting brand data from HTML content...')
  return { message: 'Extraction logic to be implemented' }
}
