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
    // Fetch the logged-in user, their connections (1st degree), and their friends' connections (2nd degree)
    const result = await session.run(
      `MATCH (user:Person {name: $userName})
       OPTIONAL MATCH (user)-[r1:CONNECTED_TO]-(friend:Person)
       OPTIONAL MATCH (friend)-[r2:CONNECTED_TO]-(secondDegree:Person)
       WHERE secondDegree.name <> $userName
       RETURN user, r1, friend, r2, secondDegree`,
      { userName }
    );

    const nodesMap = new Map();
    const links: any[] = [];
    const linksSet = new Set<string>();
    const firstDegreeIds = new Set<string>();
    let mainUserId: string | null = null;

    result.records.forEach((record) => {
      const user = record.get("user");
      const friend = record.get("friend");
      const secondDegree = record.get("secondDegree");
      const r1 = record.get("r1");
      const r2 = record.get("r2");

      // Add user node
      if (user) {
        const userId = user.identity.toString();
        mainUserId = userId;
        if (!nodesMap.has(userId)) {
          nodesMap.set(userId, {
            id: userId,
            name: user.properties.name,
            bio: user.properties.bio || "",
            connections: 0,
            degree: 0,
          });
        }
      }

      // Add first degree connection (friend)
      if (friend) {
        const friendId = friend.identity.toString();
        firstDegreeIds.add(friendId);
        if (!nodesMap.has(friendId)) {
          nodesMap.set(friendId, {
            id: friendId,
            name: friend.properties.name,
            bio: friend.properties.bio || "",
            connections: 0,
            degree: 1,
          });
        }

        // Add link between user and friend
        if (user && r1) {
          const userId = user.identity.toString();
          const linkKey = [userId, friendId].sort().join("-");
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({
              source: userId,
              target: friendId,
              strength: r1.properties.strength || 1,
              type: r1.properties.type || null,
            });
          }
        }
      }

      // Add second degree connection
      if (secondDegree) {
        const secondDegreeId = secondDegree.identity.toString();
        if (!nodesMap.has(secondDegreeId)) {
          nodesMap.set(secondDegreeId, {
            id: secondDegreeId,
            name: secondDegree.properties.name,
            bio: secondDegree.properties.bio || "",
            connections: 0,
            degree: 2,
          });
        }

        // Add link between friend and second degree
        if (friend && r2) {
          const friendId = friend.identity.toString();
          const linkKey = [friendId, secondDegreeId].sort().join("-");
          if (!linksSet.has(linkKey)) {
            linksSet.add(linkKey);
            links.push({
              source: friendId,
              target: secondDegreeId,
              strength: r2.properties.strength || 1,
              type: r2.properties.type || null,
            });
          }
        }
      }
    });

    // Calculate connection counts
    links.forEach((link) => {
      const sourceNode = nodesMap.get(link.source);
      const targetNode = nodesMap.get(link.target);
      if (sourceNode) sourceNode.connections++;
      if (targetNode) targetNode.connections++;
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
