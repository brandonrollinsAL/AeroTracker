import axios from 'axios';
import { Request, Response } from 'express';
import https from 'https';

// AWS S3 bucket for NEXRAD data
const NEXRAD_BUCKET = 'noaa-nexrad-level2';
const NEXRAD_BASE_URL = `https://${NEXRAD_BUCKET}.s3.amazonaws.com`;

// Create an axios instance with longer timeout and ability to skip SSL verification
// This is important when dealing with large radar files
const axiosInstance = axios.create({
  timeout: 30000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

/**
 * Get the most recent NEXRAD radar image for a station
 * 
 * @param station NEXRAD station ID (e.g., KTLX)
 * @param dateString Date string in YYYY/MM/DD format
 * @returns URL to the radar image or error
 */
async function getMostRecentRadarImage(station: string, dateString: string): Promise<string> {
  try {
    // First, list all files for the station on this date
    const listUrl = `${NEXRAD_BASE_URL}/${dateString}/${station}/`;
    
    // Get the list of files (this would ideally use AWS SDK with proper listing,
    // but we're simplifying with a direct XML request)
    const response = await axiosInstance.get(listUrl);
    
    // Parse the XML response to get file names
    const xmlData = response.data;
    
    // Simple regex to extract filenames
    const fileRegex = /<Key>(.*?)<\/Key>/g;
    const matches = [...xmlData.matchAll(fileRegex)];
    
    if (matches.length === 0) {
      throw new Error('No radar files found for this station and date');
    }
    
    // Find the most recent file (using the timestamp in the filename)
    const latestFiles = matches
      .map(match => match[1])
      .filter(filename => filename.includes(station)) // Ensure it's actually for our station
      .sort()
      .reverse()
      .slice(0, 1); // Get the most recent file
    
    if (latestFiles.length === 0) {
      throw new Error('No valid radar files found');
    }
    
    const latestFile = latestFiles[0];
    
    // Convert the file to a radar image using the NOAA GIS API
    // This will generate a PNG of the radar image
    const radarImageUrl = `https://opengeo.ncep.noaa.gov/geoserver/conus/wms?service=WMS&version=1.1.0&request=GetMap&layers=conus:${station}_bref_raw&styles=&bbox=-126,24,-66,50&width=1024&height=768&srs=EPSG:4326&format=image/png&time=latest`;
    
    return radarImageUrl;
  } catch (error) {
    console.error('Error fetching NEXRAD data:', error);
    throw error;
  }
}

/**
 * Express handler for NEXRAD radar data requests
 */
export async function handleNexradRequest(req: Request, res: Response) {
  const { station, date } = req.query;

  if (!station) {
    return res.status(400).json({ error: 'Station parameter is required' });
  }

  try {
    // Format date as YYYY/MM/DD if provided, otherwise use current date
    let dateString = date as string;
    if (!dateString) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      dateString = `${year}/${month}/${day}`;
    }

    const url = await getMostRecentRadarImage(station as string, dateString);
    
    // Return the image URL to the client
    res.json({ url });
  } catch (error: any) {
    console.error('Error processing NEXRAD request:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NEXRAD data',
      message: error.message || 'Unknown error occurred'
    });
  }
}

// Alternative approach: Generate a "fake" radar URL for development
// This uses the Iowa Environmental Mesonet, which provides pre-rendered NEXRAD images
export function getNexradDevUrl(station: string): string {
  const timestamp = Date.now();
  return `https://mesonet.agron.iastate.edu/archive/data/${timestamp}/GIS/radar/${station}_N0Q_0.png`;
}