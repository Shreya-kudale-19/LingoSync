# app/routes/translate.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.translation import translate  # Import the translate function


router = APIRouter()

# Request model for translation input
class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

@router.post("/translate")
def translate_text(req: TranslationRequest):
    """Handles text translation using the NLLB model."""
    try:
        # Use the shared translation function
        translated_text = translate(req.text, req.source_lang, req.target_lang)
        return {"translated_text": translated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
