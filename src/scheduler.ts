import cron from 'node-cron';
import { getTariffs, saveTariffs } from './services/wb.js';
import { updateGoogleSheets } from './services/google.js';

async function fetchAndSaveTariffs() {
    try {
        const date = new Date().toISOString().slice(0, 10);
        console.log(`Fetching tariffs for ${date}`);
        const tariffs = await getTariffs(date);
        await saveTariffs(tariffs);
        console.log(`Successfully fetched and saved ${tariffs.length} tariffs.`);

        console.log('Updating Google Sheets...');
        await updateGoogleSheets();
        console.log('Google Sheets updated successfully.');
    } catch (error) {
        console.error('Error in scheduled task:', error);
    }
}

export function startScheduler() {
    // Run every hour
    cron.schedule('0 * * * *', fetchAndSaveTariffs);

    console.log('Scheduler started. Tariffs will be fetched and sheets updated every hour.');

    // Also run once on startup
    fetchAndSaveTariffs();
}
