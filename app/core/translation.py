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
# # app/core/translation.py
# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
# import torch
# # from .utils import get_language_id
# from typing import Optional
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Model configuration
# MODEL_NAME = "facebook/nllb-200-1.3B"
# tokenizer: Optional[AutoTokenizer] = None
# model: Optional[AutoModelForSeq2SeqLM] = None
# device: Optional[str] = None

# def initialize_model():
#     """Initialize the 1.3B model with memory optimizations"""
#     global tokenizer, model, device
    
#     if model is None:
#         try:
#             logger.info("Loading 1.3B model...")
            
#             # Load with 4-bit quantization if CUDA available
#             if torch.cuda.is_available():
#                 from transformers import BitsAndBytesConfig
#                 quantization_config = BitsAndBytesConfig(
#                     load_in_4bit=True,
#                     bnb_4bit_compute_dtype=torch.float16,
#                     bnb_4bit_quant_type="nf4"
#                 )
                
#                 model = AutoModelForSeq2SeqLM.from_pretrained(
#                     MODEL_NAME,
#                     quantization_config=quantization_config,
#                     device_map="auto"
#                 )
#                 device = "cuda"
#             else:
#                 model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
#                 device = "cpu"
#                 model = model.to(device)
            
#             tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
            
#             logger.info(f"✓ 1.3B model loaded on {device.upper()}")
#             logger.info(f"Memory usage: {torch.cuda.memory_allocated()/1e9:.2f}GB") if device == "cuda" else None
#             # if 'hin_Deva' not in tokenizer.lang_code_to_id:
#             #     logger.warning("Hindi language code not found in tokenizer!")
            
#         except Exception as e:
#             logger.error(f"Model loading failed: {str(e)}")
#             raise RuntimeError("Failed to initialize 1.3B model")



# def translate(text: str, source_lang: str, target_lang: str) -> str:
#     """Translate text using the 1.3B model with chunking"""
#     initialize_model()
    
#     try:
#         # Validate input
#         if not text.strip():
#             raise ValueError("Input text cannot be empty")
        
#         # Set source language
#         tokenizer.src_lang = source_lang
#         tokenizer.tgt_lang = target_lang
#         # Process in chunks if text is long
#         max_chunk_size = 250 if device == "cuda" else 500
#         if len(text) > max_chunk_size:
#             return translate_long_text(text, source_lang, target_lang, max_chunk_size)
        
#         # Tokenize and translate
#         inputs = tokenizer(
#             text,
#             return_tensors="pt",
#             truncation=True,
#             max_length=512
#         ).to(device)
        
#         outputs = model.generate(
#             **inputs,
#             forced_bos_token_id=target_lang,
#             max_length=600,
#             num_beams=4,
#             early_stopping=True
#         )
        
#         return tokenizer.decode(outputs[0], skip_special_tokens=True)
        
#     except Exception as e:
#         logger.error(f"Translation failed: {str(e)}")
#         raise RuntimeError(f"Translation error: {str(e)}")

# def translate_long_text(text: str, src_lang: str, tgt_lang: str, chunk_size: int) -> str:
#     """Handle long text by splitting into chunks"""
#     chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
#     translations = []
    
#     for chunk in chunks:
#         try:
#             translated = translate(chunk, src_lang, tgt_lang)
#             translations.append(translated)
#             torch.cuda.empty_cache() if device == "cuda" else None
#         except Exception as e:
#             logger.warning(f"Chunk translation failed: {str(e)}")
#             translations.append(chunk)  # Fallback to original text
    
#     return " ".join(translations)
""""""
# Some models use 'hin_Deva' while others use 'hin'
# translation = translate('Hello', "eng_Latn", "mar_Deva")
# print(translation)

# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
# import torch
# from typing import Optional
# from .utils import get_language_id, get_supported_languages

# # Model configuration
# MODEL_NAME = "facebook/nllb-200-1.3B"
# tokenizer: Optional[AutoTokenizer] = None
# model: Optional[AutoModelForSeq2SeqLM] = None
# device: Optional[str] = None

# def initialize_model():
#     """Initialize the translation model and tokenizer."""
#     global tokenizer, model, device
    
#     if model is None:
#         try:
#             # Load tokenizer and model
#             tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
#             model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
            
#             # Set device and move model
#             device = "cuda" if torch.cuda.is_available() else "cpu"
#             model = model.to(device)
            
#             print(f"✓ Model successfully loaded on {device.upper()}")
#             print(f"✓ Available memory: {torch.cuda.memory_allocated()/1e9:.2f}GB/" 
#                   f"{torch.cuda.memory_reserved()/1e9:.2f}GB") if device == "cuda" else None
            
#         except Exception as e:
#             print(f"✗ Model initialization failed: {str(e)}")
#             raise RuntimeError("Failed to initialize translation model")

# def translate(text: str, source_lang: str, target_lang: str) -> str:
#     """Translate text from source to target language.
    
#     Args:
#         text: Input text to translate
#         source_lang: Source language code (e.g. 'eng_Latn')
#         target_lang: Target language code (e.g. 'fra_Latn')
    
#     Returns:
#         Translated text
    
#     Raises:
#         RuntimeError: If translation fails
#         ValueError: If input is invalid
#     """
#     # Ensure model is loaded
#     initialize_model()
    
#     try:
#         # Get language IDs
#         forced_bos_token_id = get_language_id(target_lang)
        
#         # Tokenize with source language
#         inputs = tokenizer(
#             text,
#             return_tensors="pt",
#             src_lang=source_lang,
#             truncation=True,
#             max_length=512
#         ).to(model.device)
        
#         # Generate translation
#         outputs = model.generate(
#             **inputs,
#             forced_bos_token_id=forced_bos_token_id,
#             max_length=600
#         )
        
#         return tokenizer.decode(outputs[0], skip_special_tokens=True)
        
#     except ValueError as e:
#         # Handle language code errors specifically
#         raise ValueError(f"Language error: {str(e)}")
#     except Exception as e:
#         raise RuntimeError(f"Translation failed: {str(e)}")
    
    # try:
    #     # Validate input
    #     if not text.strip():
    #         raise ValueError("Input text cannot be empty")
        
    #     if len(text) > 2000:
    #         raise ValueError("Input text too long (max 2000 characters)")
        
    #     # Set source language and tokenize
    #     tokenizer.src_lang = source_lang
    #     inputs = tokenizer(
    #         text,
    #         return_tensors="pt",
    #         truncation=True,
    #         max_length=512
    #     ).to(device)
        
    #     # Generate translation
    #     outputs = model.generate(
    #         **inputs,
    #         forced_bos_token_id=tokenizer.lang_code_to_id[target_lang],
    #         max_length=600,
    #         num_beams=4,
    #         early_stopping=True
    #     )
        
    #     # Decode and clean output
    #     return tokenizer.decode(outputs[0], skip_special_tokens=True)
        
    # except Exception as e:
    #     print(f"Translation error: {str(e)}")
    #     raise RuntimeError(f"Translation failed: {str(e)}")


"""most old code """
# # app/core/translation.py
# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
# import torch

# # Load NLLB model and tokenizer
# model_name = "facebook/nllb-200-1.3B"
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)

# def translate(text, source_lang, target_lang):
#     """Translates input text from source_lang to target_lang using the NLLB model."""
#     tokenizer.src_lang = source_lang
#     inputs = tokenizer(text, return_tensors="pt", padding=True).to(device)
#     translated_tokens = model.generate(**inputs, forced_bos_token_id=tokenizer.lang_code_to_id[target_lang])
#     return tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
