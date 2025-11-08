# 🤖 GPT (OpenAI API) 연동 완벽 가이드

> YouTube 채널 분석 서비스에 OpenAI GPT를 연동하여 진짜 AI 인사이트를 생성하세요!

---

## 📋 목차

1. [GPT 연동이 가능한 이유](#1-gpt-연동이-가능한-이유)
2. [OpenAI API 키 발급](#2-openai-api-키-발급)
3. [GPT 연동 구현](#3-gpt-연동-구현)
4. [프롬프트 최적화](#4-프롬프트-최적화)
5. [비용 관리](#5-비용-관리)
6. [배포 및 보안](#6-배포-및-보안)
7. [고급 기능](#7-고급-기능)

---

## 1. GPT 연동이 가능한 이유

### 1-1. 현재 프로젝트 상태 분석

**✅ 이미 구축된 것들:**

```
✓ AI 서비스 인터페이스 (services/ai.ts)
✓ 프롬프트 템플릿 (src/prompts/index.ts)
✓ 타입 정의 (types/index.ts)
✓ API 키 관리 시스템 (hooks/useApiKey.ts)
```

**🔄 변경이 필요한 것:**

```
services/ai.ts의 시뮬레이션 응답
  → OpenAI API 실제 호출로 교체
```

### 1-2. GPT 연동 아키텍처

```
사용자 입력 (채널 분석 요청)
    ↓
YouTube API로 데이터 수집
    ↓
데이터 가공 (src/lib/aggregate.ts)
    ↓
프롬프트 생성 (src/prompts/index.ts)
    ↓
OpenAI API 호출 ← 🆕 여기를 추가!
    ↓
GPT 응답을 UI에 표시
```

### 1-3. 연동 후 가능한 기능들

**채널 분석 AI 리포트:**
- 맞춤형 성장 전략
- 경쟁사 분석
- 콘텐츠 최적화 제안

**키워드 AI 인사이트:**
- 시장 기회 분석
- 제목/썸네일 제안
- 콘텐츠 캘린더 생성

**영상 AI 요약:**
- 자동 스크립트 분석
- SEO 최적화 제안
- 타겟 오디언스 분석

---

## 2. OpenAI API 키 발급

### 2-1. OpenAI 계정 생성

**단계:**

1. **OpenAI 웹사이트 방문**
   ```
   https://platform.openai.com
   ```

2. **회원가입**
   - "Sign up" 클릭
   - 이메일 또는 Google 계정으로 가입
   - 전화번호 인증 (필수)

3. **결제 정보 등록** (중요!)
   - Billing → Payment methods
   - 신용카드 등록 (사용한 만큼만 과금)
   - 최소 $5부터 시작 가능

### 2-2. API 키 생성

```
1. Dashboard → API Keys
2. "Create new secret key" 클릭
3. 키 이름 입력: "YouTube-Consultant"
4. 생성된 키 복사 (⚠️ 한 번만 표시됨!)
   예시: sk-proj-abc123...xyz789
5. 안전한 곳에 저장
```

### 2-3. 사용량 제한 설정 (권장)

```
1. Billing → Usage limits
2. Hard limit 설정: $10/month (초과 시 자동 차단)
3. Email notifications 활성화
4. 저장
```

### 2-4. 가격 확인

**GPT-4o (권장 모델):**
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens

**GPT-3.5-turbo (저렴한 대안):**
- Input: $0.50 / 1M tokens
- Output: $1.50 / 1M tokens

**예상 비용:**
- 채널 분석 1회: 약 $0.01-0.05
- 월 100회 분석: 약 $1-5

---

## 3. GPT 연동 구현

### 3-1. OpenAI API 키 관리

#### Step 1: API 키 저장 구조 확장

```typescript
// hooks/useApiKey.ts 수정

export function useApiKey() {
  const [youtubeApiKey, setYoutubeApiKey] = useState<string>('');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 두 키 모두 불러오기
    const savedYoutubeKey = storage.get('youtube_api_key');
    const savedOpenAIKey = storage.get('openai_api_key');
    
    if (savedYoutubeKey) setYoutubeApiKey(savedYoutubeKey);
    if (savedOpenAIKey) setOpenaiApiKey(savedOpenAIKey);
    
    setIsLoading(false);
  }, []);

  const saveYoutubeApiKey = (key: string) => {
    storage.set('youtube_api_key', key);
    setYoutubeApiKey(key);
  };

  const saveOpenAIApiKey = (key: string) => {
    storage.set('openai_api_key', key);
    setOpenaiApiKey(key);
  };

  const clearAllKeys = () => {
    storage.remove('youtube_api_key');
    storage.remove('openai_api_key');
    setYoutubeApiKey('');
    setOpenaiApiKey('');
  };

  return {
    youtubeApiKey,
    openaiApiKey,
    isLoading,
    saveYoutubeApiKey,
    saveOpenAIApiKey,
    clearAllKeys,
    hasYoutubeKey: !!youtubeApiKey,
    hasOpenAIKey: !!openaiApiKey,
  };
}
```

#### Step 2: API 키 설정 UI 업데이트

```typescript
// components/ApiKeySetup.tsx에 OpenAI 키 입력 추가

export function ApiKeySetup() {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const { saveYoutubeApiKey, saveOpenAIApiKey } = useApiKey();

  const handleSave = () => {
    if (youtubeKey) {
      saveYoutubeApiKey(youtubeKey);
      toast.success('YouTube API 키 저장 완료');
    }
    
    if (openaiKey) {
      saveOpenAIApiKey(openaiKey);
      toast.success('OpenAI API 키 저장 완료');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl">API 키 설정</h1>

      {/* YouTube API 키 섹션 */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl mb-4">YouTube Data API v3</h2>
        <input
          type="password"
          value={youtubeKey}
          onChange={(e) => setYoutubeKey(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 
                     rounded-lg focus:border-red-500"
        />
        <p className="text-sm text-gray-400 mt-2">
          채널 분석 및 데이터 수집에 필요합니다
        </p>
      </div>

      {/* OpenAI API 키 섹션 */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl mb-4">OpenAI API (GPT)</h2>
        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-proj-..."
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 
                     rounded-lg focus:border-red-500"
        />
        <p className="text-sm text-gray-400 mt-2">
          AI 인사이트 및 전략 분석에 필요합니다 (선택사항)
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-red-600 text-white py-3 rounded-lg
                   hover:bg-red-700"
      >
        저장
      </button>
    </div>
  );
}
```

### 3-2. OpenAI API 호출 구현

#### Step 1: OpenAI 서비스 파일 생성

```typescript
// services/openai.ts 생성

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * GPT에게 메시지 전송
   */
  async chat(
    messages: OpenAIMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const {
      model = 'gpt-4o',  // 또는 'gpt-3.5-turbo'
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    const request: OpenAIRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API 호출 실패');
      }

      const data: OpenAIResponse = await response.json();

      // 토큰 사용량 로깅 (선택사항)
      console.log('토큰 사용:', data.usage);

      return data.choices[0].message.content;

    } catch (error: any) {
      console.error('OpenAI API 에러:', error);
      throw new Error(error.message || 'AI 분석 실패');
    }
  }

  /**
   * 시스템 프롬프트와 사용자 입력으로 간단하게 호출
   */
  async generate(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return this.chat(messages, options);
  }
}

export function createOpenAIService(apiKey: string): OpenAIService {
  return new OpenAIService(apiKey);
}
```

### 3-3. AI 서비스 실제 구현으로 교체

```typescript
// services/ai.ts 수정

import { createOpenAIService } from './openai';
import prompts from '../src/prompts';
import type { ChannelDashboard, VideoCore, KeywordSummary, BlueOceanMetrics } from '../types';

export class AIService {
  private openaiService: any;

  constructor(openaiApiKey?: string) {
    if (openaiApiKey) {
      this.openaiService = createOpenAIService(openaiApiKey);
    }
  }

  /**
   * 경쟁 전략 분석
   */
  async generateCompetitionStrategy(
    dashboard: ChannelDashboard,
    useAI: boolean = false
  ): Promise<string> {
    // AI 모드
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 YouTube 채널 성장 전문가입니다. 
데이터 기반으로 구체적이고 실행 가능한 전략을 제시하세요.
모든 제안은 제공된 데이터를 인용해야 합니다.`;

      const userPrompt = prompts.competition(dashboard);

      try {
        const response = await this.openaiService.generate(
          systemPrompt,
          userPrompt,
          { temperature: 0.7, maxTokens: 2000 }
        );

        return response;
      } catch (error) {
        console.error('AI 분석 실패, 기본 분석 사용:', error);
        // AI 실패 시 기존 시뮬레이션으로 폴백
        return this.generateCompetitionStrategySimulated(dashboard);
      }
    }

    // 시뮬레이션 모드 (기존 로직)
    return this.generateCompetitionStrategySimulated(dashboard);
  }

  /**
   * 성장 단계 분석
   */
  async generateGrowthPhases(
    dashboard: ChannelDashboard,
    useAI: boolean = false
  ): Promise<string> {
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 데이터 분석가입니다. 
채널의 성장 패턴을 분석하고 향후 예측을 제공하세요.`;

      const userPrompt = prompts.growth(dashboard);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error) {
        return this.generateGrowthPhasesSimulated(dashboard);
      }
    }

    return this.generateGrowthPhasesSimulated(dashboard);
  }

  /**
   * 채널 진단
   */
  async generateDiagnosis(
    dashboard: ChannelDashboard,
    useAI: boolean = false
  ): Promise<string> {
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 YouTube 컨설턴트입니다. 
채널의 강점과 약점을 진단하고 개선 방안을 제시하세요.`;

      const userPrompt = prompts.diagnosis(dashboard);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error) {
        return this.generateDiagnosisSimulated(dashboard);
      }
    }

    return this.generateDiagnosisSimulated(dashboard);
  }

  /**
   * 키워드 전략
   */
  async generateKeywordStrategy(
    summary: KeywordSummary,
    useAI: boolean = false
  ): Promise<string> {
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 YouTube SEO 전문가입니다. 
키워드 데이터를 분석하여 콘텐츠 전략을 제안하세요.`;

      const userPrompt = prompts.keyword(summary);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error) {
        return this.generateKeywordStrategySimulated(summary);
      }
    }

    return this.generateKeywordStrategySimulated(summary);
  }

  /**
   * 블루오션 분석
   */
  async generateBlueOceanAnalysis(
    metrics: BlueOceanMetrics,
    useAI: boolean = false
  ): Promise<string> {
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 시장 분석 전문가입니다. 
블루오션/레드오션을 판단하고 진입 전략을 제시하세요.`;

      const userPrompt = prompts.blueOcean(metrics);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error) {
        return this.generateBlueOceanAnalysisSimulated(metrics);
      }
    }

    return this.generateBlueOceanAnalysisSimulated(metrics);
  }

  // 기존 시뮬레이션 메서드들 이름 변경
  private generateCompetitionStrategySimulated(dashboard: ChannelDashboard): string {
    // 기존 코드 그대로...
    const { core, videos, metrics } = dashboard;
    // ... (기존 로직)
  }

  private generateGrowthPhasesSimulated(dashboard: ChannelDashboard): string {
    // 기존 코드...
  }

  private generateDiagnosisSimulated(dashboard: ChannelDashboard): string {
    // 기존 코드...
  }

  private generateKeywordStrategySimulated(summary: KeywordSummary): string {
    // 기존 코드...
  }

  private generateBlueOceanAnalysisSimulated(metrics: BlueOceanMetrics): string {
    // 기존 코드...
  }
}

