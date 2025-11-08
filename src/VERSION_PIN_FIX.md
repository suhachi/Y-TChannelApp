# Version Pinning Fix for ESM.SH Dependency Issue

## Problem
Build was failing with lucide-react@0.552.0 fetch errors from esm.sh CDN, even though no code directly imports lucide-react.

## Root Cause
The esm.sh CDN was incorrectly resolving dependencies for unversioned package imports, causing it to try to fetch lucide-react as a transitive dependency of wouter or recharts.

## Solution
Version-pinned all wouter and recharts imports to force esm.sh to use specific, known-good versions:

### Wouter: Pinned to v3.3.5
Updated in the following files:
1. ✅ `/src/App.tsx`
2. ✅ `/components/Layout.tsx`
3. ✅ `/components/ChannelAnalysis.tsx`
4. ✅ `/components/KeywordAnalysis.tsx`
5. ✅ `/components/OpportunityFinder.tsx`
6. ✅ `/components/Home.tsx`
7. ✅ `/components/VideoDetail.tsx`
8. ✅ `/components/ChannelDetail.tsx`
9. ✅ `/src/hooks/useTelemetry.ts`
10. ✅ `/src/components/guards/KeyGuard.tsx`
11. ✅ `/src/components/guards/ProGuard.tsx`

### Recharts: Pinned to v2.12.7
Updated in the following files:
1. ✅ `/src/components/channel/ParetoChart.tsx`
2. ✅ `/components/ui/chart.tsx`

## Import Pattern

### Before (Unversioned)
```tsx
import { Route, Switch } from 'wouter';
import { BarChart } from 'recharts';
```

### After (Version-Pinned)
```tsx
import { Route, Switch } from 'wouter@3.3.5';
import { BarChart } from 'recharts@2.12.7';
```

## Why This Works

1. **Explicit Version Control**: By specifying exact versions, we force esm.sh to use a specific cached build
2. **Avoid CDN Resolution Issues**: esm.sh's automatic dependency resolution for unversioned imports was causing incorrect transitive dependencies
3. **Consistent Builds**: Version pinning ensures all builds use the exact same package versions

## Verification

All wouter and recharts imports now explicitly specify versions:
- ✅ wouter@3.3.5 (11 files)
- ✅ recharts@2.12.7 (2 files)
- ✅ No unversioned wouter or recharts imports remain

## Other Version-Pinned Packages

Per Figma Make guidelines, the following package already uses version pinning:
- ✅ react-hook-form@7.55.0 (in `/components/ui/form.tsx`)

## No Longer Using

These packages were removed entirely and replaced with native implementations:
- ❌ lucide-react (replaced with native SVG icons in `/src/components/icons.tsx`)
- ❌ sonner@2.0.3 (replaced with native toast in `/components/ui/sonner.tsx`)
- ❌ clsx (removed)
- ❌ tailwind-merge (removed)

## Build Status

The build should now succeed without lucide-react fetch errors from esm.sh.
