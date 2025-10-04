import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServerCrash, Home, RefreshCw } from "lucide-react";

export default function Error500() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-lg mx-4 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ServerCrash className="h-24 w-24 text-red-600 animate-bounce" />
              <div className="absolute inset-0 h-24 w-24 text-red-600 opacity-20 animate-ping">
                <ServerCrash className="h-24 w-24" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Internal Server Error
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Oops! Something went wrong on our end. We're working to fix the issue. 
            Please try refreshing the page or come back later.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              onClick={handleRefresh}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If the problem persists, please contact our support team.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Error Code: 500 | Server Error
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