// 팩토리 함수
export function createAIService(openaiApiKey?: string): AIService {
  return new AIService(openaiApiKey);
}

export const aiService = new AIService(); // 기본 인스턴스 (시뮬레이션 모드)
```

### 3-4. UI에서 AI 사용

```typescript
// components/ChannelDetail.tsx 수정

import { useApiKey } from '../hooks/useApiKey';
import { createAIService } from '../services/ai';

export function ChannelDetail() {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { openaiApiKey } = useApiKey();
  
  const generateAIInsight = async () => {
    if (!channelData) return;

    setIsGenerating(true);

    try {
      // OpenAI 키가 있으면 AI 사용, 없으면 시뮬레이션
      const aiService = createAIService(openaiApiKey);
      const useAI = !!openaiApiKey;

      const insight = await aiService.generateCompetitionStrategy(
        channelData,
        useAI
      );

      setAiInsight(insight);
      
      if (useAI) {
        toast.success('AI 분석 완료!');
      } else {
        toast.info('시뮬레이션 분석 (OpenAI 키를 추가하면 실제 AI 분석)');
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 기존 채널 정보 */}
      
      {/* AI 인사이트 버튼 */}
      <button
        onClick={generateAIInsight}
        disabled={isGenerating}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600
                   text-white rounded-lg hover:from-purple-700 hover:to-blue-700
                   disabled:opacity-50"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white 
                            border-t-transparent rounded-full" />
            AI 분석 중...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🤖 AI 인사이트 생성
            {!openaiApiKey && ' (시뮬레이션)'}
          </span>
        )}
      </button>

      {/* AI 인사이트 표시 */}
      {aiInsight && (
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 
                        rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            🤖 AI 전략 분석
            {openaiApiKey && (
              <span className="text-xs bg-green-600 px-2 py-1 rounded">
                Powered by GPT
              </span>
            )}
          </h3>
          
          {/* Markdown 렌더링 */}
          <div className="prose prose-invert max-w-none">
            {aiInsight.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. 프롬프트 최적화

### 4-1. 효과적인 프롬프트 작성 원칙

```typescript
// src/prompts/index.ts 개선

function buildCompetitionPrompt(data: ChannelDashboard): string {
  const { core, videos, metrics } = data;
  
  // 데이터 요약
  const topVideos = videos
    .sort((a, b) => b.stats.views - a.stats.views)
    .slice(0, 10)
    .map((v, i) => `${i + 1}. "${v.title}" (${v.stats.views.toLocaleString()} views)`)
    .join('\n');

  const avgViews = Math.round(
    videos.reduce((s, v) => s + v.stats.views, 0) / videos.length
  );

  return `당신은 10년 경력의 YouTube 채널 성장 전문가입니다.

# 채널 데이터

**채널명**: ${core.title}
**구독자**: ${core.stats.subscribers.toLocaleString()}
**총 영상 수**: ${core.stats.videoCount}
**총 조회수**: ${core.stats.views.toLocaleString()}

## 콘텐츠 분석
- 쇼츠 비율: ${(metrics.shortsRatio * 100).toFixed(1)}%
- 평균 조회수: ${avgViews.toLocaleString()}
- 파레토 (상위 20%): 전체 조회수의 ${(metrics.topParetoShare * 100).toFixed(1)}%
- 평균 영상 길이: ${Math.floor(metrics.avgDuration / 60)}분

## 인기 영상 TOP 10
${topVideos}

# 요청사항

다음 형식으로 **구체적이고 실행 가능한** 전략을 작성하세요:

## 1. 콘텐츠 형식 전략
- 현재 데이터 기반 분석
- 쇼츠 vs 롱폼 비율 최적화 방안
- 구체적 수치 제시

## 2. 최적 영상 길이
- 데이터 기반 권장 길이
- 이유와 근거

## 3. 업로드 스케줄
- 주간 업로드 빈도
- 요일별 전략

## 4. 제목 템플릿
- 3가지 검증된 템플릿
- 각 템플릿별 사용 시나리오

## 5. 수익화 전략
- 현재 규모에서 가능한 3가지 수익원
- 각각의 예상 수익

모든 제안은 위에 제공된 데이터를 **반드시 인용**하세요.
추측이나 일반론은 피하고, 이 채널만의 맞춤 전략을 제시하세요.`;
}
```

### 4-2. Temperature 설정 가이드

```typescript
// 각 기능별 최적 temperature

const temperatureSettings = {
  // 창의적 아이디어: 0.8-1.0
  contentIdeas: 0.9,
  titleGeneration: 0.8,
  
  // 균형잡힌 분석: 0.6-0.8
  strategyAnalysis: 0.7,
  competitionAnalysis: 0.7,
  
  // 데이터 기반 정확성: 0.3-0.5
  diagnosis: 0.5,
  statistics: 0.3,
};
```

### 4-3. Token 사용 최적화

```typescript
// 비용 절감을 위한 토큰 관리

function optimizePrompt(fullPrompt: string, maxTokens: number = 4000): string {
  // 1. 불필요한 공백 제거
  let optimized = fullPrompt.replace(/\n\s*\n/g, '\n');
  
  // 2. 토큰 추정 (대략 1 token = 4 characters)
  const estimatedTokens = optimized.length / 4;
  
  // 3. 초과 시 요약
  if (estimatedTokens > maxTokens) {
    // 영상 목록 축소 등
    optimized = optimized.substring(0, maxTokens * 4);
  }
  
  return optimized;
}
```

---

## 5. 비용 관리

### 5-1. 토큰 계산기

```typescript
// src/lib/token-calculator.ts

export function estimateTokens(text: string): number {
  // 간단한 추정: 영문 4글자 = 1 token, 한글 2글자 = 1 token
  const englishChars = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const otherChars = text.length - englishChars - koreanChars;
  
  return Math.ceil(
    englishChars / 4 + 
    koreanChars / 2 + 
    otherChars / 3
  );
}

export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: 'gpt-4o' | 'gpt-3.5-turbo' = 'gpt-4o'
): number {
  const pricing = {
    'gpt-4o': {
      input: 2.50 / 1_000_000,
      output: 10.00 / 1_000_000,
    },
    'gpt-3.5-turbo': {
      input: 0.50 / 1_000_000,
      output: 1.50 / 1_000_000,
    },
  };

  const price = pricing[model];
  return (inputTokens * price.input) + (outputTokens * price.output);
}

// 사용 예시
const prompt = "분석할 데이터...";
const tokens = estimateTokens(prompt);
const cost = estimateCost(tokens, 2000, 'gpt-4o');
console.log(`예상 비용: $${cost.toFixed(4)}`);
```

### 5-2. 캐싱 전략

```typescript
// src/lib/ai-cache.ts

interface CacheEntry {
  prompt: string;
  response: string;
  timestamp: number;
  cost: number;
}

class AICache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge = 24 * 60 * 60 * 1000; // 24시간

  // 프롬프트 해시 생성
  private hash(prompt: string): string {
    // 간단한 해시 (프로덕션에서는 crypto 사용)
    return btoa(prompt.substring(0, 100));
  }

  // 캐시 조회
  get(prompt: string): string | null {
    const key = this.hash(prompt);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // 만료 확인
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    console.log('캐시 히트! 비용 절감:', entry.cost);
    return entry.response;
  }

  // 캐시 저장
  set(prompt: string, response: string, cost: number): void {
    const key = this.hash(prompt);
    this.cache.set(key, {
      prompt,
      response,
      timestamp: Date.now(),
      cost,
    });
  }

  // 통계
  getStats(): { hits: number; totalSaved: number } {
    let totalSaved = 0;
    this.cache.forEach((entry) => {
      totalSaved += entry.cost;
    });

    return {
      hits: this.cache.size,
      totalSaved,
    };
  }
}

export const aiCache = new AICache();
```

```typescript
// services/ai.ts에 캐싱 적용

import { aiCache } from '../src/lib/ai-cache';

async generateCompetitionStrategy(
  dashboard: ChannelDashboard,
  useAI: boolean = false
): Promise<string> {
  if (!useAI || !this.openaiService) {
    return this.generateCompetitionStrategySimulated(dashboard);
  }

  const prompt = prompts.competition(dashboard);

  // 1. 캐시 확인
  const cached = aiCache.get(prompt);
  if (cached) {
    toast.info('캐시된 분석 결과 (비용 절감!)');
    return cached;
  }

  // 2. API 호출
  const systemPrompt = `...`;
  const response = await this.openaiService.generate(systemPrompt, prompt);

  // 3. 캐시 저장
  const cost = estimateCost(
    estimateTokens(systemPrompt + prompt),
    estimateTokens(response)
  );
  aiCache.set(prompt, response, cost);

  return response;
}
```

### 5-3. 모델 선택 전략

```typescript
// 상황별 최적 모델 선택

function selectModel(taskType: string): string {
  const modelStrategy = {
    // 간단한 작업: GPT-3.5 (저렴)
    'video-summary': 'gpt-3.5-turbo',
    'title-generation': 'gpt-3.5-turbo',
    
    // 복잡한 분석: GPT-4o (정확)
    'competition-analysis': 'gpt-4o',
    'strategy-planning': 'gpt-4o',
    'blue-ocean-analysis': 'gpt-4o',
  };

  return modelStrategy[taskType] || 'gpt-3.5-turbo';
}

// 사용
const model = selectModel('competition-analysis');
await openaiService.generate(systemPrompt, userPrompt, { model });
```

---

## 6. 배포 및 보안

### 6-1. API 키 보안

**❌ 절대 하지 말아야 할 것:**

```typescript
// 코드에 API 키 하드코딩 금지!
const OPENAI_API_KEY = 'sk-proj-abc123...'; // 절대 금지!
```

**✅ 올바른 방법:**

```typescript
// 1. 클라이언트 사이드 (현재 프로젝트)
// - 사용자가 직접 자신의 API 키 입력
// - 로컬 스토리지에 저장
// - 각 사용자가 자신의 비용 부담

// 2. 서버 사이드 (고급, 추후)
// - 백엔드 API 구축
// - 환경 변수로 키 관리
// - 서비스 제공자가 비용 부담
```

### 6-2. Rate Limiting

```typescript
// src/lib/rate-limiter.ts

class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 10; // 10분당 10회
  private windowMs = 10 * 60 * 1000;

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // 시간 윈도우 밖의 요청 제거
    this.requests = this.requests.filter(
      (time) => now - time < this.windowMs
    );

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const resetTime = oldestRequest + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}

export const aiRateLimiter = new RateLimiter();
```

```typescript
// 사용
if (!aiRateLimiter.canMakeRequest()) {
  const waitTime = aiRateLimiter.getTimeUntilReset();
  toast.error(
    `요청 한도 초과. ${Math.ceil(waitTime / 60000)}분 후 다시 시도하세요.`
  );
  return;
}

// API 호출...
```

### 6-3. 에러 처리

```typescript
// services/openai.ts에 고급 에러 처리

async chat(messages: OpenAIMessage[], options = {}): Promise<string> {
  try {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      // ...
    });

    if (!response.ok) {
      const error = await response.json();
      
      // 특정 에러 처리
      switch (response.status) {
        case 401:
          throw new Error('OpenAI API 키가 유효하지 않습니다');
        
        case 429:
          throw new Error('요청 한도 초과. 잠시 후 다시 시도하세요');
        
        case 500:
        case 503:
          throw new Error('OpenAI 서버 오류. 잠시 후 다시 시도하세요');
        
        default:
          throw new Error(error.error?.message || 'API 호출 실패');
      }
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error: any) {
    // 네트워크 에러
    if (error.message === 'Failed to fetch') {
      throw new Error('인터넷 연결을 확인해주세요');
    }
    
    throw error;
  }
}
```

---

## 7. 고급 기능

### 7-1. 스트리밍 응답 (실시간 출력)

```typescript
// services/openai.ts에 스트리밍 추가

async chatStream(
  messages: OpenAIMessage[],
  onChunk: (chunk: string) => void,
  options = {}
): Promise<void> {
  const response = await fetch(`${this.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    },
    body: JSON.stringify({
      ...options,
      messages,
      stream: true, // 스트리밍 활성화
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          
          if (content) {
            onChunk(content); // 실시간으로 콜백 호출
          }
        } catch (e) {
          // 파싱 에러 무시
        }
      }
    }
  }
}
```

```typescript
// UI에서 스트리밍 사용

const [streamedInsight, setStreamedInsight] = useState('');

const generateWithStreaming = async () => {
  setStreamedInsight('');
  setIsGenerating(true);

  await openaiService.chatStream(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    (chunk) => {
      // 실시간으로 텍스트 추가
      setStreamedInsight((prev) => prev + chunk);
    }
  );

  setIsGenerating(false);
};

// 타이핑 효과처럼 실시간으로 표시됨!
```

### 7-2. 다중 AI 비교

```typescript
// 여러 모델의 응답을 동시에 받아서 비교

async compareModels(prompt: string): Promise<{
  gpt4: string;
  gpt35: string;
}> {
  const [gpt4Response, gpt35Response] = await Promise.all([
    this.generate(systemPrompt, prompt, { model: 'gpt-4o' }),
    this.generate(systemPrompt, prompt, { model: 'gpt-3.5-turbo' }),
  ]);

  return {
    gpt4: gpt4Response,
    gpt35: gpt35Response,
  };
}
```

### 7-3. AI 피드백 루프

```typescript
// AI가 생성한 제목을 평가하도록 요청

async evaluateTitles(titles: string[]): Promise<{
  title: string;
  score: number;
  feedback: string;
}[]> {
  const evaluationPrompt = `
다음 YouTube 영상 제목들을 평가하세요:

${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

각 제목에 대해:
1. CTR 예상 점수 (0-100)
2. 개선 제안

JSON 형식으로 응답하세요.
`;

  const response = await this.generate(
    'YouTube 제목 전문가',
    evaluationPrompt
  );

  return JSON.parse(response);
}
```

---

## 8. 실전 예제

### 8-1. 완전한 AI 인사이트 플로우

```typescript
// components/ChannelDetail.tsx - 완성본

export function ChannelDetail() {
  const [insights, setInsights] = useState<{
    competition?: string;
    growth?: string;
    diagnosis?: string;
  }>({});
  
  const [isGenerating, setIsGenerating] = useState(false);
  const { openaiApiKey } = useApiKey();

  const generateAllInsights = async () => {
    if (!channelData) return;

    setIsGenerating(true);
    const aiService = createAIService(openaiApiKey);
    const useAI = !!openaiApiKey;

    try {
      // 병렬로 3가지 분석 동시 실행
      const [competition, growth, diagnosis] = await Promise.all([
        aiService.generateCompetitionStrategy(channelData, useAI),
        aiService.generateGrowthPhases(channelData, useAI),
        aiService.generateDiagnosis(channelData, useAI),
      ]);

      setInsights({ competition, growth, diagnosis });
      toast.success('AI 분석 완료!');

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* AI 인사이트 생성 버튼 */}
      <button
        onClick={generateAllInsights}
        disabled={isGenerating}
        className="..."
      >
        {isGenerating ? 'AI 분석 중...' : '🤖 전체 AI 분석'}
      </button>

      {/* 탭으로 각 인사이트 표시 */}
      {Object.keys(insights).length > 0 && (
        <Tabs defaultValue="competition">
          <TabsList>
            <TabsTrigger value="competition">경쟁 전략</TabsTrigger>
            <TabsTrigger value="growth">성장 분석</TabsTrigger>
            <TabsTrigger value="diagnosis">채널 진단</TabsTrigger>
          </TabsList>

          <TabsContent value="competition">
            <AIInsightCard content={insights.competition} />
          </TabsContent>

          <TabsContent value="growth">
            <AIInsightCard content={insights.growth} />
          </TabsContent>

          <TabsContent value="diagnosis">
            <AIInsightCard content={insights.diagnosis} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
```

---

## 9. 테스트 가이드

### 9-1. 로컬 테스트

```bash
# 1. 개발 서버 실행
npm run dev

# 2. API 키 설정 페이지로 이동
http://localhost:5173/#/setup

# 3. OpenAI API 키 입력

# 4. 채널 분석 페이지로 이동
http://localhost:5173/#/channel

# 5. 테스트 채널 입력
https://www.youtube.com/@YouTube

# 6. "AI 인사이트 생성" 버튼 클릭

# 7. 콘솔에서 토큰 사용량 확인
```

### 9-2. 비용 모니터링

```typescript
// 실시간 비용 추적

let totalCost = 0;

function trackCost(inputTokens: number, outputTokens: number) {
  const cost = estimateCost(inputTokens, outputTokens);
  totalCost += cost;
  
  console.log(`이번 요청: $${cost.toFixed(4)}`);
  console.log(`누적 비용: $${totalCost.toFixed(4)}`);
  
  // 로컬 스토리지에 저장
  localStorage.setItem('ai_total_cost', totalCost.toString());
}
```

---

## 10. 체크리스트

### 개발 완료 체크리스트

```
GPT 연동 구현:
- [ ] OpenAI API 키 발급
- [ ] services/openai.ts 생성
- [ ] services/ai.ts 업데이트
- [ ] hooks/useApiKey.ts에 OpenAI 키 추가
- [ ] components/ApiKeySetup.tsx 업데이트

기능 테스트:
- [ ] 채널 분석 AI 인사이트
- [ ] 키워드 전략 생성
- [ ] 블루오션 분석
- [ ] 에러 처리 확인

최적화:
- [ ] 캐싱 구현
- [ ] Rate limiting 적용
- [ ] 토큰 사용량 모니터링
- [ ] 비용 추적

배포:
- [ ] API 키 보안 확인
- [ ] 환경 변수 설정
- [ ] 프로덕션 빌드 테스트
```

---

## 🎉 완료!

이제 YouTube 채널 분석 서비스에 **실제 GPT AI가 연동**되었습니다!

**다음 단계:**
- 사용자 피드백 수집
- 프롬프트 개선
- 더 많은 AI 기능 추가

**예상 비용:**
- 월 100회 분석: ~$5
- 월 1000회 분석: ~$50

저렴하게 강력한 AI 기능을 제공할 수 있습니다! 🚀
