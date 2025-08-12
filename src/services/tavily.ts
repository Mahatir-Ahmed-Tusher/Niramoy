'use server';
/**
 * @fileOverview A service to interact with the Tavily Search API.
 */
import { TavilyClient } from 'tavily';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

/**
 * Searches for drug information using the Tavily API, focusing on specific medical sites.
 * @param query The name of the drug to search for.
 * @returns A promise that resolves to an array of search results.
 */
export async function searchTavily(query: string): Promise<TavilySearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.error('TAVILY_API_KEY is not set in the environment variables.');
    return [];
  }

  try {
    const tavilyClient = new TavilyClient(); // API key defaults to TAVILY_API_KEY env var
    const searchQuery = `${query} site:medex.com.bd OR site:medeasy.health`;

    const searchResponse = await tavilyClient.search({
      query: searchQuery,
      search_depth: "advanced",
      max_results: 5,
      include_raw_content: false,
    });
    
    // Transform the results to match our interface
    const results = searchResponse.results || [];
    return results.map((result: any) => ({
      title: result.title || '',
      url: result.url || '',
      content: result.content || '',
      score: typeof result.score === 'string' ? parseFloat(result.score) || 0 : result.score || 0,
      raw_content: result.raw_content,
    }));

  } catch (error) {
    console.error('Tavily Search API Error:', error);
    // Return empty array on error to prevent crashes downstream
    return [];
  }
}
