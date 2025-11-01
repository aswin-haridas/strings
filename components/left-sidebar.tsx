"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { PanelLeft, PanelLeftClose, User } from "lucide-react";
import type { User as UserType } from "@/app/page";

interface LeftSidebarProps {
  onAddNode: (name: string, bio?: string) => void;
  onAddConnection: (target: string, strength?: number, type?: string) => void;
  currentUser: UserType;
}

const CONNECTION_TYPES = [
  { value: "", label: "Select type..." },
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family" },
  { value: "cousin", label: "Cousin" },
  { value: "sibling", label: "Sibling" },
  { value: "parent", label: "Parent" },
  { value: "colleague", label: "Colleague" },
  { value: "acquaintance", label: "Acquaintance" },
  { value: "other", label: "Other" },
];

export function LeftSidebar({
  onAddNode,
  onAddConnection,
  currentUser,
}: LeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [connectionType, setConnectionType] = useState("");

  const handleAddNode = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;

    if (name?.trim()) {
      onAddNode(name, bio || undefined);
      // Reset form
      const form = document.getElementById(
        "add-person-form"
      ) as HTMLFormElement;
      form?.reset();
    }
  };

  const handleAddConnection = async (formData: FormData) => {
    const target = formData.get("target") as string;

    if (target?.trim()) {
      onAddConnection(target, 1, connectionType || undefined);
      // Reset form
      const form = document.getElementById(
        "add-connection-form"
      ) as HTMLFormElement;
      form?.reset();
      setConnectionType("");
    }
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-12" : "w-80"
      } bg-white border-r border-border overflow-y-auto flex flex-col shadow-sm transition-all duration-300`}
    >
      {/* Header with toggle button */}
      <div className="h-12 border-b border-border bg-pampas flex items-center justify-between px-2">
        {!isCollapsed && (
          <span className="text-sm font-medium text-foreground italic">
            Strings_
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-full border border-border bg-white shadow-sm hover:bg-pampas transition-colors flex items-center justify-center ml-auto"
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 p-6 gap-6 flex flex-col overflow-y-auto">
          {/* Current User Card */}
          <div className="border border-border bg-crail/5 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-crail/10 flex items-center justify-center">
                <User size={20} className="text-crail" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">
                  Logged in as
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentUser.name}
                </p>
              </div>
            </div>
          </div>

          {/* Add Connection Form */}
          <form
            id="add-connection-form"
            action={handleAddConnection}
            className="border border-border bg-pampas rounded-2xl p-6 space-y-4"
          >
            <div>
              <h3 className="text-base text-foreground font-semibold mb-1">
                Add Connection
              </h3>
              <p className="text-xs text-muted-foreground">
                Connect to a person (creates if doesn't exist)
              </p>
            </div>

            <div>
              <label
                htmlFor="connection-target"
                className="text-xs font-medium text-foreground block mb-2"
              >
                Person Name *
              </label>
              <Input
                id="connection-target"
                name="target"
                placeholder="e.g., Bob"
                required
                className="text-sm rounded-lg border-border bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="connection-type"
                className="text-xs font-medium text-foreground block mb-2"
              >
                Connection Type
              </label>
              <Dropdown
                options={CONNECTION_TYPES}
                value={connectionType}
                onChange={setConnectionType}
                placeholder="Select type..."
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-crail text-white rounded-full hover:bg-crail/90 font-medium"
            >
              Add Connection
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
