# 🌐 LingoSync: Multimodal Language Translation Web App

**LingoSync** is an AI-powered web application that performs real-time multilingual translation across **text**, **images**, and **speech** using state-of-the-art models. It supports 100+ languages and is optimized for speed, accessibility, and bias mitigation.

---

## 🚀 Core Features

- 📝 **Text-to-Text Translation**  
  Direct many-to-many translation using **Meta’s M2M100** model (no English pivot).

- 🖼️ **Image-to-Text Translation (OCR)**  
  Extract text from images using **PaddleOCR**, then translate it.

- 🎙️ **Speech-to-Text Translation**  
  Speech input handled via `SpeechRecognition` (Google/STT API) and translated using M2M100.

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
| **Models**   | M2M100, SpeechRecognition, PaddleOCR |
| **ML**       | Transformers, Torch, HuggingFace |
| **Others**   | gTTS, Langdetect, PyPDF2, RapidFuzz |
| **Deployment** | Docker, Uvicorn |
