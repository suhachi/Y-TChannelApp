/**
 * Route configuration for YouTube Channel Consultant
 * Following the atomic step-wise structure
 */

export const routes = {
  // Public routes
  home: '/',
  
  // Setup routes
  setup: '/setup',
  
  // Analysis routes (requires API key)
  channelAnalysis: '/channel',
  keywordAnalysis: '/keyword',
  
  // Opportunity routes (requires Pro tier)
  opportunityFinder: '/opportunity',
  risingStars: '/opportunity/rising',
  blueOcean: '/opportunity/blue-ocean',
  
  // Report routes
  report: '/report/:type',
} as const;

export type RoutePath = typeof routes[keyof typeof routes];
