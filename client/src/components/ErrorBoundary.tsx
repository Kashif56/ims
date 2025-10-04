import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
          <Card className="w-full max-w-2xl shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <AlertTriangle className="h-24 w-24 text-red-600 animate-pulse" />
                  <div className="absolute inset-0 h-24 w-24 text-red-600 opacity-20 animate-ping">
                    <AlertTriangle className="h-24 w-24" />
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Oops! Something went wrong
                </h1>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Application Error
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  We encountered an unexpected error. Don't worry, your data is safe. 
                  Please try refreshing the page or return to the homepage.
                </p>

                {this.state.error && (
                  <details className="mb-6 w-full max-w-md">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2">
                      View error details
                    </summary>
                    <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                      <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                        {this.state.error.toString()}
                      </p>
                      {this.state.error.stack && (
                        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md">
                  <Button 
                    size="lg" 
                    onClick={this.handleRefresh}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="w-full sm:w-auto"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    If this problem persists, please contact support with the error details above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
