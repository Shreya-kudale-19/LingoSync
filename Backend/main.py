from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import documents, image, speech, translate
from app.core.translation import initialize_pipeline
import os
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    try:
        logger.info("Initializing translation model...")
        initialize_pipeline()
        logger.info("✅ Translation model ready")
    except Exception as e:
        logger.error(f"❌ Model initialization failed: {str(e)}")
        raise
    
    yield  # App runs here
    
    logger.info("🛑 Shutting down...")

app = FastAPI(
    title="LingoSync API",
    description="LingoSync Deployment - Multi-modal Translation Service",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
    servers=[{
        "url": "https://8000-whitedevil201-lingosync-swbz6wg8mci.ws-us118.gitpod.io",
        "url": "https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io",
        "description": "Gitpod Development Server"
    }]
)

# CORS Configuration for Gitpod
gitpod_origin = "https://3000-whitedevil201-lingosync-swbz6wg8mci.ws-us118.gitpod.io", "https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        gitpod_origin,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with Gitpod-optimized prefixes
app.include_router(
    translate.router,
    prefix="/api/translate",
    tags=["Text Translation"]
)

app.include_router(
    documents.router,
    prefix="/api/documents",
    tags=["Document Translation"]
)

app.include_router(
    image.router,
    prefix="/api/images",
    tags=["Image Translation"]
)

app.include_router(
    speech.router,
    prefix="/api/speech",
    tags=["Speech Translation"]
)

@app.get("/")
def health_check():
    return {
        "status": "running",
        "docs": "https://8000-whitedevil201-lingosync-swbz6wg8mci.ws-us118.gitpod.io/docs",
        "docs": "https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io//docs",
        "api_base": "https://8000-whitedevil201-lingosync-swbz6wg8mci.ws-us118.gitpod.io/api",
        "api_base": "https://8000-whitedevil201-lingosync-kaay4x8p29x.ws-us118.gitpod.io/api"
    }
