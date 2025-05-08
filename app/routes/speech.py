# app/routes/speech.py

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import shutil
import speech_recognition as sr
from langdetect import detect, LangDetectException
from gtts import gTTS
from gtts.lang import tts_langs
from pathlib import Path
from app.routes.translate import translate_text, TranslationRequest
from app.utils.lang_utils import get_code, is_supported

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/speech-translate")
async def speech_translate(file: UploadFile = File(...), target_lang: str = Form(...)):
    # Generate unique filename
    temp_filename = f"temp_{os.urandom(4).hex()}_{file.filename}"
    audio_path = os.path.join(UPLOAD_DIR, temp_filename)
    
    try:
        # Validate language support
        if not is_supported(target_lang):
            raise HTTPException(400, f"Language not supported: {target_lang}")

        # Save uploaded audio
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Recognize speech with language hint
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            try:
                transcription = recognizer.recognize_google(
                    audio_data,
                    language=get_code(target_lang, 'iso_639_1')  # Helps recognition accuracy
                )
            except sr.UnknownValueError:
                raise HTTPException(400, "Audio not understandable - possibly wrong language or poor quality")
            except sr.RequestError as e:
                raise HTTPException(502, f"Speech API error: {str(e)}")

        # Detect language with fallback
        try:
            detected_lang = detect(transcription[:5000])  # Limit for performance
            bos_source_lang = get_code(detected_lang, 'bos')
        except (LangDetectException, ValueError):
            # If detection fails, assume it's in target language
            bos_source_lang = get_code(target_lang, 'bos')

        # Get proper codes
        bos_target_lang = get_code(target_lang, 'bos')
        gtts_lang = get_code(target_lang, 'gtts')

        # Verify TTS support
        if gtts_lang not in tts_langs():
            raise HTTPException(400, f"Text-to-speech not available for {target_lang}")

        # Translate
        translation = translate_text(TranslationRequest(
            text=transcription,
            source_lang=bos_source_lang,
            target_lang=bos_target_lang
        ))

        # Generate speech output
        output_filename = f"translated_{gtts_lang}_{os.urandom(2).hex()}.mp3"
        speech_path = os.path.join(UPLOAD_DIR, output_filename)
        
        tts = gTTS(
            text=translation["translated_text"],
            lang=gtts_lang,
            slow=False  # Faster speech rate
        )
        tts.save(speech_path)

        return {
            "transcription": transcription,
            "detected_language": detected_lang if 'detected_lang' in locals() else target_lang,
            "translated_text": translation["translated_text"],
            "audio_url": f"/downloads/{output_filename}"
        }

    except HTTPException:
        raise  # Re-raise existing HTTP exceptions
    except Exception as e:
        raise HTTPException(500, f"Processing error: {str(e)}")
    finally:
        # Clean up temporary files
        if os.path.exists(audio_path):
            os.remove(audio_path)
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# import os
# import shutil
# import speech_recognition as sr
# from langdetect import detect, LangDetectException
# from gtts import gTTS
# from app.routes.translate import translate_text, TranslationRequest

# router = APIRouter()

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# @router.post("/speech-translate")
# async def speech_translate(file: UploadFile = File(...), target_lang: str = Form(...)):
#     try:
#         # Save uploaded audio
#         audio_path = os.path.join(UPLOAD_DIR, file.filename)
#         with open(audio_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         # Recognize speech
#         recognizer = sr.Recognizer()
#         with sr.AudioFile(audio_path) as source:
#             audio_data = recognizer.record(source)
#             try:
#                 transcription = recognizer.recognize_google(audio_data)
#             except sr.UnknownValueError:
#                 raise HTTPException(status_code=400, detail="Could not understand the audio.")
#             except sr.RequestError:
#                 raise HTTPException(status_code=500, detail="Speech recognition service error.")

#         # Detect language
#         try:
#             source_lang = detect(transcription)
#         except LangDetectException:
#             raise HTTPException(status_code=400, detail="Could not detect language of the transcribed text.")

#         # Translate
#         translation_request = TranslationRequest(
#             text=transcription,
#             source_lang=source_lang,
#             target_lang=target_lang
#         )

#         translation_response = translate_text(translation_request)

#         # Text-to-speech for translated output
#         tts = gTTS(translation_response["translated_text"], lang=target_lang)
#         speech_output_path = os.path.join(UPLOAD_DIR, "translated_speech.mp3")
#         tts.save(speech_output_path)

#         return {
#             "transcribed_text": transcription,
#             "detected_language": source_lang,
#             "translated_text": translation_response["translated_text"],
#             "audio_url": f"/download/translated_speech.mp3"
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
