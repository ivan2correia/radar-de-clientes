import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Radar, TrendingUp, Users, BarChart3 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await register(registerData.name, registerData.email, registerData.password);
      toast.success('Conta criada com sucesso!');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar conta');
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
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 md:p-8 gap-8 lg:gap-16">
        {/* Left Side - Hero */}
        <div className="flex-1 max-w-xl text-center lg:text-left animate-fade-in">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Descubra o que seus <span className="text-primary">clientes</span> querem
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Inteligência de mercado automatizada para pequenos negócios. 
            Entenda tendências, capture leads e cresça suas vendas.
          </p>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <FeatureCard icon={TrendingUp} title="Tendências" desc="Saiba o que está em alta" />
            <FeatureCard icon={Users} title="Leads" desc="Capture clientes potenciais" />
            <FeatureCard icon={BarChart3} title="Relatórios" desc="Dados que fazem sentido" />
            <FeatureCard icon={Radar} title="Estratégias" desc="Campanhas prontas com IA" />
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="w-full max-w-md animate-slide-up">
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-heading text-2xl">Bem-vindo!</CardTitle>
              <CardDescription>Entre ou crie sua conta para começar</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="login-tab">Entrar</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Criar Conta</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        data-testid="login-email-input"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        data-testid="login-password-input"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-full h-12 text-base font-semibold"
                      data-testid="login-submit-btn"
                      disabled={loading}
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Seu Nome</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="João Silva"
                        data-testid="register-name-input"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        data-testid="register-email-input"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        data-testid="register-password-input"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirmar Senha</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="••••••••"
                        data-testid="register-confirm-input"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-full h-12 text-base font-semibold"
                      data-testid="register-submit-btn"
                      disabled={loading}
                    >
                      {loading ? 'Criando...' : 'Criar Conta Grátis'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © 2025 Radar de Clientes. Todos os direitos reservados.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <Icon className="w-6 h-6 text-primary mb-2" />
    <h3 className="font-heading font-semibold text-sm text-foreground">{title}</h3>
    <p className="text-xs text-muted-foreground">{desc}</p>
  </div>
);

export default LoginPage;
