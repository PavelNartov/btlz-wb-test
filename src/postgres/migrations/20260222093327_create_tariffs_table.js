/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable('tariffs', (table) => {
        table.string('warehouse_name').notNullable();
        table.string('geo_name');
        table.decimal('box_delivery_base');
        table.integer('box_delivery_coef_expr');
        table.decimal('box_delivery_liter');
        table.decimal('box_delivery_marketplace_base');
        table.integer('box_delivery_marketplace_coef_expr');
        table.decimal('box_delivery_marketplace_liter');
        table.decimal('box_storage_base');
        table.integer('box_storage_coef_expr');
        table.decimal('box_storage_liter');
        table.timestamp('date').notNullable();
        table.primary(['warehouse_name', 'date']);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable('tariffs');
}
