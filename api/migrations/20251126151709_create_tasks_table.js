/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('tasks', function (table) {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.timestamp('time_created', { useTz: true }).notNullable().defaultTo(knex.fn.now());
        table.text('description');
        table.enum('status', ['To Do', 'In Progress', 'Done']).notNullable().defaultTo('To Do');
        table.date('due_date').notNullable();
        table.time('due_time').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('tasks');
};
