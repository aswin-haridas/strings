import { NextResponse } from "next/server";
import { getSession } from "@/lib/neo4j";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get("userName");

  if (!userName) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getSession();

  try {
    // Fetch only the logged-in user and their connections
    const result = await session.run(
      `MATCH (user:Person {name: $userName})
       OPTIONAL MATCH (user)-[r:CONNECTED_TO]->(m:Person)
       RETURN user, r, m`,
      { userName }
    );

    const nodesMap = new Map();
    const links: any[] = [];

    result.records.forEach((record) => {
      const node = record.get("user");
      if (node) {
        const nodeId = node.identity.toString();
        if (!nodesMap.has(nodeId)) {
          nodesMap.set(nodeId, {
            id: nodeId,
            name: node.properties.name,
            bio: node.properties.bio || "",
            connections: 0,
          });
        }
      }

      const targetNode = record.get("m");
      const relationship = record.get("r");

      if (targetNode && relationship) {
        const targetId = targetNode.identity.toString();
        if (!nodesMap.has(targetId)) {
          nodesMap.set(targetId, {
            id: targetId,
            name: targetNode.properties.name,
            bio: targetNode.properties.bio || "",
            connections: 0,
          });
        }

        const sourceId = node.identity.toString();
        links.push({
          source: sourceId,
          target: targetId,
          strength: relationship.properties.strength || 1,
          type: relationship.properties.type || null,
        });

        // Update connection counts
        const sourceNode = nodesMap.get(sourceId);
        const targetNodeData = nodesMap.get(targetId);
        if (sourceNode) sourceNode.connections++;
        if (targetNodeData) targetNodeData.connections++;
      }
    });

    return NextResponse.json({
      nodes: Array.from(nodesMap.values()),
      links,
    });
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data" },
      { status: 500 }
    );
  } finally {
    await session.close();
  }
}
