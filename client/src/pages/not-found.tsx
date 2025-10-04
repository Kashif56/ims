import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-lg mx-4 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <AlertCircle className="h-24 w-24 text-red-500 animate-pulse" />
              <div className="absolute inset-0 h-24 w-24 text-red-500 opacity-20 animate-ping">
                <AlertCircle className="h-24 w-24" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page Not Found
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Please check the URL or return to the homepage.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact support or visit our{" "}
              <Link href="/dashboard">
                <a className="text-primary hover:underline">dashboard</a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
