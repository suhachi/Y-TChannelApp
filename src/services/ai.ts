import type { ChannelDashboard, VideoCore, KeywordSummary, BlueOceanMetrics } from '../types';
import { createOpenAIService } from './openai';
import prompts from '../src/prompts/index';

// AI service for generating insights and strategies
// Supports both real GPT (with API key) and simulated responses (fallback)

export class AIService {
  private openaiService: any;

  constructor(openaiApiKey?: string) {
    if (openaiApiKey) {
      try {
        this.openaiService = createOpenAIService(openaiApiKey);
      } catch (error) {
        console.error('OpenAI 초기화 실패:', error);
        this.openaiService = null;
      }
    }
  }

  // Generate competition strategy report
  async generateCompetitionStrategy(
    dashboard: ChannelDashboard, 
    useAI: boolean = false
  ): Promise<string> {
    // AI 모드: OpenAI GPT 사용
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 10년 경력의 YouTube 채널 성장 전문가입니다. 
데이터 기반으로 구체적이고 실행 가능한 전략을 제시하세요.
모든 제안은 제공된 데이터를 반드시 인용해야 합니다.
추측이나 일반론은 피하고, 이 채널만의 맞춤 전략을 제시하세요.`;

      const userPrompt = prompts.competition(dashboard);

      try {
        const response = await this.openaiService.generate(
          systemPrompt,
          userPrompt,
          { temperature: 0.7, maxTokens: 2000 }
        );
        return response;
      } catch (error: any) {
        console.error('AI 분석 실패:', error);
        throw new Error(`AI 분석 실패: ${error.message}`);
      }
    }

    // 시뮬레이션 모드: 기본 템플릿 응답
    const { core, videos, metrics } = dashboard;
    
    const topVideos = videos
      .sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0))
      .slice(0, 10);

    const avgViews = videos.reduce((sum, v) => sum + (v.stats.views || 0), 0) / videos.length;
    const avgDuration = metrics.avgDuration;

    return `# ${core.title} 경쟁 전략 분석

## 채널 개요
- **구독자**: ${core.stats.subscribers?.toLocaleString() || 'N/A'}
- **총 조회수**: ${core.stats.views?.toLocaleString() || 'N/A'}
- **동영상 수**: ${core.stats.videoCount || 0}
- **쇼츠 비율**: ${(metrics.shortsRatio * 100).toFixed(1)}%

## 성과 분석
- **영상당 평균 조회수**: ${avgViews.toLocaleString()}
- **상위 20% 파레토 점유율**: ${(metrics.topParetoShare * 100).toFixed(1)}%
- **평균 영상 길이**: ${Math.floor(avgDuration / 60)}분 ${Math.floor(avgDuration % 60)}초

## 인기 영상 TOP 10
${topVideos.map((v, i) => `${i + 1}. **${v.title}** - ${v.stats.views?.toLocaleString()} 조회수`).join('\n')}

## 추천 전략

### 1. 콘텐츠 형식
${metrics.shortsRatio > 0.5 ? '쇼츠 중심' : '롱폼 중심'} 접근 방식을 기반으로, ${metrics.shortsRatio > 0.5 ? '현재의 쇼츠 전략을 유지' : '쇼츠 실험을 통해'}하여 알고리즘 트렌드를 포착하세요.

### 2. 최적 영상 길이
성공 영상을 기준으로 ${Math.floor(avgDuration / 60)}-${Math.floor(avgDuration / 60) + 2}분을 목표로 하세요.

### 3. 업로드 일정
주 3-4개 영상 + ${metrics.shortsRatio > 0.3 ? '쇼츠 2-3개' : '쇼츠 1-2개'}로 시청자 참여를 유지하세요.

### 4. 제목 템플릿
- "[훅/질문] + [주요 토픽] + [결과/약속]"
- 성공 제목 평균 길이: ${Math.floor(metrics.titleLenAvg)}자

### 5. 수익화 다각화
- 충성 구독자를 위한 채널 멤버십
- 인기 영상 주제와 연계된 굿즈
- 설명란 제휴 마케팅
- 구독자 ${Math.floor(core.stats.subscribers || 0 / 10000)}만+ 기반 스폰서십 기회

## 리스크 완화
- 알고리즘 패널티 방지를 위한 콘텐츠 일관성 유지
- 시청자 피로도 방지를 위한 니치 내 주제 다양화
- 조기 경고 신호를 위한 참여 지표(좋아요/댓글 비율) 모니터링

*YouTube Data API v3 공개 지표 기반 분석*`;
  }

  // Generate growth phases analysis
  async generateGrowthPhases(
    dashboard: ChannelDashboard,
    useAI: boolean = false
  ): Promise<string> {
    // AI 모드
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 데이터 분석가입니다. 
채널의 성장 패턴을 분석하고 향후 예측을 제공하세요.
구체적인 숫자와 증거를 바탕으로 설명하세요.`;

      const userPrompt = prompts.growth(dashboard);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error: any) {
        console.error('AI 성장 분석 실패:', error);
        throw new Error(`AI 성장 분석 실패: ${error.message}`);
      }
    }

    // 시뮬레이션 모드
    const { core, videos } = dashboard;
    
    // Sort by publish date
    const sortedVideos = [...videos].sort((a, b) => 
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );

    const third = Math.floor(sortedVideos.length / 3);
    const early = sortedVideos.slice(0, third);
    const mid = sortedVideos.slice(third, third * 2);
    const recent = sortedVideos.slice(third * 2);

    const avgViews = (vids: VideoCore[]) => 
      vids.reduce((sum, v) => sum + (v.stats.views || 0), 0) / vids.length;

    return `# ${core.title} 성장 단계 분석

## 1단계: 초기 단계
**기간**: ${new Date(early[0]?.publishedAt).toLocaleDateString()} - ${new Date(early[early.length - 1]?.publishedAt).toLocaleDateString()}
- 평균 조회수: ${avgViews(early).toLocaleString()}
- 게시 영상: ${early.length}개
- **핵심 초점**: 기반 구축 및 콘텐츠 실험

## 2단계: 성장 기간
**기간**: ${new Date(mid[0]?.publishedAt).toLocaleDateString()} - ${new Date(mid[mid.length - 1]?.publishedAt).toLocaleDateString()}
- 평균 조회수: ${avgViews(mid).toLocaleString()}
- 성장률: ${((avgViews(mid) / avgViews(early) - 1) * 100).toFixed(1)}%
- **핵심 초점**: 콘텐츠-시장 적합성 찾기

## 3단계: 현재 상태
**기간**: ${new Date(recent[0]?.publishedAt).toLocaleDateString()} - ${new Date(recent[recent.length - 1]?.publishedAt).toLocaleDateString()}
- 평균 조회수: ${avgViews(recent).toLocaleString()}
- 성장률: ${((avgViews(recent) / avgViews(mid) - 1) * 100).toFixed(1)}%
- **핵심 초점**: 최적화 및 확장

## 성공 요인
${avgViews(mid) > avgViews(early) * 1.5 ? '✓ 강력한 초기 성장 모멘텀' : '• 점진적 시청자 구축'}
${avgViews(recent) > avgViews(mid) ? '✓ 지속적인 성장 궤도' : '• 정체기 - 콘텐츠 리프레시 고려'}

## 다음 사이클 가설
성장 패턴을 기반으로, 이 채널은 향후 3-6개월간 ${avgViews(recent) > avgViews(mid) ? '지속적인 확장' : '전략적 전환을 통한 성장'}이 예상됩니다.

*${videos.length}개 영상 분석 기반*`;
  }

  // Generate channel diagnosis
  async generateDiagnosis(
    dashboard: ChannelDashboard,
    useAI: boolean = false
  ): Promise<string> {
    // AI 모드
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 YouTube 컨설턴트입니다. 
채널의 강점과 약점을 진단하고 개선 방안을 제시하세요.
단기와 장기 실행 계획을 구체적으로 작성하세요.`;

      const userPrompt = prompts.diagnosis(dashboard);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error: any) {
        console.error('AI 진단 실패:', error);
        throw new Error(`AI 진단 실패: ${error.message}`);
      }
    }

    // 시뮬레이션 모드
    const { core, videos, metrics } = dashboard;
    
    const avgEngagement = videos.reduce((sum, v) => {
      const engagement = ((v.stats.likes || 0) + (v.stats.comments || 0)) / (v.stats.views || 1);
      return sum + engagement;
    }, 0) / videos.length;

    return `# 채널 진단 보고서: ${core.title}

## 콘텐츠 건강도: ${this.calculateHealthScore(dashboard)}/100

### 콘텐츠 품질
- **업로드 일관성**: ${videos.length > 50 ? '우수' : videos.length > 20 ? '양호' : '개선 필요'}
- **형식 다양성**: ${metrics.shortsRatio > 0.2 && metrics.shortsRatio < 0.8 ? '균형잡힌' : '불균형'}
- **평균 참여도**: ${(avgEngagement * 100).toFixed(3)}%

### 시청자 참여
- **영상당 좋아요**: ${(videos.reduce((sum, v) => sum + (v.stats.likes || 0), 0) / videos.length).toFixed(0)}
- **영상당 댓글**: ${(videos.reduce((sum, v) => sum + (v.stats.comments || 0), 0) / videos.length).toFixed(0)}
- **참여도 트렌드**: ${avgEngagement > 0.03 ? '📈 강함' : '📊 보통'}

### 브랜드 포지셔닝
- **니치 명확성**: ${core.description ? '정의됨' : '개선 필요'}
- **구독자 전환율**: ${((core.stats.subscribers || 0) / (core.stats.views || 1) * 100).toFixed(2)}%

## 단기 실행 계획 (향후 30일)
1. **콘텐츠**: ${metrics.shortsRatio < 0.3 ? '주 2-3개 쇼츠 제작 증가' : '현재 형식 믹스 유지'}
2. **참여**: 첫 10초와 엔드스크린에 명확한 CTA 추가
3. **최적화**: 인기 주제 썸네일 A/B 테스트
4. **일관성**: 주 ${Math.ceil(videos.length / 90)}개 영상 일정 유지

## 중장기 전략 (3-6개월)
1. **브랜드**: 브랜드 인지도 향상을 위한 시그니처 스타일/인트로 개발
2. **수익화**: 애드센스 외 수익 다각화 (멤버십, 제품)
3. **성장**: 비슷한 규모 채널과 협업으로 교차 홍보
4. **분석**: CTR 및 평균 시청 지속 시간 추적 (YouTube Analytics 접근 필요)

## 핵심 성과 지표
- **목표 CTR**: 4-6% (업계 표준)
- **목표 유지율**: 30초 시점 50%+
- **업로드 주기**: 주 ${Math.ceil(videos.length / 90)}회

*${videos.length}개 분석 영상 및 업계 벤치마크 기반 권장사항*`;
  }

  // Generate keyword strategy
  async generateKeywordStrategy(
    summary: KeywordSummary,
    useAI: boolean = false
  ): Promise<string> {
    // AI 모드
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 YouTube SEO 전문가입니다. 
키워드 데이터를 분석하여 콘텐츠 전략을 제안하세요.
제목 템플릿, 썸네일 콘셉트, 주간 캘린더를 포함하세요.`;

      const userPrompt = prompts.keyword(summary);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error: any) {
        console.error('AI 키워드 전략 실패:', error);
        throw new Error(`AI 키워드 전략 실패: ${error.message}`);
      }
    }

    // 시뮬레이션 모드
    const { query, videos, topChannels, formatMix } = summary;
    
    const avgViews = videos.reduce((sum, v) => sum + (v.stats.views || 0), 0) / videos.length;
    const competition = topChannels.length < 5 ? '낮음' : topChannels.length < 10 ? '보통' : '높음';

    return `# 키워드 전략: \"${query}\"

## 시장 분석
- **분석 영상 수**: ${videos.length}
- **경쟁 수준**: ${competition}
- **평균 조회수**: ${avgViews.toLocaleString()}
- **형식 분포**: 쇼츠 ${(formatMix.shortsPct * 100).toFixed(1)}%, 롱폼 ${(formatMix.longPct * 100).toFixed(1)}%

## 이 분야 상위 채널
${topChannels.slice(0, 5).map((ch, i) => `${i + 1}. ${ch.videoCount}개 영상 보유 (${(ch.estShare * 100).toFixed(1)}% 점유율)`).join('\n')}

## 권장 전략

### 형식 전략
${formatMix.shortsPct > 0.6 ? '**쇼츠 우선**: 이 키워드는 쇼츠로 가장 효과적입니다' : '**롱폼 중심**: 이 키워드는 심층 콘텐츠가 더 효과적입니다'}

### 최적 영상 길이
- 쇼츠: 15-45초
- 롱폼: ${competition === '높음' ? '10-15분' : '8-12분'} (${competition === '높음' ? '높은 경쟁은 깊이 필요' : '참여도 스위트 스팟'})

### 업로드 빈도
권위 구축을 위해 주 ${competition === '높음' ? '4-5개' : '2-3개'} 영상 권장

### 제목 템플릿
1. \"${query} | [독특한 관점/훅]\"
2. \"${query}에 대한 [놀라운 사실]\"
3. \"[숫자]가지 ${query} 팁 [아무도 말하지 않는]\"
4. \"2025년 ${query}의 진실\"

### 썸네일 콘셉트
- 고대비 색상 (쇼츠는 노랑/빨강, 롱폼은 파랑/주황)
- 최대 3단어 굵은 텍스트 오버레이
- 감정 표현하는 인물 얼굴 ${formatMix.shortsPct > 0.5 ? '(쇼츠는 클로즈업)' : '(롱폼은 미디엄 샷)'}

### 해시태그 전략
주요: #${query.replace(/\s+/g, '')}
보조: 니치 내 관련 트렌딩 태그

## 주간 콘텐츠 캘린더
${this.generateContentCalendar(query, formatMix)}

*${videos.length}개 영상 샘플 및 현재 시장 트렌드 기반 전략*`;
  }

  // Generate blue ocean analysis
  async generateBlueOceanAnalysis(
    metrics: BlueOceanMetrics,
    useAI: boolean = false
  ): Promise<string> {
    // AI 모드
    if (useAI && this.openaiService) {
      const systemPrompt = `당신은 시장 분석 전문가입니다. 
블루오션/레드오션을 판단하고 진입 전략을 제시하세요.
데이터 기반으로 구체적인 실행 계획을 작성하세요.`;

      const userPrompt = prompts.blueOcean(metrics);

      try {
        return await this.openaiService.generate(systemPrompt, userPrompt);
      } catch (error: any) {
        console.error('AI 블루오션 분석 실패:', error);
        throw new Error(`AI 블루오션 분석 실패: ${error.message}`);
      }
    }

    // 시뮬레이션 모드
    const { query, viewMean, viewMedian, concentrationRatio, activity, verdict } = metrics;

    return `# 블루오션 분석: \"${query}\"

## 시장 판단: ${verdict === 'BLUE' ? '🔵 블루오션 (기회)' : '🔴 레드오션 (포화)'}

### 분산도 지표
- **평균 조회수**: ${viewMean.toLocaleString()}
- **중앙 조회수**: ${viewMedian.toLocaleString()}
- **분산 점수**: ${viewMedian / viewMean > 0.7 ? '분산형 (양호)' : '승자독식형'}

### 경쟁 밀도
- **채널 집중도**: ${(concentrationRatio * 100).toFixed(1)}%
- **시장 구조**: ${concentrationRatio > 0.5 ? '분산형 (좋음)' : '독점형 (어려움)'}

### 시장 활동성
- **평균 업로드 간격**: ${activity.avgUploadIntervalDays.toFixed(1)}일
- **최근 업로드**: ${activity.latestUploadDaysAgo}일 전
- **활동 수준**: ${activity.avgUploadIntervalDays > 14 ? '낮음 (기회)' : '높음 (경쟁적)'}

## 전략적 권장사항

${verdict === 'BLUE' ? `
### 진입 전략 (블루오션)
이 키워드는 **강력한 기회 신호**를 보입니다:
- ${viewMedian / viewMean > 0.7 ? '✓ 조회수가 분산됨 (승자독식 아님)' : ''}
- ${concentrationRatio > 0.5 ? '✓ 여러 채널이 성공 (독점 아님)' : ''}
- ${activity.avgUploadIntervalDays > 14 ? '✓ 업로드 빈도 낮음 (경쟁 적음)' : ''}

### 권장 실행 계획
1. **빠른 진입**: 시장 반응 테스트를 위해 5-10개 영상으로 시작
2. **형식**: 다양한 시청자 확보를 위한 쇼츠와 롱폼 믹스
3. **차별화**: 현재 영상에 부족한 [독특한 관점]에 집중
4. **빈도**: 초기 모멘텀 구축을 위해 주 3-4회 업로드

### 니치 다운 전략
롱테일 변형 고려:
- \"${query} 초보자용\"
- \"${query} 피해야 할 실수\"
- \"${query} 2025 업데이트\"
` : `
### 생존 전략 (레드오션)
이 키워드는 **매우 경쟁적**입니다:
- ${viewMedian / viewMean < 0.7 ? '⚠ 승자독식 역학' : ''}
- ${concentrationRatio < 0.5 ? '⚠ 소수 채널 지배' : ''}
- ${activity.avgUploadIntervalDays < 7 ? '⚠ 경쟁자의 잦은 업로드' : ''}

### 권장 실행 계획
1. **니치 다운**: 이 키워드 내 롱테일 하위 주제 타겟팅
2. **품질 우선**: 주 1-2개 고품질 영상
3. **차별화**: 상위 채널이 다루지 않은 독특한 형식 또는 관점
4. **커뮤니티**: 댓글/커뮤니티 게시물을 통한 참여 시청자 구축

### 대체 키워드
관련되지만 덜 경쟁적인 용어로의 전환 고려
`}

## 초기 10가지 콘텐츠 아이디어
${this.generateContentIdeas(query)}

*이 키워드 공간 상위 ${metrics.topN}개 영상 분석 기반*`;
  }

  // Helper methods
  private calculateHealthScore(dashboard: ChannelDashboard): number {
    const { videos, metrics } = dashboard;
    let score = 50; // Base score

    // Consistency bonus
    if (videos.length > 50) score += 15;
    else if (videos.length > 20) score += 10;
    else score += 5;

    // Format balance bonus
    if (metrics.shortsRatio > 0.2 && metrics.shortsRatio < 0.8) score += 15;
    else score += 5;

    // Engagement bonus
    const avgEngagement = videos.reduce((sum, v) => {
      const eng = ((v.stats.likes || 0) + (v.stats.comments || 0)) / (v.stats.views || 1);
      return sum + eng;
    }, 0) / videos.length;
    
    if (avgEngagement > 0.03) score += 20;
    else if (avgEngagement > 0.02) score += 10;

    return Math.min(score, 100);
  }

  private generateContentCalendar(query: string, formatMix: { shortsPct: number; longPct: number }): string {
    const shortsPerWeek = formatMix.shortsPct > 0.5 ? 3 : 1;
    const longPerWeek = formatMix.shortsPct > 0.5 ? 1 : 2;

    return `
- **월요일**: ${shortsPerWeek > 0 ? '쇼츠 (15-30초) - 빠른 팁' : '리서치 및 기획'}
- **수요일**: 롱폼 (${formatMix.shortsPct > 0.5 ? '8-10분' : '10-15분'}) - 심층 분석
- **금요일**: ${shortsPerWeek > 1 ? '쇼츠 - 티저/비하인드' : '롱폼 후속편'}
${shortsPerWeek > 2 ? '- **토요일**: 쇼츠 - 트렌드 대응' : ''}`;
  }

  private generateContentIdeas(query: string): string {
    return `
1. \"2025 완벽한 ${query} 가이드\"
2. \"${query}: 아무도 말하지 않는 10가지\"
3. \"30일 동안 ${query} 해본 결과\"
4. \"${query} vs [대안] - 어느 것이 더 나을까?\"
5. \"${query} 흔한 실수 (그리고 피하는 법)\"
6. \"[전문가]가 알려주는 ${query} 팁\"
7. \"${query} 뒤에 숨은 과학\"
8. \"저예산으로 하는 ${query}\"
9. \"${query} 가치가 있을까? (솔직 리뷰)\"
10. \"2025년 주목할 ${query} 트렌드\"`;
  }

  // Generate video summary from title and description
  async generateVideoSummary(title: string, description: string, duration: number): Promise<string> {
    const isShort = duration <= 60;
    const durationStr = isShort ? '쇼츠' : `${Math.floor(duration / 60)}분 ${duration % 60}초`;
    
    // Extract key topics from title
    const titleWords = title.split(/\s+/).filter(w => w.length > 2);
    const mainTopic = titleWords.slice(0, 3).join(' ');
    
    // Extract hashtags
    const hashtags = (title + ' ' + description).match(/#[\w가-힣]+/g) || [];
    
    // Simple topic categorization
    let category = '일반';
    if (title.match(/튜토리얼|방법|how to|가이드/i)) category = '교육';
    else if (title.match(/리뷰|사용기|후기/i)) category = '리뷰';
    else if (title.match(/브이로그|일상|vlog/i)) category = '브이로그';
    else if (title.match(/게임|플레이/i)) category = '게임';
    else if (title.match(/음악|music|노래/i)) category = '음악';
    
    return `## 🎬 영상 요약

**제목**: ${title}

**형식**: ${isShort ? '📱 쇼츠' : '📺 롱폼'} (${durationStr})
**카테고리**: ${category}

### 핵심 내용
${description.slice(0, 200)}${description.length > 200 ? '...' : ''}

### 주요 키워드
${mainTopic}

### 해시태그
${hashtags.length > 0 ? hashtags.slice(0, 5).join(' ') : '없음'}

### 전략 제안
${isShort ? 
  '• 쇼츠 최적화: 처음 3초에 훅 필요\n• 세로 9:16 비율 최대 활용\n• 15-45초 길이로 재편집 고려' :
  `• 롱폼 최적화: ${duration > 600 ? '챕터 나누기로 유지율 향상' : '8-10분 길이 유지'}\n• 썸네일에 감정 표현 추가\n• 첫 30초 내 핵심 가치 제시`
}

*제목과 설명 기반 AI 분석*`;
  }
}

// 팩토리 함수: OpenAI 키로 AI 서비스 생성
export function createAIService(openaiApiKey?: string): AIService {
  return new AIService(openaiApiKey);
}

// 기본 인스턴스 (시뮬레이션 모드)
export const aiService = new AIService();
