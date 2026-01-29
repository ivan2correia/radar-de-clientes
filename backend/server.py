from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from jose import JWTError, jwt
from passlib.context import CryptContext
import google.generativeai as genai
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# JWT Config
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'radar-clientes-super-secret-key-2025')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

# Google Gemini Config
GOOGLE_GEMINI_API_KEY = os.environ.get('GOOGLE_GEMINI_API_KEY')
if GOOGLE_GEMINI_API_KEY:
    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Radar de Clientes API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: datetime

class BusinessCreate(BaseModel):
    name: str
    niche: str
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class BusinessResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    name: str
    niche: str
    description: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    created_at: datetime

class LeadCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    interest: Optional[str] = None
    source: str = "manual"

class LeadResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    business_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    interest: Optional[str] = None
    source: str
    status: str
    created_at: datetime

class CampaignCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    status: str = "draft"

class CampaignResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    business_id: str
    name: str
    type: str
    description: Optional[str] = None
    status: str
    created_at: datetime

class LandingPageCreate(BaseModel):
    title: str
    headline: str
    description: str
    offer: str
    cta_text: str = "Quero Participar"

class LandingPageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    business_id: str
    title: str
    headline: str
    description: str
    offer: str
    cta_text: str
    slug: str
    visits: int
    conversions: int
    created_at: datetime

class InsightRequest(BaseModel):
    niche: str
    city: Optional[str] = None
    type: str = "trends"  # trends, complaints, opportunities

class StrategyRequest(BaseModel):
    niche: str
    insight_type: str = "campaign"  # campaign, content, promotion

class ReportRequest(BaseModel):
    period: str = "weekly"  # daily, weekly, monthly

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ============== HELPER FUNCTIONS ==============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def parse_datetime(dt_value):
    """Parse datetime from string or return as is"""
    if isinstance(dt_value, str):
        return datetime.fromisoformat(dt_value.replace('Z', '+00:00'))
    return dt_value

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return result.data[0]

async def get_user_business(user: dict):
    result = supabase.table("businesses").select("*").eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Negócio não encontrado. Configure seu negócio primeiro.")
    return result.data[0]

async def generate_ai_content(prompt: str, system_message: str = None) -> str:
    if not GOOGLE_GEMINI_API_KEY:
        return "Chave de API do Gemini não configurada."
    
    try:
        model = genai.GenerativeModel('gemini-3-pro-preview')
        
        full_prompt = ""
        if system_message:
            full_prompt = f"{system_message}\n\n"
        full_prompt += prompt
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        logging.error(f"Erro ao gerar conteúdo com Gemini: {e}")
        return f"Erro ao processar: {str(e)}"

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    result = supabase.table("users").select("*").eq("email", user_data.email).execute()
    if result.data:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": get_password_hash(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    supabase.table("users").insert(user_doc).execute()
    token = create_access_token({"sub": user_id})
    return TokenResponse(access_token=token)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    result = supabase.table("users").select("*").eq("email", credentials.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    user = result.data[0]
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    token = create_access_token({"sub": user["id"]})
    return TokenResponse(access_token=token)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        created_at=parse_datetime(current_user["created_at"])
    )

# ============== BUSINESS ROUTES ==============

