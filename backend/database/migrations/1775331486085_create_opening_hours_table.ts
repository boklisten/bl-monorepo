import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "opening_hours";

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("branch_id").notNullable();
      table.datetime("from").notNullable();
      table.datetime("to").notNullable();

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  override async down() {
    this.schema.dropTable(this.tableName);
  }
}
