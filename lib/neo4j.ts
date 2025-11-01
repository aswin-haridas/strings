import neo4j, { Driver, Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || "";
    const username = process.env.NEO4J_USERNAME || "";
    const password = process.env.NEO4J_PASSWORD || "";

    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }
  return driver;
}

export async function getSession(): Promise<Session> {
  const driver = getDriver();
  return driver.session({ database: process.env.NEO4J_DATABASE || "neo4j" });
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