@api_router.post("/business", response_model=BusinessResponse)
async def create_business(data: BusinessCreate, current_user: dict = Depends(get_current_user)):
    result = supabase.table("businesses").select("*").eq("user_id", current_user["id"]).execute()
    if result.data:
        raise HTTPException(status_code=400, detail="Você já possui um negócio cadastrado")
    
    business_id = str(uuid.uuid4())
    business_doc = {
        "id": business_id,
        "user_id": current_user["id"],
        "name": data.name,
        "niche": data.niche,
        "description": data.description,
        "city": data.city,
        "state": data.state,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    supabase.table("businesses").insert(business_doc).execute()
    return BusinessResponse(**{**business_doc, "created_at": parse_datetime(business_doc["created_at"])})

@api_router.get("/business", response_model=BusinessResponse)
async def get_business(current_user: dict = Depends(get_current_user)):
    result = supabase.table("businesses").select("*").eq("user_id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Negócio não encontrado")
    business = result.data[0]
    business["created_at"] = parse_datetime(business["created_at"])
    return BusinessResponse(**business)

@api_router.put("/business", response_model=BusinessResponse)
async def update_business(data: BusinessCreate, current_user: dict = Depends(get_current_user)):
    result = supabase.table("businesses").update({
        "name": data.name,
        "niche": data.niche,
        "description": data.description,
        "city": data.city,
        "state": data.state
    }).eq("user_id", current_user["id"]).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Negócio não encontrado")
    
    business = result.data[0]
    business["created_at"] = parse_datetime(business["created_at"])
    return BusinessResponse(**business)

# ============== LEADS ROUTES ==============

@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(data: LeadCreate, current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    lead_id = str(uuid.uuid4())
    lead_doc = {
        "id": lead_id,
        "business_id": business["id"],
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "interest": data.interest,
        "source": data.source,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    supabase.table("leads").insert(lead_doc).execute()
    return LeadResponse(**{**lead_doc, "created_at": parse_datetime(lead_doc["created_at"])})

@api_router.get("/leads", response_model=List[LeadResponse])
async def get_leads(current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    result = supabase.table("leads").select("*").eq("business_id", business["id"]).order("created_at", desc=True).execute()
    
    leads = []
    for lead in result.data:
        lead["created_at"] = parse_datetime(lead["created_at"])
        leads.append(LeadResponse(**lead))
    
    return leads

@api_router.put("/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, status: str, current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    result = supabase.table("leads").update({"status": status}).eq("id", lead_id).eq("business_id", business["id"]).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    return {"message": "Status atualizado com sucesso"}

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    result = supabase.table("leads").delete().eq("id", lead_id).eq("business_id", business["id"]).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    return {"message": "Lead removido com sucesso"}

# ============== CAMPAIGNS ROUTES ==============

@api_router.post("/campaigns", response_model=CampaignResponse)
async def create_campaign(data: CampaignCreate, current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    campaign_id = str(uuid.uuid4())
    campaign_doc = {
        "id": campaign_id,
        "business_id": business["id"],
        "name": data.name,
        "type": data.type,
        "description": data.description,
        "status": data.status,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    supabase.table("campaigns").insert(campaign_doc).execute()
    return CampaignResponse(**{**campaign_doc, "created_at": parse_datetime(campaign_doc["created_at"])})

@api_router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    result = supabase.table("campaigns").select("*").eq("business_id", business["id"]).execute()
    
    campaigns = []
    for c in result.data:
        c["created_at"] = parse_datetime(c["created_at"])
        campaigns.append(CampaignResponse(**c))
    
    return campaigns

# ============== LANDING PAGES ROUTES ==============

@api_router.post("/landing-pages", response_model=LandingPageResponse)
async def create_landing_page(data: LandingPageCreate, current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    page_id = str(uuid.uuid4())
    slug = f"{business['id'][:8]}-{str(uuid.uuid4())[:8]}"
    
    page_doc = {
        "id": page_id,
        "business_id": business["id"],
        "title": data.title,
        "headline": data.headline,
        "description": data.description,
        "offer": data.offer,
        "cta_text": data.cta_text,
        "slug": slug,
        "visits": 0,
        "conversions": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    supabase.table("landing_pages").insert(page_doc).execute()
    return LandingPageResponse(**{**page_doc, "created_at": parse_datetime(page_doc["created_at"])})

@api_router.get("/landing-pages", response_model=List[LandingPageResponse])
async def get_landing_pages(current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    result = supabase.table("landing_pages").select("*").eq("business_id", business["id"]).execute()
    
    pages = []
    for p in result.data:
        p["created_at"] = parse_datetime(p["created_at"])
        pages.append(LandingPageResponse(**p))
    
    return pages

# Public endpoint for landing page
@api_router.get("/p/{slug}")
async def get_public_landing_page(slug: str):
    result = supabase.table("landing_pages").select("*").eq("slug", slug).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Página não encontrada")
    
    page = result.data[0]
    
    # Increment visits
    supabase.table("landing_pages").update({"visits": page["visits"] + 1}).eq("slug", slug).execute()
    
    return {
        "title": page["title"],
        "headline": page["headline"],
        "description": page["description"],
        "offer": page["offer"],
        "cta_text": page["cta_text"]
    }

# Public endpoint to capture lead from landing page
@api_router.post("/p/{slug}/lead")
async def capture_landing_page_lead(slug: str, data: LeadCreate):
    result = supabase.table("landing_pages").select("*").eq("slug", slug).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Página não encontrada")
    
    page = result.data[0]
    
    lead_id = str(uuid.uuid4())
    lead_doc = {
        "id": lead_id,
        "business_id": page["business_id"],
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "interest": data.interest or page["offer"],
        "source": f"landing_page:{slug}",
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    supabase.table("leads").insert(lead_doc).execute()
    supabase.table("landing_pages").update({"conversions": page["conversions"] + 1}).eq("slug", slug).execute()
    
    return {"message": "Cadastro realizado com sucesso!"}

# ============== AI INSIGHTS ROUTES ==============

@api_router.post("/insights/market")
async def get_market_insights(data: InsightRequest, current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    location = f" em {data.city}" if data.city else ""
    
    system_message = "Você é um consultor de marketing especializado em pequenos negócios brasileiros. Responda sempre em português do Brasil de forma clara e prática."
    
    prompts = {
        "trends": f"""Analise as principais tendências de mercado para o nicho de {data.niche}{location} no Brasil.
        
        Forneça:
        1. Os 5 serviços/produtos mais procurados atualmente
        2. 3 tendências emergentes
        3. Oportunidades sazonais para os próximos meses
        
        Formato: JSON com as chaves "servicos_populares", "tendencias", "oportunidades"
        """,
        "complaints": f"""Analise as principais reclamações e dores dos clientes no nicho de {data.niche}{location}.
        
        Forneça:
        1. As 5 principais reclamações dos clientes
        2. Problemas comuns com concorrentes
        3. Expectativas não atendidas
        
        Formato: JSON com as chaves "reclamacoes", "problemas_concorrentes", "expectativas"
        """,
        "opportunities": f"""Identifique oportunidades de negócio para o nicho de {data.niche}{location}.
        
        Forneça:
        1. 3 nichos de público pouco explorados
        2. 3 serviços/produtos com alta demanda e pouca oferta
        3. 3 estratégias para se diferenciar da concorrência
        
        Formato: JSON com as chaves "publicos", "gaps_mercado", "diferenciais"
        """
    }
    
    prompt = prompts.get(data.type, prompts["trends"])
    response = await generate_ai_content(prompt, system_message)
    
    # Save insight to database
    insight_doc = {
        "id": str(uuid.uuid4()),
        "business_id": business["id"],
        "type": data.type,
        "niche": data.niche,
        "content": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    supabase.table("insights").insert(insight_doc).execute()
    
    return {"insight": response, "type": data.type}

@api_router.post("/insights/strategy")
async def generate_strategy(data: StrategyRequest, current_user: dict = Depends(get_current_user)):
    system_message = "Você é um consultor de marketing especializado em pequenos negócios brasileiros. Responda sempre em português do Brasil de forma clara e prática."
    
    prompts = {
        "campaign": f"""Crie uma campanha de marketing para um negócio no nicho de {data.niche}.
        
        Inclua:
        1. Nome criativo da campanha
        2. Objetivo principal
        3. Público-alvo específico
        4. Oferta irresistível
        5. Chamada para ação
        6. Canais recomendados
        
        Formato: JSON com as chaves "nome", "objetivo", "publico", "oferta", "cta", "canais"
        """,
        "content": f"""Crie 5 ideias de conteúdo para redes sociais de um negócio no nicho de {data.niche}.
        
        Para cada ideia inclua:
        1. Tipo (Reels, Carrossel, Stories, Post)
        2. Tema/Título
        3. Gancho inicial (primeiras palavras)
        4. Hashtags sugeridas
        
        Formato: JSON array com as chaves "tipo", "tema", "gancho", "hashtags"
        """,
        "promotion": f"""Crie 3 estratégias promocionais para um negócio no nicho de {data.niche}.
        
        Para cada estratégia inclua:
        1. Nome da promoção
        2. Mecânica (como funciona)
        3. Duração sugerida
        4. Resultados esperados
        
        Formato: JSON array com as chaves "nome", "mecanica", "duracao", "resultados"
        """
    }
    
    prompt = prompts.get(data.insight_type, prompts["campaign"])
    response = await generate_ai_content(prompt, system_message)
    
    return {"strategy": response, "type": data.insight_type}

# ============== REPORTS ROUTES ==============

@api_router.get("/reports/dashboard")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    # Get counts
    leads_result = supabase.table("leads").select("id", count="exact").eq("business_id", business["id"]).execute()
    campaigns_result = supabase.table("campaigns").select("id", count="exact").eq("business_id", business["id"]).execute()
    pages_result = supabase.table("landing_pages").select("*").eq("business_id", business["id"]).execute()
    
    leads_count = leads_result.count or 0
    campaigns_count = campaigns_result.count or 0
    pages_count = len(pages_result.data) if pages_result.data else 0
    
    # Get recent leads
    recent_leads_result = supabase.table("leads").select("*").eq("business_id", business["id"]).order("created_at", desc=True).limit(5).execute()
    recent_leads = recent_leads_result.data if recent_leads_result.data else []
    
    # Get landing page stats
    pages = pages_result.data if pages_result.data else []
    
    total_visits = sum(p.get("visits", 0) for p in pages)
    total_conversions = sum(p.get("conversions", 0) for p in pages)
    conversion_rate = (total_conversions / total_visits * 100) if total_visits > 0 else 0
    
    # Get leads by status
    all_leads = supabase.table("leads").select("status").eq("business_id", business["id"]).execute()
    status_counts = {}
    if all_leads.data:
        for lead in all_leads.data:
            status = lead.get("status", "new")
            status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "overview": {
            "total_leads": leads_count,
            "total_campaigns": campaigns_count,
            "total_pages": pages_count,
            "total_visits": total_visits,
            "total_conversions": total_conversions,
            "conversion_rate": round(conversion_rate, 2)
        },
        "recent_leads": recent_leads,
        "leads_by_status": status_counts,
        "pages_performance": [{"title": p["title"], "visits": p["visits"], "conversions": p["conversions"]} for p in pages]
    }

@api_router.post("/reports/generate")
async def generate_report(data: ReportRequest, current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    # Get dashboard data
    dashboard = await get_dashboard_data(current_user)
    
    period_text = {
        "daily": "do dia",
        "weekly": "da semana",
        "monthly": "do mês"
    }.get(data.period, "semanal")
    
    system_message = "Você é um consultor de marketing especializado em pequenos negócios brasileiros. Responda de forma clara e prática."
    
    prompt = f"""Gere um relatório executivo {period_text} para um negócio do nicho {business['niche']}.
    
    Dados atuais:
    - Total de leads: {dashboard['overview']['total_leads']}
    - Campanhas ativas: {dashboard['overview']['total_campaigns']}
    - Páginas de captura: {dashboard['overview']['total_pages']}
    - Visitas totais: {dashboard['overview']['total_visits']}
    - Conversões: {dashboard['overview']['total_conversions']}
    - Taxa de conversão: {dashboard['overview']['conversion_rate']}%
    
    Inclua:
    1. Resumo executivo (2-3 frases)
    2. Principais conquistas
    3. Pontos de atenção
    4. 3 recomendações práticas para a próxima semana
    
    Use linguagem simples e direta, como se falasse com um empresário ocupado.
    """
    
    response = await generate_ai_content(prompt, system_message)
    
    # Save report
    report_doc = {
        "id": str(uuid.uuid4()),
        "business_id": business["id"],
        "period": data.period,
        "data": dashboard,
        "analysis": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    supabase.table("reports").insert(report_doc).execute()
    
    return {
        "report": response,
        "data": dashboard,
        "period": data.period,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/reports/history")
async def get_reports_history(current_user: dict = Depends(get_current_user)):
    business = await get_user_business(current_user)
    
    result = supabase.table("reports").select("*").eq("business_id", business["id"]).order("created_at", desc=True).limit(10).execute()
    
    return result.data if result.data else []

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "Radar de Clientes API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Configure CORS BEFORE including router
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
