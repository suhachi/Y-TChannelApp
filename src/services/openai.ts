/**
 * OpenAI API Service
 * GPT-4o 및 GPT-3.5-turbo 호출을 위한 서비스
 */

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
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
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('유효하지 않은 OpenAI API 키입니다');
    }
    this.apiKey = apiKey;
  }

  /**
   * GPT 채팅 완성 API 호출
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
      model = 'gpt-4o',
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
        const error = await response.json().catch(() => ({}));
        
        // 특정 에러 처리
        switch (response.status) {
          case 401:
            throw new Error('OpenAI API 키가 유효하지 않습니다. 키를 확인해주세요.');
          
          case 429:
            throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
          
          case 500:
          case 503:
            throw new Error('OpenAI 서버 오류입니다. 잠시 후 다시 시도해주세요.');
          
          default:
            throw new Error(
              error.error?.message || 
              `OpenAI API 호출 실패 (${response.status})`
            );
        }
      }

      const data: OpenAIResponse = await response.json();

      // 토큰 사용량 로깅 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        console.log('OpenAI 토큰 사용:', data.usage);
      }

      return data.choices[0].message.content;

    } catch (error: any) {
      // 네트워크 에러
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('인터넷 연결을 확인해주세요.');
      }
      
      throw error;
    }
  }

  /**
   * 간단한 프롬프트 생성 헬퍼
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

  /**
   * 스트리밍 응답 (실시간 출력)
   */
  async chatStream(
    messages: OpenAIMessage[],
    onChunk: (chunk: string) => void,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<void> {
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    const request: OpenAIRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    };

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('스트리밍 실패');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('스트림 리더를 가져올 수 없습니다');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 파싱 에러 무시
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * 팩토리 함수
 */
export function createOpenAIService(apiKey: string): OpenAIService {
  return new OpenAIService(apiKey);
}

/**
 * 토큰 추정 (간단한 계산)
 */
export function estimateTokens(text: string): number {
  // 영문 4글자 = 1 token, 한글 2글자 = 1 token (대략)
  const englishChars = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const otherChars = text.length - englishChars - koreanChars;
  
  return Math.ceil(
    englishChars / 4 + 
    koreanChars / 2 + 
    otherChars / 3
  );
}

/**
 * 비용 추정
 */
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
