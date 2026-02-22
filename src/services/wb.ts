import env from '#config/env/env.js';
import { Tariff } from '#types/tariff.js';
import knex from '#postgres/knex.js';

function parseTariffValue(value: string): number | null {
    if (value === '-') {
        return null;
    }
    return parseFloat(value.replace(',', '.'));
}

export async function getTariffs(date: string): Promise<Tariff[]> {
    const url = `https://common-api.wildberries.ru/api/v1/tariffs/box?date=${date}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `${env.WILDBERRIES_API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tariffs from WB API: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const warehouseList = json.response.data.warehouseList;

    return warehouseList.map((item: any) => ({
        warehouse_name: item.warehouseName,
        geo_name: item.geoName || null,
        box_delivery_base: parseTariffValue(item.boxDeliveryBase),
        box_delivery_coef_expr: parseTariffValue(item.boxDeliveryCoefExpr),
        box_delivery_liter: parseTariffValue(item.boxDeliveryLiter),
        box_delivery_marketplace_base: parseTariffValue(item.boxDeliveryMarketplaceBase),
        box_delivery_marketplace_coef_expr: parseTariffValue(item.boxDeliveryMarketplaceCoefExpr),
        box_delivery_marketplace_liter: parseTariffValue(item.boxDeliveryMarketplaceLiter),
        box_storage_base: parseTariffValue(item.boxStorageBase),
        box_storage_coef_expr: parseTariffValue(item.boxStorageCoefExpr),
        box_storage_liter: parseTariffValue(item.boxStorageLiter),
        date: date,
    }));
}

export async function saveTariffs(tariffs: Tariff[]): Promise<void> {
    if (tariffs.length === 0) {
        return;
    }
    await knex('tariffs')
        .insert(tariffs)
        .onConflict(['warehouse_name', 'date'])
        .merge();
}
