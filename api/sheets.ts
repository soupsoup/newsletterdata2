import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1IPU74-Z8r0oi3f9WzTLT6Xg3IR-hszLSbMd1LBzi2LM';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!credentialsJson) {
      throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
    }

    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get spreadsheet metadata to find all sheet names
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetNames = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];

    // Fetch data from all sheets
    const allData: Record<string, unknown[][]> = {};

    for (const sheetName of sheetNames) {
      if (!sheetName) continue;

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
      });

      allData[sheetName] = response.data.values || [];
    }

    return res.status(200).json({
      success: true,
      data: allData,
      sheets: sheetNames,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
