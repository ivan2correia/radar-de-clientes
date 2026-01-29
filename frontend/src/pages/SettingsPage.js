import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { 
  Settings, User, Building, Moon, Sun, LogOut, Save
} from 'lucide-react';

const niches = [
  { value: 'salao_beleza', label: 'Salão de Beleza' },
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'clinica_estetica', label: 'Clínica de Estética' },
  { value: 'restaurante', label: 'Restaurante/Café' },
  { value: 'loja_roupas', label: 'Loja de Roupas' },
  { value: 'loja_geral', label: 'Loja/Comércio' },
  { value: 'servicos_gerais', label: 'Prestador de Serviços' },
  { value: 'outro', label: 'Outro' }
];

const SettingsPage = () => {
  const { user, business, updateBusiness, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  
  const [businessData, setBusinessData] = useState({
    name: business?.name || '',
    niche: business?.niche || '',
    description: business?.description || '',
    city: business?.city || '',
    state: business?.state || ''
  });

  const handleSaveBusiness = async () => {
    if (!businessData.name || !businessData.niche) {
      toast.error('Nome e nicho são obrigatórios');
      return;
    }
    
    setSaving(true);
    try {
      await updateBusiness(businessData);
      toast.success('Configurações salvas!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Até logo!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu perfil e preferências
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <User className="w-5 h-5" />
            Seu Perfil
          </CardTitle>
          <CardDescription>Informações da sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="font-heading font-bold text-2xl text-primary">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-heading font-semibold text-lg">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Building className="w-5 h-5" />
            Seu Negócio
          </CardTitle>
          <CardDescription>Configure as informações do seu negócio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Nome do Negócio *</Label>
              <Input
                id="business-name"
                placeholder="Ex: Salão da Maria"
                data-testid="settings-business-name"
                value={businessData.name}
                onChange={(e) => setBusinessData({...businessData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-niche">Nicho *</Label>
              <Select 
                value={businessData.niche} 
                onValueChange={(value) => setBusinessData({...businessData, niche: value})}
              >
                <SelectTrigger data-testid="settings-niche-select">
                  <SelectValue placeholder="Selecione o nicho" />
                </SelectTrigger>
                <SelectContent>
                  {niches.map(niche => (
                    <SelectItem key={niche.value} value={niche.value}>{niche.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-city">Cidade</Label>
              <Input
                id="business-city"
                placeholder="Ex: São Paulo"
                data-testid="settings-city"
                value={businessData.city}
                onChange={(e) => setBusinessData({...businessData, city: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-state">Estado</Label>
              <Select 
                value={businessData.state} 
                onValueChange={(value) => setBusinessData({...businessData, state: value})}
              >
                <SelectTrigger data-testid="settings-state-select">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-description">Descrição</Label>
            <Textarea
              id="business-description"
              placeholder="Descreva seu negócio..."
              data-testid="settings-description"
              value={businessData.description}
              onChange={(e) => setBusinessData({...businessData, description: e.target.value})}
              rows={3}
            />
          </div>
          <Button 
            onClick={handleSaveBusiness}
            disabled={saving}
            className="rounded-full"
            data-testid="save-settings-btn"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Aparência
          </CardTitle>
          <CardDescription>Personalize a interface do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Tema Escuro</p>
              <p className="text-sm text-muted-foreground">
                Ative para usar o modo escuro
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              data-testid="theme-toggle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logout Card */}
      <Card className="border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">Sair da Conta</p>
              <p className="text-sm text-muted-foreground">
                Encerrar sua sessão atual
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="rounded-full"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
