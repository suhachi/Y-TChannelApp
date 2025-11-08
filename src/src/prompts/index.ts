/**
 * AI Prompt Templates
 * Data-driven prompts with evidence binding
 */

import type { ChannelDashboard, KeywordSummary, BlueOceanMetrics } from '../types';

export const prompts = {
  competition: (data: ChannelDashboard) => buildCompetitionPrompt(data),
  growth: (data: ChannelDashboard) => buildGrowthPrompt(data),
  diagnosis: (data: ChannelDashboard) => buildDiagnosisPrompt(data),
  keyword: (data: KeywordSummary) => buildKeywordPrompt(data),
  blueOcean: (data: BlueOceanMetrics) => buildBlueOceanPrompt(data),
};

function buildCompetitionPrompt(data: ChannelDashboard): string {
  const { core, videos, metrics } = data;
  const topVideos = videos
    .sort((a, b) => b.stats.views - a.stats.views)
    .slice(0, 10)
    .map((v, i) => `${i + 1}. "${v.title}" (${v.stats.views.toLocaleString()} views)`)
    .join('\n');

  return `Analyze this YouTube channel and provide competitive strategy:

Channel: ${core.title}
Subscribers: ${core.stats.subscribers.toLocaleString()}
Total Videos: ${core.stats.videoCount}
Shorts Ratio: ${(metrics.shortsRatio * 100).toFixed(1)}%

Top 10 Videos:
${topVideos}

Average Views: ${Math.round(videos.reduce((s, v) => s + v.stats.views, 0) / videos.length).toLocaleString()}
Pareto (Top 20%): ${(metrics.topParetoShare * 100).toFixed(1)}% of total views

Provide:
1. Content format recommendations (Shorts vs Long-form)
2. Optimal video length based on data
3. Upload schedule suggestion
4. Title templates with character count
5. Monetization opportunities

All recommendations must cite specific data points from above.`;
}

function buildGrowthPrompt(data: ChannelDashboard): string {
  const { core, videos } = data;
  const sorted = [...videos].sort((a, b) => 
    new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const third = Math.floor(sorted.length / 3);
  const phases = [
    { name: 'Early', videos: sorted.slice(0, third) },
    { name: 'Mid', videos: sorted.slice(third, third * 2) },
    { name: 'Recent', videos: sorted.slice(third * 2) },
  ];

  const phaseStats = phases.map(p => {
    const avgViews = p.videos.reduce((s, v) => s + v.stats.views, 0) / p.videos.length;
    return `${p.name}: ${avgViews.toLocaleString()} avg views (${p.videos.length} videos)`;
  }).join('\n');

  return `Analyze growth phases for: ${core.title}

${phaseStats}

Identify:
1. Key growth drivers in each phase
2. Success patterns and inflection points
3. Next cycle hypothesis (next 3-6 months)
4. Sustainable growth recommendations

Base all insights on quantitative data.`;
}

function buildDiagnosisPrompt(data: ChannelDashboard): string {
  const { core, videos, metrics } = data;
  const avgEngagement = videos.reduce((s, v) => 
    s + ((v.stats.likes + v.stats.comments) / (v.stats.views || 1)), 0
  ) / videos.length;

  return `Diagnostic report for: ${core.title}

Metrics:
- Videos: ${videos.length}
- Upload Consistency: ${(videos.length / 90).toFixed(1)} per week (last 90 days)
- Format Mix: ${(metrics.shortsRatio * 100).toFixed(1)}% Shorts
- Avg Engagement: ${(avgEngagement * 100).toFixed(3)}%
- Subscriber Conversion: ${((core.stats.subscribers / core.stats.views) * 100).toFixed(2)}%

Provide:
1. Content Health Score (0-100)
2. Short-term actions (next 30 days)
3. Long-term strategy (3-6 months)
4. KPI targets with benchmarks

Evidence-based only.`;
}

function buildKeywordPrompt(data: KeywordSummary): string {
  const { query, videos, topChannels, formatMix } = data;
  const competition = topChannels.length < 5 ? 'Low' : topChannels.length < 10 ? 'Medium' : 'High';
  const avgViews = videos.reduce((s, v) => s + v.stats.views, 0) / videos.length;

  return `Keyword strategy for: "${query}"

Market Data:
- Sample Size: ${videos.length} videos
- Competition: ${competition}
- Average Views: ${avgViews.toLocaleString()}
- Format Split: ${(formatMix.shortsPct * 100).toFixed(1)}% Shorts, ${(formatMix.longPct * 100).toFixed(1)}% Long

Top Channels: ${topChannels.length} channels dominate

Provide:
1. Format strategy (Shorts-first vs Long-form primary)
2. Optimal video length recommendation
3. Upload frequency for authority building
4. 4 title templates specific to this keyword
5. Thumbnail concepts
6. Weekly content calendar

All must reference the data above.`;
}

function buildBlueOceanPrompt(data: BlueOceanMetrics): string {
  const { query, viewMean, viewMedian, concentrationRatio, activity, verdict } = data;

  return `Blue Ocean analysis for: "${query}"

Verdict: ${verdict}

Metrics:
- Mean Views: ${viewMean.toLocaleString()}
- Median Views: ${viewMedian.toLocaleString()}
- Distribution: ${(viewMedian / viewMean * 100).toFixed(1)}% (${viewMedian / viewMean > 0.7 ? 'Distributed' : 'Winner-takes-all'})
- Concentration: ${(concentrationRatio * 100).toFixed(1)}% (${concentrationRatio > 0.5 ? 'Fragmented' : 'Monopolized'})
- Upload Interval: ${activity.avgUploadIntervalDays.toFixed(1)} days avg
- Latest Upload: ${activity.latestUploadDaysAgo} days ago

Provide:
${verdict === 'BLUE' ? `
1. Entry strategy for blue ocean opportunity
2. Quick-start action plan (first 5-10 videos)
3. Differentiation approach
4. Niche-down long-tail variations
` : `
1. Survival strategy in red ocean
2. Niche-down opportunities
3. Quality-over-quantity approach
4. Alternative keyword pivots
`}
5. 10 specific content ideas

Reference metrics in recommendations.`;
}

export default prompts;
