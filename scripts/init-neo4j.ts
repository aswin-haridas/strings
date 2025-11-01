import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function initializeDatabase() {
  const uri = process.env.NEO4J_URI || "";
  const username = process.env.NEO4J_USERNAME || "";
  const password = process.env.NEO4J_PASSWORD || "";

  if (!uri || !username || !password) {
    console.error(
      "Missing Neo4j credentials. Please check your .env.local file."
    );
    process.exit(1);
  }

  console.log(`Connecting to Neo4j at ${uri}...`);

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({
    database: process.env.NEO4J_DATABASE || "neo4j",
  });

  try {
    console.log("Connecting to Neo4j...");

    // Clear existing data
    await session.run("MATCH (n) DETACH DELETE n");
    console.log("Cleared existing data");

    // Create sample nodes
    const people = [
      { name: "Alice", bio: "Developer & Designer" },
      { name: "Bob", bio: "Product Manager" },
      { name: "Carol", bio: "Data Scientist" },
      { name: "David", bio: "DevOps Engineer" },
      { name: "Eve", bio: "UX Researcher" },
    ];

    for (const person of people) {
      await session.run("CREATE (n:Person {name: $name, bio: $bio})", person);
    }
    console.log("Created sample nodes");

    // Create relationships
    const connections = [
      { source: "Alice", target: "Bob", strength: 1 },
      { source: "Alice", target: "Carol", strength: 1 },
      { source: "Bob", target: "Carol", strength: 0.8 },
      { source: "Bob", target: "David", strength: 0.6 },
      { source: "Carol", target: "Eve", strength: 1 },
      { source: "Alice", target: "Eve", strength: 0.7 },
    ];

    for (const conn of connections) {
      await session.run(
        `MATCH (source:Person {name: $source})
         MATCH (target:Person {name: $target})
         CREATE (source)-[r:CONNECTED_TO {strength: $strength}]->(target)`,
        conn
      );
    }
    console.log("Created sample connections");

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

initializeDatabase();
