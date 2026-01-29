import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { 
  BarChart3, FileText, Calendar, Loader2, Download,
  TrendingUp, Users, Target, Eye
} from 'lucide-react';

const ReportsPage = () => {
  const { api, business } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [currentReport, setCurrentReport] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/reports/history');
      setReportHistory(response.data);
      if (response.data.length > 0) {
        setCurrentReport(response.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const generateReport = async () => {
    if (!business) {
      toast.error('Configure seu negócio primeiro');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/reports/generate', { period: selectedPeriod });
      setCurrentReport(response.data);
      toast.success('Relatório gerado com sucesso!');
      fetchHistory();
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  const getPeriodLabel = (period) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal'
    };
    return labels[period] || period;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-36" data-testid="period-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateReport}
            disabled={generating}
            className="rounded-full"
            data-testid="generate-report-btn"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Report */}
      {currentReport && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-xl">
                  Relatório {getPeriodLabel(currentReport.period)}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(currentReport.generated_at)}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                Mais recente
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats */}
            {currentReport.data && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  icon={Users}
                  label="Leads"
                  value={currentReport.data.overview?.total_leads || 0}
                  color="text-primary"
                />
                <StatCard 
                  icon={Target}
                  label="Campanhas"
                  value={currentReport.data.overview?.total_campaigns || 0}
                  color="text-secondary"
                />
                <StatCard 
                  icon={Eye}
                  label="Visitas"
                  value={currentReport.data.overview?.total_visits || 0}
                  color="text-emerald-500"
                />
                <StatCard 
                  icon={TrendingUp}
                  label="Conversão"
                  value={`${currentReport.data.overview?.conversion_rate || 0}%`}
                  color="text-amber-500"
                />
              </div>
            )}

            {/* Analysis */}
            {currentReport.report && (
              <div className="p-6 rounded-2xl bg-card border" data-testid="report-analysis">
                <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Análise do Período
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {currentReport.report.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 text-muted-foreground leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!currentReport && !generating && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-2">Nenhum relatório gerado</h3>
            <p className="text-muted-foreground mb-4">
              Gere seu primeiro relatório para ver análises do seu negócio
            </p>
            <Button onClick={generateReport} className="rounded-full">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Primeiro Relatório
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {generating && !currentReport && (
        <Card>
          <CardContent className="py-8 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      )}

      {/* History */}
      {reportHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Histórico de Relatórios</CardTitle>
            <CardDescription>Relatórios gerados anteriormente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportHistory.slice(1).map((report, index) => (
                <div 
                  key={report.id || index}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => setCurrentReport(report)}
                  data-testid={`report-history-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Relatório {getPeriodLabel(report.period)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{report.data?.overview?.total_leads || 0} leads</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Relatórios Inteligentes
              </p>
              <p className="text-muted-foreground">
                Os relatórios são gerados com IA e incluem análises personalizadas 
                para o seu nicho de mercado. Gere relatórios diários, semanais ou mensais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="p-4 rounded-2xl bg-card border">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold font-heading">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

export default ReportsPage;
