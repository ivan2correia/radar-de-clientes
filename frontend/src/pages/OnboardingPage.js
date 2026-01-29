import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Radar, ArrowRight, Store, Scissors, Heart, Coffee, Wrench, ShoppingBag } from 'lucide-react';

const niches = [
  { value: 'salao_beleza', label: 'Salão de Beleza', icon: Scissors },
  { value: 'barbearia', label: 'Barbearia', icon: Scissors },
  { value: 'clinica_estetica', label: 'Clínica de Estética', icon: Heart },
  { value: 'restaurante', label: 'Restaurante/Café', icon: Coffee },
  { value: 'loja_roupas', label: 'Loja de Roupas', icon: ShoppingBag },
  { value: 'loja_geral', label: 'Loja/Comércio', icon: Store },
  { value: 'servicos_gerais', label: 'Prestador de Serviços', icon: Wrench },
  { value: 'outro', label: 'Outro', icon: Store }
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { createBusiness, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    description: '',
    city: '',
    state: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.niche) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      await createBusiness(formData);
      toast.success('Negócio configurado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao configurar negócio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Radar className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground">Radar de Clientes</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-lg border-0 shadow-xl bg-card/80 backdrop-blur-xl animate-slide-up">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl md:text-3xl">
              Olá, {user?.name?.split(' ')[0]}! 👋
            </CardTitle>
            <CardDescription className="text-base">
              Vamos configurar seu negócio para começar a descobrir oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nome do seu negócio *</Label>
                    <Input
                      id="business-name"
                      placeholder="Ex: Salão da Maria"
                      data-testid="business-name-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Qual é o seu ramo? *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {niches.map((niche) => {
                        const Icon = niche.icon;
                        return (
                          <button
                            key={niche.value}
                            type="button"
                            data-testid={`niche-${niche.value}`}
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-md ${
                              formData.niche === niche.value
                                ? 'border-primary bg-primary/10 shadow-lg'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setFormData({...formData, niche: niche.value})}
                          >
                            <Icon className={`w-5 h-5 mb-2 ${formData.niche === niche.value ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium">{niche.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button 
                    type="button"
                    className="w-full rounded-full h-12 text-base font-semibold"
                    data-testid="next-step-btn"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.niche}
                  >
                    Continuar <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade (opcional)</Label>
                    <Input
                      id="city"
                      placeholder="Ex: São Paulo"
                      data-testid="city-input"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado (opcional)</Label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => setFormData({...formData, state: value})}
                    >
                      <SelectTrigger data-testid="state-select">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição do negócio (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Conte um pouco sobre seu negócio..."
                      data-testid="description-input"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-full h-12"
                      onClick={() => setStep(1)}
                    >
                      Voltar
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 rounded-full h-12 text-base font-semibold"
                      data-testid="complete-setup-btn"
                      disabled={loading}
                    >
                      {loading ? 'Configurando...' : 'Começar!'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OnboardingPage;
