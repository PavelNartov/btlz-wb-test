import { google } from 'googleapis';
import env from '#config/env/env.js';
import knex from '#postgres/knex.js';
import { Tariff } from '#types/tariff.js';
import fs from 'fs';
import path from 'path';

function getGoogleSheetsClient() {
    const credentialsPath = path.resolve(process.cwd(), 'gcreds.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

    const auth = new google.auth.JWT(
        credentials.client_email,
        undefined,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    return google.sheets({ version: 'v4', auth });
}

async function getTariffsFromDB(): Promise<Tariff[]> {
    return knex('tariffs')
        .select('*')
        .orderBy('box_delivery_coef_expr', 'asc');
}

export async function updateGoogleSheets() {
    const sheets = getGoogleSheetsClient();
    const sheetIds = env.GOOGLE_SHEET_IDS.split(',');
    const tariffs = await getTariffsFromDB();

    if (tariffs.length === 0) {
        console.log('No tariffs found in the database to update Google Sheets.');
        return;
    }

    const headerRow = Object.keys(tariffs[0]);
    const data = tariffs.map(tariff => Object.values(tariff));

    for (const sheetId of sheetIds) {
        try {
            const spreadsheet = await sheets.spreadsheets.get({
                spreadsheetId: sheetId,
            });

            const sheetExists = spreadsheet.data.sheets?.some(
                (sheet) => sheet.properties?.title === 'stocks_coefs'
            );

            if (!sheetExists) {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sheetId,
                    requestBody: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: 'stocks_coefs',
                                    },
                                },
                            },
                        ],
                    },
                });
                console.log(`Created 'stocks_coefs' sheet in sheet: ${sheetId}`);
            }

            // Clear the sheet
            await sheets.spreadsheets.values.clear({
                spreadsheetId: sheetId,
                range: 'stocks_coefs',
            });

            // Write the new data
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: 'stocks_coefs',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [headerRow, ...data],
                },
            });
            console.log(`Successfully updated sheet: ${sheetId}`);
        } catch (error) {
            console.error(`Error updating sheet: ${sheetId}`, error);
        }
    }
}
