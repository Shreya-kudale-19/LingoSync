# 🌐 LingoSync: Multimodal Language Translation Web App

**LingoSync** is an AI-powered web application that performs real-time multilingual translation across **text**, **images**, and **speech** using state-of-the-art models. It supports 100+ languages and is optimized for speed, accessibility, and bias mitigation.

---

## 🚀 Core Features

- 📝 **Text-to-Text Translation**  
  Direct many-to-many translation using **FaceBook’s NLLB-200** model (no English pivot).
  NLLB-200 is a machine translation model primarily intended for research in machine translation, - especially for low-resource languages.
  It allows for single sentence translation among 200 languages.

- 🖼️ **Image-to-Text Translation (OCR)**  
  Extract text from images using **PaddleOCR**, then translate it.

- 🎙️ **Speech-to-Text Translation**  
  Speech input handled via `SpeechRecognition` (Google/STT API) and translated using NLLB-200.

- ⚙️ **Bias Mitigation**  
  Reduces gender and cultural biases through counterfactual data augmentation.

- 🌐 **Multilingual Support**  
  100+ languages with auto-detection and improved performance for low-resource languages.

---

## 🧠 Tech Stack

| Layer        | Tools / Frameworks |
|--------------|---------------------|
| **Frontend** | React.js, Bootstrap |
| **Backend**  | FastAPI, Python 3.11 |
| **Models**   | NLLB-200, SpeechRecognition, PaddleOCR |
| **ML**       | Transformers, Torch, HuggingFace |
| **Others**   | gTTS, Langdetect, PyPDF2, RapidFuzz |
| **Deployment** | Docker, Uvicorn |
