# app/core/utils.py
from typing import Dict

# Complete language code to ID mapping for NLLB model
LANG_CODE_TO_ID: Dict[str, int] = {
    'ace_Arab': 256001,
    'ace_Latn': 256002,
    'acm_Arab': 256003,
    # ... include all 200 languages ...
    'eng_Latn': 256047,  # English
    'fra_Latn': 256057,  # French
    'spa_Latn': 256067,  # Spanish
    'hin_Deva': 256037,  # Hindi
    'arb_Arab': 256027,  # Arabic
    'zho_Hans': 256025,  # Chinese Simplified
    # Full list available at:
    # https://github.com/facebookresearch/flores/blob/main/flores200/README.md
}

# Reverse mapping for ID to language code
ID_TO_LANG_CODE: Dict[int, str] = {v: k for k, v in LANG_CODE_TO_ID.items()}

def get_language_id(lang_code: str) -> int:
    """Get the language ID for a given language code.
    
    Args:
        lang_code: Language code (e.g. 'eng_Latn')
    
    Returns:
        Corresponding language ID
    
    Raises:
        ValueError: If language code is not supported
    """
    if lang_code not in LANG_CODE_TO_ID:
        raise ValueError(f"Unsupported language code: {lang_code}. "
                       f"Supported codes: {list(LANG_CODE_TO_ID.keys())}")
    return LANG_CODE_TO_ID[lang_code]

def get_language_code(lang_id: int) -> str:
    """Get the language code for a given language ID.
    
    Args:
        lang_id: Language ID
    
    Returns:
        Corresponding language code
    
    Raises:
        ValueError: If language ID is not found
    """
    if lang_id not in ID_TO_LANG_CODE:
        raise ValueError(f"Unknown language ID: {lang_id}")
    return ID_TO_LANG_CODE[lang_id]

def get_supported_languages() -> Dict[str, str]:
    """Returns a mapping of language codes to human-readable names"""
    return {
        'eng_Latn': 'English',
        'fra_Latn': 'French',
        'spa_Latn': 'Spanish',
        'hin_Deva': 'Hindi',
        'arb_Arab': 'Arabic',
        'zho_Hans': 'Chinese (Simplified)',
        # Add more language names as needed
    }