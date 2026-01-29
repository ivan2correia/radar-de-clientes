import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Radar, Check, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPageView = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: ''
  });

  React.useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/p/${slug}`);
      setPageData(response.data);
    } catch (error) {
      toast.error('Página não encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Informe seu nome');
      return;
    }
    if (!formData.email && !formData.phone) {
      toast.error('Informe email ou telefone');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/p/${slug}/lead`, formData);
      setSubmitted(true);
      toast.success('Cadastro realizado!');
    } catch (error) {
      toast.error('Erro ao enviar cadastro');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-2">Página não encontrada</h1>
          <p className="text-muted-foreground">O link pode estar incorreto ou expirado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Radar className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-semibold text-sm text-muted-foreground">Radar de Clientes</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {submitted ? (
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl animate-slide-up">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold mb-2">Cadastro Realizado!</h2>
                <p className="text-muted-foreground">
                  Entraremos em contato em breve. Obrigado pelo interesse!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-xl animate-slide-up">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {pageData.headline}
                  </h1>
                  <p className="text-muted-foreground leading-relaxed">
                    {pageData.description}
                  </p>
                  <div className="mt-4 inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary font-medium">
                    🎁 {pageData.offer}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Como podemos te chamar?"
                      data-testid="landing-name-input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      data-testid="landing-email-input"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      data-testid="landing-phone-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full rounded-full h-14 text-lg font-semibold bg-secondary hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-all"
                    data-testid="landing-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      pageData.cta_text
                    )}
                  </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground mt-6">
                  Seus dados estão seguros e não serão compartilhados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground">
        Powered by Radar de Clientes
      </footer>
    </div>
  );
};

export default LandingPageView;
