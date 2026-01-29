# Radar de Clientes - Product Requirements Document (PRD)

## Visão Geral
**Nome:** Radar de Clientes  
**Versão:** 1.0.0  
**Data:** 28 de Janeiro de 2026  
**Tipo:** SaaS para pequenos negócios brasileiros

## Problema
Pequenos negócios (salões, barbearias, clínicas, lojas) não têm acesso fácil a inteligência de mercado e ferramentas de marketing digital. Precisam de soluções simples, visuais e práticas.

## Solução
Sistema SaaS que fornece:
- Análise automática de tendências e dores do mercado
- Geração de estratégias de marketing com IA
- Captura e gestão de leads
- Relatórios automáticos

## Personas
1. **Maria (Salão de Beleza)** - 35 anos, dona de salão, pouco tempo, usa celular
2. **João (Barbearia)** - 28 anos, barbeiro autônomo, quer crescer clientela
3. **Ana (Clínica Estética)** - 40 anos, precisa de leads qualificados

## Stack Tecnológico
- **Frontend:** React 19 + Tailwind CSS + Shadcn/UI
- **Backend:** FastAPI (Python)
- **Banco de Dados:** MongoDB
- **IA:** Gemini 3 Flash via Emergent Integrations
- **Autenticação:** JWT customizado

---

## O que foi implementado ✅

### Módulo 1 - Inteligência de Mercado (Radar)
- [x] Análise de tendências do nicho
- [x] Identificação de reclamações e dores
- [x] Descoberta de oportunidades
- [x] Integração com Gemini 3 Flash

### Módulo 2 - Gerador de Estratégias
- [x] Geração de campanhas completas
- [x] Sugestões de conteúdo para redes sociais
- [x] Estratégias promocionais

### Módulo 3 - Captura de Leads
- [x] Criação de landing pages
- [x] Formulário de captura público
- [x] Gestão de leads (CRUD)
- [x] Status de leads (Novo, Contatado, Qualificado, Convertido, Perdido)

### Módulo 4 - Dashboard
- [x] Métricas principais (leads, campanhas, visitas, conversão)
- [x] Leads recentes
- [x] Performance de páginas
- [x] Ações rápidas

### Módulo 5 - Relatórios
- [x] Geração de relatórios (diário, semanal, mensal)
- [x] Análise com IA
- [x] Histórico de relatórios

### Autenticação e UX
- [x] Registro e login JWT
- [x] Onboarding de negócio
- [x] Tema claro/escuro
- [x] Design mobile-first responsivo
- [x] Interface em português do Brasil

---

## Backlog - Próximas Implementações

### P0 (Alta Prioridade)
- [ ] Integração com Meta Ads (já há playbook)
- [ ] Integração com Google Trends API
- [ ] Notificações por email de novos leads
- [ ] Webhooks para automações

### P1 (Média Prioridade)
- [ ] Agendamento de relatórios automáticos
- [ ] Templates de landing pages
- [ ] Integração WhatsApp Business
- [ ] Dashboard de métricas avançadas

### P2 (Baixa Prioridade)
- [ ] App mobile nativo
- [ ] Multi-usuários por negócio
- [ ] Planos de assinatura (Stripe)
- [ ] White-label para agências

---

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário

### Negócio
- `POST /api/business` - Criar negócio
- `GET /api/business` - Obter negócio
- `PUT /api/business` - Atualizar negócio

### Leads
- `POST /api/leads` - Criar lead
- `GET /api/leads` - Listar leads
- `PUT /api/leads/{id}/status` - Atualizar status
- `DELETE /api/leads/{id}` - Remover lead

### Landing Pages
- `POST /api/landing-pages` - Criar página
- `GET /api/landing-pages` - Listar páginas
- `GET /api/p/{slug}` - Página pública
- `POST /api/p/{slug}/lead` - Capturar lead

### IA/Insights
- `POST /api/insights/market` - Análise de mercado
- `POST /api/insights/strategy` - Gerar estratégia

### Relatórios
- `GET /api/reports/dashboard` - Dados do dashboard
- `POST /api/reports/generate` - Gerar relatório
- `GET /api/reports/history` - Histórico

---

## Notas Técnicas
- Integração IA via Emergent LLM Key (Universal Key)
- MongoDB para persistência
- JWT para autenticação
- Shadcn/UI para componentes
- Fontes: Outfit (headings) + Figtree (body)
