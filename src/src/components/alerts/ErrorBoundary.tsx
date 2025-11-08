import { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

// Native SVG icons
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
  </svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" d="M21 2v6h-6M3 22v-6h6M21 8A10 10 0 0 0 5.93 5.93M3 16a10 10 0 0 0 15.07 2.07" />
  </svg>
);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md border-red-500/30 bg-red-500/5">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle>오류가 발생했습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.
              </p>
              {this.state.error && (
                <pre className="p-3 bg-background rounded text-xs overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[#ef4444] hover:bg-[#dc2626]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                페이지 새로고침
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
