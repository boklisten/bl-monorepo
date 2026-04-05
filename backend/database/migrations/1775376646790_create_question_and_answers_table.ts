import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "question_and_answers";

  override async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.text("question").notNullable();
      table.text("answer").notNullable();

      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  override async down() {
    this.schema.dropTable(this.tableName);
  }
}
