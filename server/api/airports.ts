import { storage } from '../storage';
import { InsertAirport, Airport } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Using mock data until OpenAI API key is provided
let openaiEnabled = false;
let openai: any;

try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require("openai");
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    openai = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });
    openaiEnabled = true;
  }
} catch (error) {
  console.log("OpenAI initialization failed, using mock data:", error);
}

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
 * Import airports from CSV file
 * The CSV file comes from the OpenFlights database
 */
export async function importAirportsFromCSV(): Promise<Airport[]> {
  try {
    const csvFilePath = path.join(process.cwd(), 'attached_assets', 'airports.csv');
    console.log(`Reading airports from CSV: ${csvFilePath}`);
    
    // Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`Airport CSV file not found: ${csvFilePath}`);
      return [];
    }
    
    // Read and parse the CSV file
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Filter for US airports and valid data
    const validAirports = records.filter((record: any) => {
      return record.iso_country === 'US' && 
             record.type !== 'closed' && 
             record.iata_code && 
             record.latitude_deg && 
             record.longitude_deg;
    });
    
    console.log(`Found ${validAirports.length} valid US airports in CSV file`);
    
    // Transform to our airport format and save to database
    const airports: Airport[] = [];
    
    for (const record of validAirports) {
      // Determine airport size and type
      let size: 'large' | 'medium' | 'small' = 'small';
      let type: 'international' | 'domestic' | 'regional' = 'regional';
      
      // Set size based on airport type field
      if (record.type.includes('large_airport')) {
        size = 'large';
        type = 'international';
      } else if (record.type.includes('medium_airport')) {
        size = 'medium';
        type = 'domestic';
      }
      
      // Create airport data
      const airportData: AirportData = {
        name: record.name,
        code: record.iata_code || record.gps_code || record.local_code || record.ident,
        city: record.municipality || 'Unknown',
        country: 'United States',
        latitude: parseFloat(record.latitude_deg),
        longitude: parseFloat(record.longitude_deg),
        size,
        type
      };
      
      try {
        const airport = await saveAirportToDatabase(airportData);
        airports.push(airport);
      } catch (error) {
        console.error(`Error saving airport ${airportData.code}:`, error);
      }
    }
    
    console.log(`Successfully imported ${airports.length} airports to database`);
    return airports;
  } catch (error) {
    console.error('Error importing airports from CSV:', error);
    return [];
  }
}

/**
 * Fetch all US airports 
 * This will try multiple data sources in order:
 * 1. Existing airports from database
 * 2. Import from CSV file
 * 3. Fetch from OpenAI API
 * 4. Use mock data as fallback
 */
export async function fetchUSAirports(): Promise<Airport[]> {
  try {
    // First check if we already have airports in database
    const existingAirports = await storage.getAllAirports();
    if (existingAirports.length > 0) {
      console.log(`Retrieved ${existingAirports.length} airports from database`);
      return existingAirports;
    }
    
    // Try importing from CSV first
    try {
      const csvAirports = await importAirportsFromCSV();
      if (csvAirports.length > 0) {
        console.log(`Using ${csvAirports.length} airports imported from CSV`);
        return csvAirports;
      }
    } catch (csvError) {
      console.error('Error importing from CSV, falling back to other methods:', csvError);
    }

    // If OpenAI is enabled, use it to fetch airports
    if (openaiEnabled && openai) {
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
    } else {
      // Use mock data when OpenAI is not available
      console.log("Using mock airport data (OpenAI not available)...");
      const mockAirports = getMockAirports();
      
      // Save mock data to database
      const airports: Airport[] = [];
      for (const airportData of mockAirports) {
        const airport = await saveAirportToDatabase(airportData);
        airports.push(airport);
      }
      
      console.log(`Saved ${airports.length} mock airports to database`);
      return airports;
    }
  } catch (error) {
    console.error("Error fetching US airports:", error);
    return [];
  }
}

/**
 * Get mock airport data
 */
function getMockAirports(): AirportData[] {
  return [
    {
      name: "Hartsfield-Jackson Atlanta International Airport",
      code: "ATL",
      city: "Atlanta",
      country: "United States",
      latitude: 33.6407,
      longitude: -84.4277,
      size: "large",
      type: "international"
    },
    {
      name: "Los Angeles International Airport",
      code: "LAX",
      city: "Los Angeles",
      country: "United States",
      latitude: 33.9416,
      longitude: -118.4085,
      size: "large",
      type: "international"
    },
    {
      name: "O'Hare International Airport",
      code: "ORD",
      city: "Chicago",
      country: "United States",
      latitude: 41.9742,
      longitude: -87.9073,
      size: "large",
      type: "international"
    },
    {
      name: "Dallas/Fort Worth International Airport",
      code: "DFW",
      city: "Dallas",
      country: "United States",
      latitude: 32.8998,
      longitude: -97.0403,
      size: "large",
      type: "international"
    },
    {
      name: "Denver International Airport",
      code: "DEN",
      city: "Denver",
      country: "United States",
      latitude: 39.8561,
      longitude: -104.6737,
      size: "large",
      type: "international"
    },
    {
      name: "John F. Kennedy International Airport",
      code: "JFK",
      city: "New York",
      country: "United States",
      latitude: 40.6413,
      longitude: -73.7781,
      size: "large",
      type: "international"
    },
    {
      name: "San Francisco International Airport",
      code: "SFO",
      city: "San Francisco",
      country: "United States",
      latitude: 37.6213,
      longitude: -122.3790,
      size: "large",
      type: "international"
    },
    {
      name: "Seattle-Tacoma International Airport",
      code: "SEA",
      city: "Seattle",
      country: "United States",
      latitude: 47.4502,
      longitude: -122.3088,
      size: "large",
      type: "international"
    },
    {
      name: "Miami International Airport",
      code: "MIA",
      city: "Miami",
      country: "United States",
      latitude: 25.7932,
      longitude: -80.2906,
      size: "large",
      type: "international"
    },
    {
      name: "McCarran International Airport",
      code: "LAS",
      city: "Las Vegas",
      country: "United States",
      latitude: 36.0840,
      longitude: -115.1537,
      size: "large",
      type: "international"
    }
  ];
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