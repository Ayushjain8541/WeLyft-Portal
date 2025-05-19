import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // After first load, set initialLoad to false
    if (!isLoading) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  if (initialLoad) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">LogiDash</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Welcome to LogiDash</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Streamline your delivery operations with our comprehensive delivery management platform.
            </p>
          </div>
          <div className="space-y-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-center text-gray-700 dark:text-gray-300">
                  Welcome back, {user?.name || "User"}!
                </p>
                <Button className="w-full" asChild>
                  <Link href={user?.role === "admin" ? "/dashboard" : "/driver/orders"}>
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <Button className="w-full" asChild>
                <Link href="/login">Login to get started</Link>
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Efficient delivery management solution for your business
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
