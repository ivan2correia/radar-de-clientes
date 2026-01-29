import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Users, TrendingUp, Eye, Target, ArrowRight, Sparkles, 
  BarChart3, PlusCircle, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { api, business, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuickReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await api.post('/reports/generate', { period: 'weekly' });
      toast.success('Relatório gerado! Veja na aba Relatórios.');
      navigate('/reports');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const overview = dashboardData?.overview || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Veja o que está acontecendo com seu negócio hoje
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={fetchDashboard}
                data-testid="refresh-dashboard-btn"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                className="rounded-full shadow-lg"
                onClick={generateQuickReport}
                disabled={generatingReport}
                data-testid="generate-report-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generatingReport ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Users}
          label="Total de Leads"
          value={overview.total_leads || 0}
          color="text-primary"
          testId="stat-total-leads"
        />
        <StatCard 
          icon={Target}
          label="Campanhas"
          value={overview.total_campaigns || 0}
          color="text-secondary"
          testId="stat-total-campaigns"
        />
        <StatCard 
          icon={Eye}
          label="Visitas"
          value={overview.total_visits || 0}
          color="text-emerald-500"
          testId="stat-total-visits"
        />
        <StatCard 
          icon={TrendingUp}
          label="Taxa Conversão"
          value={`${overview.conversion_rate || 0}%`}
          color="text-amber-500"
          testId="stat-conversion-rate"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate('/radar')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">Radar de Mercado</h3>
                  <p className="text-sm text-muted-foreground">Descubra tendências e oportunidades</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate('/strategies')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">Estratégias com IA</h3>
                  <p className="text-sm text-muted-foreground">Campanhas e conteúdos automáticos</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-xl">Leads Recentes</CardTitle>
            <CardDescription>Últimos contatos capturados</CardDescription>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => navigate('/leads')} data-testid="view-all-leads-btn">
            Ver todos <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {dashboardData?.recent_leads?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recent_leads.map((lead, index) => (
                <div 
                  key={lead.id || index}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                  data-testid={`recent-lead-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {lead.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email || lead.phone || 'Sem contato'}</p>
                    </div>
                  </div>
                  <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                    {lead.status === 'new' ? 'Novo' : lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Nenhum lead capturado ainda</p>
              <Button onClick={() => navigate('/leads')} className="rounded-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Adicionar Lead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pages Performance */}
      {dashboardData?.pages_performance?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Páginas de Captura</CardTitle>
            <CardDescription>Performance das suas landing pages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.pages_performance.map((page, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/50"
                  data-testid={`page-performance-${index}`}
                >
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.visits} visitas • {page.conversions} conversões
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {page.visits > 0 ? ((page.conversions / page.visits) * 100).toFixed(1) : 0}%
                    </span>
                    <p className="text-xs text-muted-foreground">conversão</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, testId }) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <CardContent className="p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold font-heading" data-testid={testId}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DashboardPage;
