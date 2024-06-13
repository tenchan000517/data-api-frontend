const { google } = require('googleapis');
const sheets = google.sheets('v4');
const path = require('path');
const fs = require('fs');

const KEYFILEPATH = path.join(__dirname, 'path/to/your/service-account-file.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function writeDataToSheet(data) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = 'your-spreadsheet-id';
  const range = 'Sheet1!A1';

  const resource = {
    values: data,
  };

  try {
    await googleSheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource,
    });
    console.log('Data written to sheet successfully');
  } catch (error) {
    console.error('Error writing to sheet:', error);
  }
}

module.exports = writeDataToSheet;
