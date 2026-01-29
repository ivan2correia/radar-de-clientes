import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { 
  TrendingUp, MessageCircle, Lightbulb, Loader2, 
  Search, AlertTriangle, Target, RefreshCw
} from 'lucide-react';

const RadarPage = () => {
  const { api, business } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trends');
  const [insights, setInsights] = useState({
    trends: null,
    complaints: null,
    opportunities: null
  });

  const fetchInsight = async (type) => {
    if (!business) {
      toast.error('Configure seu negócio primeiro');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/insights/market', {
        niche: business.niche,
        city: business.city,
        type: type
      });
      
      setInsights(prev => ({
        ...prev,
        [type]: response.data.insight
      }));
      toast.success('Análise concluída!');
    } catch (error) {
      toast.error('Erro ao gerar análise');
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content) => {
    if (!content) return null;
    
    // Try to parse JSON if possible
    try {
      const parsed = JSON.parse(content);
      return (
        <div className="space-y-4">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <h4 className="font-heading font-semibold text-lg capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              {Array.isArray(value) ? (
                <ul className="space-y-2">
                  {value.map((item, i) => (
                    <li key={i} className="p-3 rounded-xl bg-muted/50 text-sm">
                      {typeof item === 'object' ? JSON.stringify(item) : item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{value}</p>
              )}
            </div>
          ))}
        </div>
      );
    } catch {
      // If not JSON, display as formatted text
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
        </div>
      );
    }
  };

  const tabs = [
    { 
      id: 'trends', 
      label: 'Tendências', 
      icon: TrendingUp,
      color: 'text-primary',
      description: 'O que está em alta no seu nicho'
    },
    { 
      id: 'complaints', 
      label: 'Reclamações', 
      icon: MessageCircle,
      color: 'text-amber-500',
      description: 'Dores e problemas dos clientes'
    },
    { 
      id: 'opportunities', 
      label: 'Oportunidades', 
      icon: Lightbulb,
      color: 'text-emerald-500',
      description: 'Nichos e gaps de mercado'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Search className="w-8 h-8 text-primary" />
            Radar de Mercado
          </h1>
          <p className="text-muted-foreground mt-1">
            Descubra o que seu público está buscando e do que está reclamando
          </p>
        </div>
        {business && (
          <Badge variant="outline" className="text-sm py-1 px-3">
            <Target className="w-4 h-4 mr-2" />
            {business.niche?.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2"
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className={`w-4 h-4 ${tab.color}`} />
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${tab.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                      <tab.icon className={`w-6 h-6 ${tab.color}`} />
                    </div>
                    <div>
                      <CardTitle className="font-heading">{tab.label}</CardTitle>
                      <CardDescription>{tab.description}</CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => fetchInsight(tab.id)}
                    disabled={loading}
                    className="rounded-full"
                    data-testid={`analyze-${tab.id}-btn`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {insights[tab.id] ? 'Atualizar' : 'Analisar'}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading && !insights[tab.id] ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : insights[tab.id] ? (
                  <div data-testid={`insight-${tab.id}`}>
                    {formatContent(insights[tab.id])}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <tab.icon className={`w-16 h-16 ${tab.color} opacity-20 mx-auto mb-4`} />
                    <p className="text-muted-foreground mb-4">
                      Clique em "Analisar" para descobrir {tab.description.toLowerCase()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Info Card */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Análise com Inteligência Artificial
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Os insights são gerados com IA baseados em dados públicos e tendências do mercado. 
              Use como guia para suas decisões de negócio.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadarPage;
