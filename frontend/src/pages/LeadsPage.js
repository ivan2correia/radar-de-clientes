import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { 
  Users, PlusCircle, Trash2, Phone, Mail, Link2, 
  ExternalLink, Eye, Target, FileText, Copy, Check
} from 'lucide-react';

const LeadsPage = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [activeTab, setActiveTab] = useState('leads');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', interest: '' });
  const [newPage, setNewPage] = useState({ 
    title: '', headline: '', description: '', offer: '', cta_text: 'Quero Participar' 
  });
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, pagesRes] = await Promise.all([
        api.get('/leads'),
        api.get('/landing-pages')
      ]);
      setLeads(leadsRes.data);
      setLandingPages(pagesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/leads', newLead);
      setLeads([response.data, ...leads]);
      setNewLead({ name: '', email: '', phone: '', interest: '' });
      setShowAddLead(false);
      toast.success('Lead adicionado!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao adicionar lead');
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await api.delete(`/leads/${leadId}`);
      setLeads(leads.filter(l => l.id !== leadId));
      toast.success('Lead removido');
    } catch (error) {
      toast.error('Erro ao remover lead');
    }
  };

  const handleUpdateStatus = async (leadId, status) => {
    try {
      await api.put(`/leads/${leadId}/status?status=${status}`);
      setLeads(leads.map(l => l.id === leadId ? {...l, status} : l));
      toast.success('Status atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleAddPage = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/landing-pages', newPage);
      setLandingPages([response.data, ...landingPages]);
      setNewPage({ title: '', headline: '', description: '', offer: '', cta_text: 'Quero Participar' });
      setShowAddPage(false);
      toast.success('Página criada!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar página');
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-primary',
      contacted: 'bg-amber-500',
      qualified: 'bg-emerald-500',
      converted: 'bg-green-600',
      lost: 'bg-slate-400'
    };
    return colors[status] || 'bg-slate-400';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Novo',
      contacted: 'Contatado',
      qualified: 'Qualificado',
      converted: 'Convertido',
      lost: 'Perdido'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Gestão de Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Capture e gerencie seus contatos em um só lugar
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="leads" className="flex items-center gap-2" data-testid="tab-leads">
            <Users className="w-4 h-4" />
            Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2" data-testid="tab-pages">
            <FileText className="w-4 h-4" />
            Páginas ({landingPages.length})
          </TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading">Seus Leads</CardTitle>
                <CardDescription>Contatos capturados e adicionados manualmente</CardDescription>
              </div>
              <Dialog open={showAddLead} onOpenChange={setShowAddLead}>
                <DialogTrigger asChild>
                  <Button className="rounded-full" data-testid="add-lead-btn">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Lead</DialogTitle>
                    <DialogDescription>Adicione um novo contato manualmente</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddLead} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lead-name">Nome *</Label>
                      <Input
                        id="lead-name"
                        placeholder="Nome do contato"
                        data-testid="lead-name-input"
                        value={newLead.name}
                        onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-email">Email</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        placeholder="email@exemplo.com"
                        data-testid="lead-email-input"
                        value={newLead.email}
                        onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-phone">Telefone</Label>
                      <Input
                        id="lead-phone"
                        placeholder="(11) 99999-9999"
                        data-testid="lead-phone-input"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-interest">Interesse</Label>
                      <Input
                        id="lead-interest"
                        placeholder="Ex: Corte de cabelo"
                        data-testid="lead-interest-input"
                        value={newLead.interest}
                        onChange={(e) => setNewLead({...newLead, interest: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full" data-testid="save-lead-btn">
                      Salvar Lead
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhum lead capturado ainda</p>
                  <Button onClick={() => setShowAddLead(true)} className="rounded-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Lead
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Interesse</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.id} data-testid={`lead-row-${lead.id}`}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {lead.email && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="w-3 h-3" /> {lead.email}
                                </span>
                              )}
                              {lead.phone && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" /> {lead.phone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{lead.interest || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {lead.source === 'manual' ? 'Manual' : 'Página'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lead.status}
                              onValueChange={(value) => handleUpdateStatus(lead.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(lead.status)}`} />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Novo</SelectItem>
                                <SelectItem value="contacted">Contatado</SelectItem>
                                <SelectItem value="qualified">Qualificado</SelectItem>
                                <SelectItem value="converted">Convertido</SelectItem>
                                <SelectItem value="lost">Perdido</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLead(lead.id)}
                              data-testid={`delete-lead-${lead.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Landing Pages Tab */}
        <TabsContent value="pages" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading">Páginas de Captura</CardTitle>
                <CardDescription>Crie ofertas para capturar leads automaticamente</CardDescription>
              </div>
              <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
                <DialogTrigger asChild>
                  <Button className="rounded-full" data-testid="create-page-btn">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Criar Página
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Criar Página de Captura</DialogTitle>
                    <DialogDescription>Crie uma oferta irresistível para capturar leads</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="page-title">Título da Página *</Label>
                      <Input
                        id="page-title"
                        placeholder="Ex: Avaliação Gratuita"
                        data-testid="page-title-input"
                        value={newPage.title}
                        onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="page-headline">Chamada Principal *</Label>
                      <Input
                        id="page-headline"
                        placeholder="Ex: Ganhe uma avaliação de pele 100% gratuita!"
                        data-testid="page-headline-input"
                        value={newPage.headline}
                        onChange={(e) => setNewPage({...newPage, headline: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="page-description">Descrição *</Label>
                      <Textarea
                        id="page-description"
                        placeholder="Descreva sua oferta..."
                        data-testid="page-description-input"
                        value={newPage.description}
                        onChange={(e) => setNewPage({...newPage, description: e.target.value})}
                        required
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="page-offer">Oferta/Brinde *</Label>
                      <Input
                        id="page-offer"
                        placeholder="Ex: Avaliação de Pele Gratuita"
                        data-testid="page-offer-input"
                        value={newPage.offer}
                        onChange={(e) => setNewPage({...newPage, offer: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="page-cta">Texto do Botão</Label>
                      <Input
                        id="page-cta"
                        placeholder="Quero Participar"
                        data-testid="page-cta-input"
                        value={newPage.cta_text}
                        onChange={(e) => setNewPage({...newPage, cta_text: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full" data-testid="save-page-btn">
                      Criar Página
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {landingPages.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhuma página criada ainda</p>
                  <Button onClick={() => setShowAddPage(true)} className="rounded-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Criar Primeira Página
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {landingPages.map((page) => (
                    <div 
                      key={page.id}
                      className="p-4 rounded-2xl border bg-card hover:shadow-md transition-all"
                      data-testid={`landing-page-${page.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-lg">{page.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{page.headline}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span>{page.visits} visitas</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Target className="w-4 h-4 text-muted-foreground" />
                              <span>{page.conversions} conversões</span>
                            </div>
                            <Badge variant="secondary">
                              {page.visits > 0 ? ((page.conversions / page.visits) * 100).toFixed(1) : 0}% conversão
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyLink(page.slug)}
                            data-testid={`copy-link-${page.id}`}
                          >
                            {copied === page.slug ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(`/p/${page.slug}`, '_blank')}
                            data-testid={`view-page-${page.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsPage;
