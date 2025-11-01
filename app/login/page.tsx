"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    // Save to localStorage
    localStorage.setItem("userName", name.trim());
    router.push("/");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-pampas">
      <Card className="w-full max-w-md border-border bg-white rounded-2xl shadow-lg">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-crail/10 flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-crail" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome to Network Graph
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your name to view and manage your connections
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-border bg-pampas"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-crail hover:bg-crail/90 text-white rounded-xl"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
