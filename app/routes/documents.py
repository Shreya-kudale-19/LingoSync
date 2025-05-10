

from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
import os
from docx import Document
import PyPDF2
from fpdf import FPDF
from langdetect import detect, LangDetectException
from app.routes.translate import translate_text, TranslationRequest

router = APIRouter()

UPLOAD_DIR = "./uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
# os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text(file_path, extension):
    if extension == '.pdf':
        reader = PyPDF2.PdfReader(file_path)
        text = "\n\n".join([page.extract_text().strip() for page in reader.pages if page.extract_text()])
    elif extension == '.docx':
        doc = Document(file_path)
        text = "\n\n".join([para.text for para in doc.paragraphs])
    else:
        raise ValueError("Unsupported file format")

    try:
        lang = detect(text)
    except LangDetectException:
        lang = "eng_Latn"  # Fallback

    return text, lang

def save_to_pdf(text, output_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)
    for line in text.split('\n'):
        pdf.multi_cell(0, 10, line)
    pdf.output(output_path)

@router.post("/translate_document/")
async def translate_document(file: UploadFile = File(...), target_lang: str = Form(...)):
    filename = file.filename
    extension = os.path.splitext(filename)[1].lower()

    if extension not in ['.pdf', '.docx']:
        return JSONResponse(status_code=400, content={"error": "Only PDF and DOCX files are supported"})

    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        text, detected_lang = extract_text(file_path, extension)
        translation_request = TranslationRequest(
            text=text,
            source_lang=detected_lang,
            target_lang=target_lang
        )
        translation_response = translate_text(translation_request)
        translated_text = translation_response["translated_text"]
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Translation failed: {str(e)}"})

    output_pdf = os.path.join(UPLOAD_DIR, f"translated_{os.path.splitext(filename)[0]}.pdf")
    save_to_pdf(translated_text, output_pdf)

    return FileResponse(output_pdf, media_type="application/pdf", filename=os.path.basename(output_pdf))