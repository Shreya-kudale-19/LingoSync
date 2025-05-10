# app/routes/speech.py

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import shutil
import speech_recognition as sr
from langdetect import detect_langs, LangDetectException
from gtts import gTTS
from gtts.lang import tts_langs
from io import BytesIO
import base64
from app.routes.translate import translate_text, TranslationRequest
from app.utils.lang_utils import get_code, is_supported

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/speech-translate")
async def speech_translate(file: UploadFile = File(...), target_lang: str = Form(...)):
    if not is_supported(target_lang):
        raise HTTPException(400, f"Language not supported: {target_lang}")

    temp_filename = f"temp_{os.urandom(4).hex()}_{file.filename}"
    audio_path = os.path.join(UPLOAD_DIR, temp_filename)

    try:
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)

            try:
                transcription = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                raise HTTPException(400, "Could not understand audio")
            except sr.RequestError as e:
                raise HTTPException(502, f"Speech recognition service error: {e}")

        # Detect language from transcription
        try:
            lang_probs = detect_langs(transcription)
            top_lang = lang_probs[0]
            if top_lang.prob < 0.7:
                raise HTTPException(400, f"Low confidence in detected language: {top_lang.lang} ({top_lang.prob:.2f})")
            detected_lang = top_lang.lang
        except LangDetectException:
            raise HTTPException(400, "Could not detect language of transcription")

        bos_source = get_code(detected_lang, 'bos')
        bos_target = get_code(target_lang, 'bos')
        gtts_code = get_code(target_lang, 'gtts')

        if bos_source == bos_target:
            raise HTTPException(400, "Source and target languages are the same")

        if gtts_code not in tts_langs():
            raise HTTPException(400, f"TTS not supported for {target_lang}")

        translation = translate_text(TranslationRequest(
            text=transcription,
            source_lang=bos_source,
            target_lang=bos_target
        ))

        tts = gTTS(
            text=translation["translated_text"],
            lang=gtts_code,
            slow=False
        )
        audio_io = BytesIO()
        tts.write_to_fp(audio_io)
        audio_io.seek(0)
        audio_base64 = base64.b64encode(audio_io.read()).decode("utf-8")

        return {
            "transcription": transcription,
            "detected_language": detected_lang,
            "translated_text": translation["translated_text"],
            "audio_base64": audio_base64
        }

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


