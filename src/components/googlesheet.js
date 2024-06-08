const { google } = require('googleapis');
const cron = require('node-cron');

const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/your/service-account-file.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const spreadsheetId = 'YOUR_SPREADSHEET_ID';
const range = 'Sheet1!A1';

const fetchDataAndWriteToSheet = async () => {
  const data = await fetchApiData(); // 取得したデータを取得する関数
  await sheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource: {
      values: [data],
    },
  });
};

cron.schedule('0 0 * * *', fetchDataAndWriteToSheet);
