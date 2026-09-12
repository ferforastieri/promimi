import PgBoss from "pg-boss";
export async function createBoss(connectionString: string) {
  const boss = new PgBoss({ connectionString });
  await boss.start();
  return boss;
}
