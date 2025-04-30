# app/routes/image.py

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from paddleocr import PaddleOCR
from langdetect import detect, LangDetectException
from app.routes.translate import translate_text, TranslationRequest
import os
import shutil

router = APIRouter()

ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Use English OCR config for general purposes

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image-translate")
async def image_translate(file: UploadFile = File(...), target_lang: str = Form(...)):
    try:
        # Save uploaded image
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Perform OCR
        result = ocr.ocr(file_path, cls=True)
        extracted_text = "\n".join([line[1][0] for block in result for line in block])

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text detected in image.")

        # Detect language
        try:
            source_lang = detect(extracted_text)
        except LangDetectException:
            raise HTTPException(status_code=400, detail="Could not detect language of the extracted text.")

        # Translate
        translation_request = TranslationRequest(
            text=extracted_text,
            source_lang=source_lang,
            target_lang=target_lang
        )

        translation_response = translate_text(translation_request)

        return {
            "extracted_text": extracted_text,
            "detected_language": source_lang,
            "translated_text": translation_response["translated_text"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
