import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface GeocodingResponse {
  lat: string;
  lon: string;
  boundingbox: string[];
}

interface OverpassElement {
  tags: {
    name: string;
    tourism: string;
    description?: string;
    'description:en'?: string;
    'addr:street'?: string;
    wikipedia?: string;
    'wikipedia:en'?: string;
    website?: string;
  };
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export const touristAttractionsTool = createTool({
  id: 'get-tourist-attractions',
  description: 'Get tourist attractions, museums, monuments, and points of interest for a specific city and country',
  inputSchema: z.object({
    city: z.string().describe('City name (e.g., Lagos, Abuja, Cape Town)'),
    country: z.string().describe('Country name (e.g., Nigeria, South Africa)'),
    limit: z.number().optional().default(10).describe('Maximum number of attractions to return'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    city: z.string().optional(),
    country: z.string().optional(),
    attractions: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string(),
        address: z.string(),
        wikipedia: z.string().nullable(),
        website: z.string().nullable(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    ).optional(),
    count: z.number().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { city, country, limit = 10 } = context;

    try {
      // Geocode the city to get coordinates
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&format=json&limit=1`;
      
      const geocodeResponse = await fetch(geocodeUrl, {
        headers: { 'User-Agent': 'MastraTourGuideAgent/1.0' },
      });
      
      const geocodeData = await geocodeResponse.json() as GeocodingResponse[];
      
      if (!geocodeData || geocodeData.length === 0) {
        return {
          success: false,
          message: `Could not find coordinates for ${city}, ${country}`,
        };
      }

      const { lat, lon, boundingbox } = geocodeData[0];
      const [south, north, west, east] = boundingbox;

      // Query Overpass API for tourist attractions
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["tourism"~"attraction|museum|gallery|viewpoint|monument"]["name"](${south},${west},${north},${east});
          way["tourism"~"attraction|museum|gallery|viewpoint|monument"]["name"](${south},${west},${north},${east});
          relation["tourism"~"attraction|museum|gallery|viewpoint|monument"]["name"](${south},${west},${north},${east});
        );
        out body center ${limit};
      `;

      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const overpassResponse = await fetch(overpassUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      const overpassData = await overpassResponse.json() as OverpassResponse;

      if (!overpassData.elements || overpassData.elements.length === 0) {
        return {
          success: false,
          message: `No tourist attractions found in ${city}, ${country}. Try a larger city or different location.`,
        };
      }

      // Format the results
      const attractions = overpassData.elements.slice(0, limit).map((element) => ({
        name: element.tags.name,
        type: element.tags.tourism,
        description: element.tags.description || element.tags['description:en'] || 'No description available',
        address: element.tags['addr:street'] || 'Address not available',
        wikipedia: element.tags.wikipedia || element.tags['wikipedia:en'] || null,
        website: element.tags.website || null,
        latitude: element.lat || element.center?.lat,
        longitude: element.lon || element.center?.lon,
      }));

      return {
        success: true,
        city,
        country,
        attractions,
        count: attractions.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching attractions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});


export const countryInfoTool = createTool({
  id: 'get-country-info',
  description: 'Get general information about a country including capital, languages, currency, timezone, and population',
  inputSchema: z.object({
    country: z.string().describe('Country name (e.g., Nigeria, Kenya, Ghana)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    country: z.string().optional(),
    capital: z.string().optional(),
    region: z.string().optional(),
    subregion: z.string().optional(),
    languages: z.string().optional(),
    currencies: z.string().optional(),
    population: z.string().optional(),
    timezone: z.string().optional(),
    drivingSide: z.string().optional(),
    flagEmoji: z.string().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { country } = context;

    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        return {
          success: false,
          message: `Could not find information for ${country}`,
        };
      }

      const countryData = data[0];

      return {
        success: true,
        country: countryData.name.common,
        capital: countryData.capital?.[0] || 'N/A',
        region: countryData.region,
        subregion: countryData.subregion,
        languages: Object.values(countryData.languages || {}).join(', '),
        currencies: Object.values(countryData.currencies || {})
          .map((c: any) => `${c.name} (${c.symbol})`)
          .join(', '),
        population: countryData.population.toLocaleString(),
        timezone: countryData.timezones?.[0] || 'N/A',
        drivingSide: countryData.car?.side || 'N/A',
        flagEmoji: countryData.flag,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching country info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});


export const travelTipsTool = createTool({
  id: 'get-travel-tips',
  description: 'Get travel tips, city overview, and insights for a destination using Wikipedia',
  inputSchema: z.object({
    city: z.string().describe('City name'),
    country: z.string().describe('Country name'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    city: z.string().optional(),
    country: z.string().optional(),
    overview: z.string().optional(),
    generalTips: z.array(z.string()).optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { city, country } = context;

    try {
      // Search Wikipedia for the city
      const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(city + ' ' + country)}&format=json&origin=*`;
      
      const searchResponse = await fetch(wikiSearchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.query?.search || searchData.query.search.length === 0) {
        return {
          success: false,
          message: `Could not find travel information for ${city}, ${country}`,
        };
      }

      const pageId = searchData.query.search[0].pageid;

      // Get Wikipedia extract/summary
      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
      
      const extractResponse = await fetch(extractUrl);
      const extractData = await extractResponse.json();

      const extract = extractData.query?.pages?.[pageId]?.extract || 'No information available';

      return {
        success: true,
        city,
        country,
        overview: extract,
        generalTips: [
          'Always carry local currency for small purchases and markets',
          'Learn a few basic phrases in the local language - locals appreciate the effort',
          'Respect local customs, dress codes, and religious practices',
          'Stay hydrated, especially in warm climates',
          'Be cautious with street food initially until your stomach adjusts',
          'Keep copies of important documents (passport, visa, insurance)',
          'Register with your embassy if staying long-term',
          'Research local emergency numbers and hospital locations',
          'Use reputable transportation services and accommodation',
          'Be aware of common scams targeting tourists in the area',
        ],
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching travel tips: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});