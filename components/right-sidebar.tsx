"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GraphNode, GraphData } from "@/app/page";
import { Users, Info, Link2, X, Target, Search } from "lucide-react";

interface RightSidebarProps {
  selectedNode: GraphNode | null;
  relationshipNode: GraphNode | null;
  setRelationshipNode: (node: GraphNode | null) => void;
  graphData: GraphData;
  onSetMainPerson: (node: GraphNode) => void;
  mainPerson: GraphNode | null;
}

export function RightSidebar({
  selectedNode,
  relationshipNode,
  setRelationshipNode,
  graphData,
  onSetMainPerson,
  mainPerson,
}: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GraphNode[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = graphData.nodes.filter((node) =>
        node.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSelectSearchResult = (node: GraphNode) => {
    onSetMainPerson(node);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-border overflow-y-auto flex flex-col shadow-sm">
        <div className="p-6 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Search Person
          </h2>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Type a name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 rounded-xl border-border bg-pampas"
            />
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto z-20">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => handleSelectSearchResult(node)}
                        className="w-full text-left p-3 hover:bg-pampas rounded-lg transition-colors"
                      >
                        <p className="font-medium text-foreground text-sm">
                          {node.name}
                        </p>
                        {node.bio && (
                          <p className="text-xs text-muted-foreground truncate">
                            {node.bio}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-pampas flex items-center justify-center mx-auto mb-4">
              <Info size={24} className="text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">
              Search or click on a person
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              to view details
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find all connections for this node
  const connectedNodeIds = new Set<string>();
  graphData.links.forEach((link) => {
    if (link.source === selectedNode.id) {
      connectedNodeIds.add(
        typeof link.target === "string" ? link.target : link.target
      );
    } else if (link.target === selectedNode.id) {
      connectedNodeIds.add(
        typeof link.source === "string" ? link.source : link.source
      );
    }
  });

  const connectedNodes = graphData.nodes.filter((node) =>
    connectedNodeIds.has(node.id)
  );

  const hasDirectConnection =
    relationshipNode &&
    graphData.links.some(
      (link) =>
        (link.source === selectedNode.id &&
          link.target === relationshipNode.id) ||
        (link.source === relationshipNode.id && link.target === selectedNode.id)
    );

  return (
    <div className="w-80 bg-white border-l border-border overflow-y-auto flex flex-col shadow-sm">
      <div className="p-6 border-b border-border sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Details</h2>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search person..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 rounded-xl border-border bg-pampas"
          />
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto z-20">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => handleSelectSearchResult(node)}
                      className="w-full text-left p-3 hover:bg-pampas rounded-lg transition-colors"
                    >
                      <p className="font-medium text-foreground text-sm">
                        {node.name}
                      </p>
                      {node.bio && (
                        <p className="text-xs text-muted-foreground truncate">
                          {node.bio}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-5">
        {/* Main Person Button */}
        <div className="space-y-3">
          <Button
            onClick={() => onSetMainPerson(selectedNode)}
            className={`w-full rounded-xl font-semibold transition-all ${
              mainPerson?.id === selectedNode.id
                ? "bg-crail hover:bg-crail/90 text-white"
                : "bg-pampas hover:bg-pampas/80 text-foreground border border-border"
            }`}
          >
            <Target size={16} className="mr-2" />
            {mainPerson?.id === selectedNode.id
              ? "Main Person (Active)"
              : "Set as Main Person"}
          </Button>
          {mainPerson?.id === selectedNode.id && (
            <p className="text-xs text-muted-foreground text-center">
              Graph centered on this person and their connections
            </p>
          )}
        </div>

        <Separator className="bg-border" />

        {/* Profile Card */}
        <Card className="border-border bg-pampas rounded-2xl shadow-none">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-xl font-semibold text-foreground">
                {selectedNode.name}
              </h3>
              {selectedNode.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedNode.bio}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-border" />

        {relationshipNode && relationshipNode.id !== selectedNode.id && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-crail/10 flex items-center justify-center">
                    <Link2 size={14} className="text-crail" />
                  </div>
                  Relationship Path
                </h4>
                <button
                  onClick={() => setRelationshipNode(null)}
                  className="p-1 hover:bg-pampas rounded-lg transition-colors"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <Card className="border-crail/20 bg-crail/5 rounded-xl shadow-none">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-3xl">👤</span>
                    <p className="text-xs font-medium text-muted-foreground">
                      →
                    </p>
                    <span className="text-3xl">👤</span>
                    <p className="text-sm font-medium text-foreground mt-2">
                      {selectedNode.name} & {relationshipNode.name}
                    </p>
                    {hasDirectConnection ? (
                      <span className="text-xs bg-crail/10 text-crail font-medium px-3 py-1 rounded-full mt-2">
                        Direct connection
                      </span>
                    ) : (
                      <span className="text-xs bg-cloudy/10 text-cloudy font-medium px-3 py-1 rounded-full mt-2">
                        Indirect connection
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Separator className="bg-border" />
          </>
        )}

        {/* Statistics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm">Statistics</h4>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border bg-pampas rounded-xl shadow-none">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  Connections
                </p>
                <p className="text-2xl font-bold text-crail">
                  {connectedNodes.length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-pampas rounded-xl shadow-none">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  Network
                </p>
                <p className="text-2xl font-bold text-crail">
                  {graphData.nodes.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Connections */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-crail/10 flex items-center justify-center">
              <Users size={14} className="text-crail" />
            </div>
            Connected People
          </h4>
          {connectedNodes.length > 0 ? (
            <div className="space-y-2">
              {connectedNodes.map((node) => (
                <Card
                  key={node.id}
                  onClick={() => setRelationshipNode(node)}
                  className={`border rounded-xl shadow-none hover:bg-pampas/80 transition-colors cursor-pointer ${
                    relationshipNode?.id === node.id
                      ? "bg-crail/5 border-crail/30"
                      : "border-border bg-pampas"
                  }`}
                >
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {node.name}
                        </p>
                        {node.bio && (
                          <p className="text-xs text-muted-foreground truncate">
                            {node.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground bg-pampas rounded-xl p-3">
              No connections yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
