/**
 * Simple hash-based router to replace wouter
 * No external dependencies, just uses browser hash navigation
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  path: '/',
  navigate: () => {},
});

export function Router({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      setPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newPath: string) => {
    window.location.hash = newPath;
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useLocation(): [string, (path: string) => void] {
  const { path, navigate } = useContext(RouterContext);
  return [path, navigate];
}

export function useRouter() {
  return useContext(RouterContext);
}

export function Link({ 
  href, 
  children, 
  className 
}: { 
  href: string; 
  children: ReactNode; 
  className?: string;
}) {
  const { navigate } = useContext(RouterContext);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={`#${href}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

interface RouteProps {
  path?: string;
  component?: React.ComponentType;
  children?: ReactNode;
}

export function Route({ path: routePath, component: Component, children }: RouteProps) {
  const { path } = useContext(RouterContext);

  // If no routePath specified, it's a catch-all (404) route
  if (!routePath) {
    return <>{children}</>;
  }

  // Simple path matching
  const matches = path === routePath || path.startsWith(routePath + '/');

  if (!matches) return null;

  if (Component) {
    return <Component />;
  }

  return <>{children}</>;
}

export function Switch({ children }: { children: ReactNode }) {
  const { path } = useContext(RouterContext);
  
  // Find the first matching route
  const childrenArray = Array.isArray(children) ? children : [children];
  
  for (const child of childrenArray) {
    if (!child || typeof child !== 'object') continue;
    
    const routePath = (child as any).props?.path;
    
    // Catch-all route (no path specified)
    if (!routePath) {
      return child;
    }
    
    // Check if route matches
    if (path === routePath || path.startsWith(routePath + '/')) {
      return child;
    }
  }
  
  // If no route matched, return the catch-all (last route without path)
  const catchAll = childrenArray.find(child => 
    child && typeof child === 'object' && !(child as any).props?.path
  );
  
  return catchAll || null;
}

export function Redirect({ to }: { to: string }) {
  const { navigate } = useContext(RouterContext);
  
  useEffect(() => {
    navigate(to);
  }, [to, navigate]);
  
  return null;
}
