"""
Model management and translation using Hugging Face transformers.

This module provides the JapaneseTranslator class for translating English text
to Japanese, with automatic conversion to hiragana and romaji representations.
"""

from dataclasses import dataclass

import pykakasi
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


PUNCTUATION = ".,。、!?！？"
DEFAULT_MODEL = "facebook/nllb-200-distilled-600M"


@dataclass
class TranslationResult:
    """
    A translation result containing Japanese text in multiple representations.

    Attributes:
        original: The original English text that was translated.
        japanese: The translation in natural Japanese (kanji/hiragana/katakana).
        hiragana: The reading in pure hiragana with spaces between words.
        romaji: The romanized pronunciation with spaces between words.
    """

    original: str
    japanese: str
    hiragana: str
    romaji: str


class JapaneseTranslator:
    """
    Translates English text to Japanese using the NLLB model.

    The translator loads lazily on first use and provides translations
    in three forms: natural Japanese, hiragana reading, and romaji.

    Attributes:
        model_name: The HuggingFace model identifier.
        model: The loaded translation model (None until load() is called).
        tokenizer: The model's tokenizer (None until load() is called).
        device: The torch device (cuda/mps/cpu) used for inference.
    """

    _SRC_LANG = "eng_Latn"
    _TGT_LANG = "jpn_Jpan"

    def __init__(self, model_name: str = DEFAULT_MODEL):
        """
        Initialize the translator.

        Args:
            model_name: HuggingFace model identifier. Defaults to NLLB.
        """
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.device = None
        self.kakasi = None
        self._loaded = False

    def load(self) -> None:
        """
        Load the model and tokenizer.

        This is called automatically on the first translation. The model
        is loaded to GPU (CUDA), Apple Silicon (MPS), or CPU based on
        availability.
        """
        if self._loaded:
            return

        print("Loading translation model... (this may take a moment on first run)")

        if torch.cuda.is_available():
            self.device = torch.device("cuda")
        elif torch.backends.mps.is_available():
            self.device = torch.device("mps")
        else:
            self.device = torch.device("cpu")

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        self.model.to(self.device)
        self.model.eval()
        self.tokenizer.src_lang = self._SRC_LANG
        self.kakasi = pykakasi.kakasi()

        self._loaded = True
        print("Model loaded successfully!\n")

    def _to_hiragana(self, text: str) -> str:
        """
        Convert Japanese text to hiragana with spaces between words.

        Args:
            text: Japanese text to convert.

        Returns:
            Hiragana representation with spaces between word segments.
        """
        result = self.kakasi.convert(text)
        parts = []
        for item in result:
            hira = item["hira"].strip()
            if hira and hira not in PUNCTUATION:
                parts.append(hira)
        return " ".join(parts)

    def _to_romaji(self, text: str) -> str:
        """
        Convert Japanese text to romaji with spaces between words.

        Args:
            text: Japanese text to convert.

        Returns:
            Romanized representation with spaces between word segments.
        """
        result = self.kakasi.convert(text)
        parts = []
        for item in result:
            romaji = item["hepburn"].strip()
            if romaji and romaji not in PUNCTUATION:
                parts.append(romaji)
        return " ".join(parts)

    def translate(self, text: str) -> TranslationResult:
        """
        Translate English text to Japanese.

        Args:
            text: English text to translate.

        Returns:
            TranslationResult with Japanese, hiragana, and romaji forms.
        """
        self.load()

        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        tgt_lang_id = self.tokenizer.convert_tokens_to_ids(self._TGT_LANG)

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=128,
                forced_bos_token_id=tgt_lang_id,
            )

        japanese = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        return TranslationResult(
            original=text,
            japanese=japanese,
            hiragana=self._to_hiragana(japanese),
            romaji=self._to_romaji(japanese),
        )
