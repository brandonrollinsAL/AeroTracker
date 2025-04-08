import OpenAI from "openai";

// Initialize OpenAI client (may be null if API key is not available)
let openaiClient: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
try {
  if (process.env.OPENAI_API_KEY) {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log("OpenAI client initialized successfully");
  } else {
    console.warn("OPENAI_API_KEY environment variable is missing. OpenAI services will not be available.");
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

/**
 * Airport data fetcher using OpenAI
 * Retrieves comprehensive airport information for the AeroLink ecosystem
 */
export async function fetchAirportDetails(airportCode: string) {
  try {
    if (!openai) {
      console.warn("OpenAI client not initialized. Unable to fetch airport details.");
      return {
        code: airportCode,
        name: `Airport ${airportCode}`,
        status: "OpenAI API key not available",
        error: "OpenAI services not available. Please check your API key."
      };
    }
    
    const prompt = `
      Provide detailed information about airport with code ${airportCode} in JSON format. Include:
      - Full name
      - City, country, and time zone
      - Geographic coordinates (latitude, longitude, elevation)
      - Runways (identifiers, length, width, surface)
      - Frequencies (ATIS, tower, ground, approach, departure)
      - Available services (fuel types, ground handling, customs)
      - FBOs (names, services, contact info)
      - Available approaches (ILS, VOR, RNAV)
      - STARs and SIDs
      - Standard taxi routes

      Format the response as valid JSON.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error: any) {
    console.error("Error fetching airport details from OpenAI:", error);
    throw new Error(`Failed to retrieve airport information for ${airportCode}: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Aircraft data fetcher using OpenAI
 * Retrieves comprehensive aircraft information for the AeroLink ecosystem
 */
export async function fetchAircraftDetails(aircraftType: string) {
  try {
    if (!openai) {
      console.warn("OpenAI client not initialized. Unable to fetch aircraft details.");
      return {
        type: aircraftType,
        name: `Aircraft ${aircraftType}`,
        status: "OpenAI API key not available",
        error: "OpenAI services not available. Please check your API key."
      };
    }
    
    const prompt = `
      Provide detailed information about the ${aircraftType} aircraft in JSON format. Include:
      - Full name and manufacturer
      - Performance specifications:
        - Maximum Takeoff Weight (MTOW)
        - Cruise Speed
        - Range
        - Service Ceiling
        - Fuel Capacity
        - Fuel Burn Rate
        - Climb Rate
        - Stall Speed
        - Takeoff Distance
        - Landing Distance
      - Physical specifications:
        - Engine Type and power
        - Wingspan
        - Length
        - Height
        - Passenger Capacity
      - Variants (if any)

      Format the response as valid JSON.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error: any) {
    console.error("Error fetching aircraft details from OpenAI:", error);
    throw new Error(`Failed to retrieve aircraft information for ${aircraftType}: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Bulk airport data fetcher for populating the database
 * Used for initial database population with common airports
 */
export async function bulkFetchAirports(airportCodes: string[]) {
  try {
    if (!openai) {
      console.warn("OpenAI client not initialized. Unable to fetch airport details.");
      // Return minimal mock data structure for each airport code
      return airportCodes.map(code => ({
        code,
        name: `Airport ${code}`,
        status: "OpenAI API key not available",
        error: "OpenAI services not available. Please check your API key."
      }));
    }
    
    // Limit the batch size to avoid token limits
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < airportCodes.length; i += batchSize) {
      const batch = airportCodes.slice(i, i + batchSize);
      const prompt = `
        Provide detailed information about the following airports in JSON format: ${batch.join(', ')}.
        For each airport include:
        - Full name
        - City and country
        - Type (international, domestic, regional)
        - Size (small, medium, large)
        
        Format the response as a JSON array of airport objects.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (content) {
        const parsed = JSON.parse(content);
        results.push(...(Array.isArray(parsed) ? parsed : parsed.airports || []));
      }
    }

    return results;
  } catch (error: any) {
    console.error("Error bulk fetching airports from OpenAI:", error);
    throw new Error(`Failed to retrieve airport information: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Bulk aircraft data fetcher for populating the database
 * Used for initial database population with common aircraft types
 */
export async function bulkFetchAircraft(aircraftTypes: string[]) {
  try {
    if (!openai) {
      console.warn("OpenAI client not initialized. Unable to fetch aircraft details.");
      // Return minimal mock data structure for each aircraft type
      return aircraftTypes.map(type => ({
        type,
        name: `Aircraft ${type}`,
        status: "OpenAI API key not available",
        error: "OpenAI services not available. Please check your API key."
      }));
    }
    
    // Limit the batch size to avoid token limits
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < aircraftTypes.length; i += batchSize) {
      const batch = aircraftTypes.slice(i, i + batchSize);
      const prompt = `
        Provide detailed information about the following aircraft in JSON format: ${batch.join(', ')}.
        For each aircraft include:
        - Full name and manufacturer
        - Type (commercial, private, military)
        - Performance summary (speed, range, ceiling)
        
        Format the response as a JSON array of aircraft objects.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (content) {
        const parsed = JSON.parse(content);
        results.push(...(Array.isArray(parsed) ? parsed : parsed.aircraft || []));
      }
    }

    return results;
  } catch (error: any) {
    console.error("Error bulk fetching aircraft from OpenAI:", error);
    throw new Error(`Failed to retrieve aircraft information: ${error.message || 'Unknown error'}`);
  }
}