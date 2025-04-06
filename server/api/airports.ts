import OpenAI from "openai";
import { storage } from '../storage';
import { InsertAirport, Airport } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AirportData {
  name: string;
  code: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  size?: 'large' | 'medium' | 'small';
  type?: 'international' | 'domestic' | 'regional';
}

/**
 * Fetch all major US airports using OpenAI
 */
export async function fetchUSAirports(): Promise<Airport[]> {
  try {
    // First check if we already have airports in database
    const existingAirports = await storage.getAllAirports();
    if (existingAirports.length > 0) {
      console.log(`Retrieved ${existingAirports.length} airports from database`);
      return existingAirports;
    }

    console.log("Fetching US airport data using OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides accurate data about US airports."
        },
        {
          role: "user", 
          content: "Generate a JSON array containing information for the 50 major US airports. Include name, IATA code, city, country (United States), precise latitude/longitude coordinates, size (large, medium, or small based on number of passengers), and type (international, domestic, or regional). Format as JSON: [{name, code, city, country, latitude, longitude, size, type}]"
        }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = response.choices[0].message.content || '{"airports":[]}';
    const result = JSON.parse(responseContent);
    if (!result.airports || !Array.isArray(result.airports)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Transform and save to database
    const airports: Airport[] = [];
    for (const airportData of result.airports) {
      const airport = await saveAirportToDatabase(airportData);
      airports.push(airport);
    }

    console.log(`Saved ${airports.length} airports to database`);
    return airports;
  } catch (error) {
    console.error("Error fetching US airports:", error);
    return [];
  }
}

/**
 * Save airport data to database
 */
async function saveAirportToDatabase(data: AirportData): Promise<Airport> {
  // Check if airport already exists
  const existingAirport = await storage.getAirportByCode(data.code);
  if (existingAirport) return existingAirport;

  // Create new airport
  const insertAirport: InsertAirport = {
    code: data.code,
    name: data.name,
    city: data.city,
    country: data.country,
    latitude: data.latitude,
    longitude: data.longitude,
    size: data.size,
    type: data.type
  };

  return await storage.createAirport(insertAirport);
}

/**
 * Search airports by query string (name, code, city)
 */
export async function searchAirports(query: string): Promise<Airport[]> {
  const airports = await storage.getAllAirports();
  if (!query) return airports;

  const normalizedQuery = query.toLowerCase().trim();
  return airports.filter(airport => 
    airport.name.toLowerCase().includes(normalizedQuery) ||
    airport.code.toLowerCase().includes(normalizedQuery) ||
    airport.city.toLowerCase().includes(normalizedQuery)
  );
}