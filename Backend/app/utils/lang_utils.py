# app/utils/lang_utils.py
import json
from pathlib import Path
from typing import Dict, Any

# Load language data from JSON
LANG_DATA: Dict[str, Dict[str, str]] = {}
try:
    with open(Path(__file__).parent / "langs.json", "r") as f:
        LANG_DATA = json.load(f)
except FileNotFoundError:
    raise RuntimeError("Missing langs.json file")
except json.JSONDecodeError:
    raise RuntimeError("Invalid langs.json format")

def get_code(language_input: str, code_type: str) -> str:
    """Get specific code type for a language"""
    language_input = language_input.lower().strip()
    
    # Check direct matches first
    for lang, codes in LANG_DATA.items():
        if language_input in [lang, codes.get('iso_639_1'), codes.get('iso_639_3')]:
            if code_type in codes:
                return codes[code_type]
            raise ValueError(f"No {code_type} code for {lang}")
    
    # Check partial matches
    for lang, codes in LANG_DATA.items():
        if any(language_input in code.lower() for code in codes.values()):
            if code_type in codes:
                return codes[code_type]
            raise ValueError(f"No {code_type} code for {lang}")
    
    raise ValueError(f"Unsupported language: {language_input}")

def is_supported(language_input: str) -> bool:
    """Check if language is supported"""
    try:
        get_code(language_input, 'bos')
        return True
    except ValueError:
        return False