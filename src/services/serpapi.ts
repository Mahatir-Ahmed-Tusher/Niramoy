
'use server';

export interface SerpApiResult {
  title: string;
  snippet: string;
  link?: string;
  address?: string;
  phone?: string;
}

export async function searchSerpApi(query: string): Promise<SerpApiResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY is not set in the environment variables.');
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: 'google',
      num: '5',
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;
    
    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SerpApi request failed with status ${response.status}: ${errorText}`);
    }

    const jsonResponse = await response.json();
    
    if (jsonResponse.error) {
        throw new Error(jsonResponse.error);
    }

    const localResults = jsonResponse.local_results || [];
    const organicResults = jsonResponse.organic_results || [];

    const mapResult = (result: any) => ({
        title: result.title || '',
        snippet: result.snippet || result.snippet_highlighted_words?.join(' ') || '',
        link: result.link,
        address: result.address,
        phone: result.phone,
    });

    const results = [...localResults.map(mapResult), ...organicResults.map(mapResult)];
    
    const uniqueResults = Array.from(new Map(results.map(item => [item.title, item])).values());
    
    return uniqueResults.slice(0, 5);

  } catch (error) {
    console.error('SerpApi Error:', error);
    return [];
  }
}
