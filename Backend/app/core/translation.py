# app/core/translation.py
from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer, BitsAndBytesConfig
import torch
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model configuration
MODEL_NAME = "facebook/nllb-200-1.3B"
translator_pipeline = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def initialize_pipeline():
    """Initialize the translation pipeline with memory optimizations"""
    global translator_pipeline
    
    if translator_pipeline is None:
        try:
            logger.info("Loading 1.3B model pipeline...")
            
            # Load with 4-bit quantization if CUDA available
            if torch.cuda.is_available():
                quant_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_quant_type="nf4"
                )
                
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    MODEL_NAME,
                    quantization_config=quant_config,
                    device_map="auto"
                )
                tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
                
                translator_pipeline = pipeline(
                    "translation",
                    model=model,
                    tokenizer=tokenizer,
                    device=0,  # Use first GPU
                    torch_dtype=torch.float16
                )
            else:
                translator_pipeline = pipeline(
                    "translation",
                    model=MODEL_NAME,
                    device=-1,  # CPU
                )
            
            logger.info(f"✓ Pipeline loaded on {device.upper()}")
            if device == "cuda":
                logger.info(f"Memory usage: {torch.cuda.memory_allocated()/1e9:.2f}GB")
            
        except Exception as e:
            logger.error(f"Pipeline initialization failed: {str(e)}")
            raise RuntimeError("Failed to initialize translation pipeline")

def translate(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text using the pipeline with chunking"""
    initialize_pipeline()
    
    try:
        # Validate input
        if not text.strip():
            raise ValueError("Input text cannot be empty")
        
        # Process in chunks if text is long
        max_chunk_size = 250 if device == "cuda" else 500
        if len(text) > max_chunk_size:
            return translate_long_text(text, source_lang, target_lang, max_chunk_size)
        
        # Set languages and translate
        result = translator_pipeline(
            text,
            src_lang=source_lang,
            tgt_lang=target_lang,
            max_length=600
        )
        return result[0]['translation_text']
        
    except Exception as e:
        logger.error(f"Translation failed: {str(e)}")
        raise RuntimeError(f"Translation error: {str(e)}")

def translate_long_text(text: str, src_lang: str, tgt_lang: str, chunk_size: int) -> str:
    """Handle long text by splitting into chunks"""
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    translations = []
    
    for chunk in chunks:
        try:
            translated = translate(chunk, src_lang, tgt_lang)
            translations.append(translated)
            torch.cuda.empty_cache() if device == "cuda" else None
        except Exception as e:
            logger.warning(f"Chunk translation failed: {str(e)}")
            translations.append(chunk)  # Fallback to original text
    
    return " ".join(translations)
