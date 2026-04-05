import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "waiting_list_customers";

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("name").notNullable();
      table.string("phone_number", 8).notNullable();
      table.string("item_id").notNullable();
      table.string("branch_id").notNullable();

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  override async down() {
    this.schema.dropTable(this.tableName);
  }
}
