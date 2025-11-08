import { ReactNode } from 'react';
import { Search, TrendingUp, FileX } from '../icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface EmptyStateProps {
  type: 'no-results' | 'no-data' | 'search-prompt';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export function EmptyState({ type, title, description, action, icon }: EmptyStateProps) {
  const defaults = {
    'no-results': {
      icon: <Search className="w-12 h-12 text-muted-foreground" />,
      title: '검색 결과가 없습니다',
      description: '다른 키워드나 채널명으로 검색해보세요.',
    },
    'no-data': {
      icon: <FileX className="w-12 h-12 text-muted-foreground" />,
      title: '데이터가 없습니다',
      description: '분석할 데이터를 먼저 수집해주세요.',
    },
    'search-prompt': {
      icon: <TrendingUp className="w-12 h-12 text-[#ef4444]" />,
      title: '분석을 시작하세요',
      description: '채널명이나 키워드를 검색하여 인사이트를 얻으세요.',
    },
  };

  const config = defaults[type];

  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md border-border text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {icon || config.icon}
          </div>
          <CardTitle>{title || config.title}</CardTitle>
          <CardDescription>{description || config.description}</CardDescription>
        </CardHeader>
        {action && (
          <CardContent>
            <Button onClick={action.onClick} className="bg-[#ef4444] hover:bg-[#dc2626]">
              {action.label}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
