# Guia de Configuração - Radar de Clientes

## ✅ Status da Instalação

O projeto foi configurado com sucesso no ambiente Manus. Todas as dependências foram instaladas.

## 📋 Estrutura do Projeto

```
Radar-de-Clientes-API-main/
├── backend/          # API FastAPI
│   ├── server.py     # Servidor principal
│   ├── requirements.txt
│   └── .env.example  # Template de variáveis de ambiente
└── frontend/         # Interface React
    ├── src/
    ├── package.json
    └── node_modules/ # ✅ Instalado
```

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente (Backend)

Crie o arquivo `.env` dentro da pasta `backend/` com as seguintes variáveis:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here

# Google Gemini AI Configuration
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here

# JWT Configuration (opcional - já tem valores padrão)
JWT_SECRET_KEY=radar-clientes-super-secret-key-2025
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### 2. Obter Credenciais

**Supabase:**
- Acesse: https://supabase.com
- Crie um projeto
- Copie a URL e a chave anon/service do painel

**Google Gemini:**
- Acesse: https://makersuite.google.com/app/apikey
- Crie uma chave de API

## 🚀 Como Executar

### Backend (API)
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Interface)
```bash
cd frontend
npm start
# ou
yarn start
```

O frontend estará disponível em: http://localhost:3000
O backend estará disponível em: http://localhost:8000

## 📦 Dependências Instaladas

### Backend (Python)
- ✅ FastAPI - Framework web
- ✅ Supabase - Banco de dados
- ✅ Google Generative AI - IA Gemini
- ✅ JWT/Passlib - Autenticação
- ✅ Todas as outras dependências do requirements.txt
- ⚠️ `emergentintegrations` foi removido (não disponível no PyPI)

### Frontend (React)
- ✅ React 19
- ✅ TailwindCSS
- ✅ Radix UI Components
- ✅ React Router
- ✅ Axios
- ✅ Todas as 1492 dependências instaladas

## 📝 Observações

1. O pacote `emergentintegrations==0.1.0` não foi instalado pois não existe no PyPI. Se for necessário, você precisará instalá-lo manualmente ou remover sua referência do código.

2. Todos os arquivos originais foram mantidos sem alterações.

3. O projeto está pronto para ser executado assim que você configurar as credenciais no arquivo `.env`.

## 🔗 Endpoints da API

Após iniciar o backend, acesse a documentação interativa:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
