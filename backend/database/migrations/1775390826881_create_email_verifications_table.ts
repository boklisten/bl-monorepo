import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "email_verifications";

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      this.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      table.uuid("id").primary();
      table.string("user_detail_id").notNullable();

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  override async down() {
    this.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
    this.schema.dropTable(this.tableName);
  }
}
