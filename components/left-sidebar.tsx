"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

interface LeftSidebarProps {
  onAddNode: (name: string, bio?: string) => void;
  onAddConnection: (source: string, target: string, strength?: number) => void;
}

export function LeftSidebar({ onAddNode, onAddConnection }: LeftSidebarProps) {
  const [nodeName, setNodeName] = useState("");
  const [nodeBio, setNodeBio] = useState("");

  const [sourceName, setSourceName] = useState("");
  const [targetName, setTargetName] = useState("");

  const handleAddNode = () => {
    if (nodeName.trim()) {
      onAddNode(nodeName, nodeBio || undefined);
      setNodeName("");
      setNodeBio("");
    }
  };

  const handleAddConnection = () => {
    if (sourceName.trim() && targetName.trim()) {
      onAddConnection(sourceName, targetName);
      setSourceName("");
      setTargetName("");
    }
  };

  return (
    <div className="w-80 bg-white border-r border-border overflow-y-auto flex flex-col shadow-sm">
      <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
        <TabsList className="w-full h-12 rounded-none border-b border-border bg-pampas p-0">
          <TabsTrigger
            value="nodes"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:bg-white data-[state=active]:border-crail data-[state=active]:text-crail data-[state=active]:shadow-sm transition-all"
          >
            People
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:bg-white data-[state=active]:border-crail data-[state=active]:text-crail data-[state=active]:shadow-sm transition-all"
          >
            Connections
          </TabsTrigger>
        </TabsList>

        {/* Add Node Tab */}
        <TabsContent value="nodes" className="flex-1 p-6 gap-4 flex flex-col">
          <Card className="border-border bg-pampas rounded-2xl shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground font-semibold">
                Add Person
              </CardTitle>
              <CardDescription className="text-xs">
                Create a new person in the network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-2">
                  Name *
                </label>
                <Input
                  placeholder="e.g., John Doe"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddNode()}
                  className="text-sm rounded-lg border-border bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-2">
                  Bio
                </label>
                <Input
                  placeholder="e.g., Software Engineer"
                  value={nodeBio}
                  onChange={(e) => setNodeBio(e.target.value)}
                  className="text-sm rounded-lg border-border bg-white"
                />
              </div>
              <Button
                onClick={handleAddNode}
                disabled={!nodeName.trim()}
                className="w-full bg-crail text-white rounded-lg hover:bg-crail/90 font-medium"
              >
                Add Person
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Connection Tab */}
        <TabsContent
          value="connections"
          className="flex-1 p-6 gap-4 flex flex-col"
        >
          <Card className="border-border bg-pampas rounded-2xl shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground font-semibold">
                Add Connection
              </CardTitle>
              <CardDescription className="text-xs">
                Connect two people in the network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-2">
                  From Person *
                </label>
                <Input
                  placeholder="e.g., Alice"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="text-sm rounded-lg border-border bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-2">
                  To Person *
                </label>
                <Input
                  placeholder="e.g., Bob"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="text-sm rounded-lg border-border bg-white"
                />
              </div>
              <Button
                onClick={handleAddConnection}
                disabled={!sourceName.trim() || !targetName.trim()}
                className="w-full bg-crail text-white rounded-lg hover:bg-crail/90 font-medium"
              >
                Create Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
