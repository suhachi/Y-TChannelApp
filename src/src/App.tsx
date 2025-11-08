import { Router, Route, Switch } from './lib/simple-router';
import { Layout } from '../components/Layout';
import { Home } from '../components/Home';
import { ApiKeySetup } from '../components/ApiKeySetup';
import { ChannelAnalysis } from '../components/ChannelAnalysis';
import { ChannelDetail } from '../components/ChannelDetail';
import { KeywordAnalysis } from '../components/KeywordAnalysis';
import { VideoDetail } from '../components/VideoDetail';
import { OpportunityFinder } from '../components/OpportunityFinder';
import { Toaster } from '../components/ui/sonner';
import { ErrorBoundary } from './components/alerts/ErrorBoundary';
import { KeyGuard } from './components/guards/KeyGuard';
import { ProGuard } from './components/guards/ProGuard';
import { useTelemetry } from './hooks/useTelemetry';

function App() {
  useTelemetry(); // Track page views

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/setup" component={ApiKeySetup} />
            
            {/* Protected routes - require API key */}
            <Route path="/channel/detail">
              <KeyGuard>
                <ChannelDetail />
              </KeyGuard>
            </Route>
            
            <Route path="/channel">
              <KeyGuard>
                <ChannelAnalysis />
              </KeyGuard>
            </Route>
            
            <Route path="/keyword">
              <KeyGuard>
                <KeywordAnalysis />
              </KeyGuard>
            </Route>
            
            <Route path="/video">
              <KeyGuard>
                <VideoDetail />
              </KeyGuard>
            </Route>
            
            {/* Pro routes - require API key + Pro tier */}
            <Route path="/opportunity">
              <KeyGuard>
                <ProGuard>
                  <OpportunityFinder />
                </ProGuard>
              </KeyGuard>
            </Route>
            
            {/* 404 */}
            <Route>
              <div className="text-center py-12">
                <h1 className="text-2xl mb-4">404 - 페이지를 찾을 수 없습니다</h1>
                <p className="text-muted-foreground">
                  요청하신 페이지가 존재하지 않습니다.
                </p>
              </div>
            </Route>
          </Switch>
        </Layout>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
