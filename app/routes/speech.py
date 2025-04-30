# app/routes/speech.py

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import shutil
import speech_recognition as sr
from langdetect import detect, LangDetectException
from gtts import gTTS
from app.routes.translate import translate_text, TranslationRequest

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/speech-translate")
async def speech_translate(file: UploadFile = File(...), target_lang: str = Form(...)):
    try:
        # Save uploaded audio
        audio_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Recognize speech
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            try:
                transcription = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                raise HTTPException(status_code=400, detail="Could not understand the audio.")
            except sr.RequestError:
                raise HTTPException(status_code=500, detail="Speech recognition service error.")

        # Detect language
        try:
            source_lang = detect(transcription)
        except LangDetectException:
            raise HTTPException(status_code=400, detail="Could not detect language of the transcribed text.")

        # Translate
        translation_request = TranslationRequest(
            text=transcription,
            source_lang=source_lang,
            target_lang=target_lang
        )

        translation_response = translate_text(translation_request)

        # Text-to-speech for translated output
        tts = gTTS(translation_response["translated_text"], lang=target_lang)
        speech_output_path = os.path.join(UPLOAD_DIR, "translated_speech.mp3")
        tts.save(speech_output_path)

        return {
            "transcribed_text": transcription,
            "detected_language": source_lang,
            "translated_text": translation_response["translated_text"],
            "audio_url": f"/download/translated_speech.mp3"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
