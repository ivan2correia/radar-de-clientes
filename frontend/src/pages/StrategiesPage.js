import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Sparkles, Megaphone, FileText, Gift, Loader2, 
  Copy, Check, Target, RefreshCw
} from 'lucide-react';

const StrategiesPage = () => {
  const { api, business } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('campaign');
  const [strategies, setStrategies] = useState({
    campaign: null,
    content: null,
    promotion: null
  });
  const [copied, setCopied] = useState(false);

  const fetchStrategy = async (type) => {
    if (!business) {
      toast.error('Configure seu negócio primeiro');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/insights/strategy', {
        niche: business.niche,
        insight_type: type
      });
      
      setStrategies(prev => ({
        ...prev,
        [type]: response.data.strategy
      }));
      toast.success('Estratégia gerada!');
    } catch (error) {
      toast.error('Erro ao gerar estratégia');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatStrategy = (content, type) => {
    if (!content) return null;
    
    try {
      const parsed = JSON.parse(content);
      
      if (type === 'campaign' && !Array.isArray(parsed)) {
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
              <h3 className="font-heading font-bold text-xl text-primary mb-2">
                {parsed.nome || 'Campanha'}
              </h3>
              <p className="text-muted-foreground mb-4">{parsed.objetivo}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Público-Alvo</p>
                  <p className="text-sm text-muted-foreground">{parsed.publico}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Oferta</p>
                  <p className="text-sm text-muted-foreground">{parsed.oferta}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Chamada (CTA)</p>
                  <Badge variant="secondary" className="text-sm">{parsed.cta}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Canais</p>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(parsed.canais) ? parsed.canais.join(', ') : parsed.canais}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-4">
            {parsed.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {item.tipo && (
                      <Badge variant="outline" className="mb-2">{item.tipo}</Badge>
                    )}
                    <h4 className="font-heading font-semibold text-lg">
                      {item.nome || item.tema || `Ideia ${index + 1}`}
                    </h4>
                    {item.gancho && (
                      <p className="text-primary font-medium mt-2">"{item.gancho}"</p>
                    )}
                    {item.mecanica && (
                      <p className="text-muted-foreground mt-2">{item.mecanica}</p>
                    )}
                    {item.duracao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Duração: {item.duracao}
                      </p>
                    )}
                    {item.hashtags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(Array.isArray(item.hashtags) ? item.hashtags : [item.hashtags]).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {item.resultados && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                        ✓ {item.resultados}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(JSON.stringify(item, null, 2))}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {JSON.stringify(parsed, null, 2)}
        </div>
      );
    } catch {
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
      id: 'campaign', 
      label: 'Campanhas', 
      icon: Megaphone,
      color: 'text-primary',
      description: 'Ideias de campanhas completas'
    },
    { 
      id: 'content', 
      label: 'Conteúdo', 
      icon: FileText,
      color: 'text-secondary',
      description: 'Posts e vídeos para redes sociais'
    },
    { 
      id: 'promotion', 
      label: 'Promoções', 
      icon: Gift,
      color: 'text-emerald-500',
      description: 'Estratégias promocionais'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-secondary" />
            Estratégias com IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Gere campanhas, conteúdos e promoções automaticamente
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
                    onClick={() => fetchStrategy(tab.id)}
                    disabled={loading}
                    className="rounded-full"
                    data-testid={`generate-${tab.id}-btn`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {strategies[tab.id] ? 'Gerar Novo' : 'Gerar'}
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading && !strategies[tab.id] ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : strategies[tab.id] ? (
                  <div data-testid={`strategy-${tab.id}`}>
                    {formatStrategy(strategies[tab.id], tab.id)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <tab.icon className={`w-16 h-16 ${tab.color} opacity-20 mx-auto mb-4`} />
                    <p className="text-muted-foreground mb-4">
                      Clique em "Gerar" para criar {tab.description.toLowerCase()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tips Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Dica: Personalize as estratégias
              </p>
              <p className="text-muted-foreground">
                Use as sugestões como base e adapte para o seu negócio. 
                Quanto mais específico, melhores serão os resultados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategiesPage;
