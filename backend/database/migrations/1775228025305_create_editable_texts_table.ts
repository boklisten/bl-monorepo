import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "editable_texts";

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string("id").primary();
      table.text("text");

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  override async down() {
    this.schema.dropTable(this.tableName);
  }
}
