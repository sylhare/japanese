"""Model management and translation using Hugging Face transformers."""

from dataclasses import dataclass
from typing import Optional

import pykakasi
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


@dataclass
class TranslationResult:
    """A single translation result with all forms."""

    japanese: str  # Mixed kanji/hiragana/katakana as naturally written
    hiragana: str  # Pure hiragana reading
    romaji: str  # Romanized version
    confidence: float = 1.0


@dataclass
class TranslationResponse:
    """Complete translation response with main result and alternatives."""

    original: str
    main: TranslationResult
    alternatives: list[TranslationResult]
    note: Optional[str] = None  # Optional note about the translation


class JapaneseTranslator:
    """Handles English to Japanese translation using Hugging Face models."""

    # Model-specific configuration for multilingual models
    MODEL_CONFIG = {
        "facebook/mbart-large-50-many-to-many-mmt": {
            "src_lang": "en_XX",
            "tgt_lang": "ja_XX",
            "multilingual": True,
        },
        "facebook/nllb-200-distilled-600M": {
            "src_lang": "eng_Latn",
            "tgt_lang": "jpn_Jpan",
            "multilingual": True,
        },
    }

    def __init__(self, model_name: str = "facebook/nllb-200-distilled-600M"):
        """
        Initialize the translator with a specified model.

        Args:
            model_name: HuggingFace model identifier for English-Japanese translation
        """
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.device = None
        self.kakasi = None
        self._loaded = False
        self._config = self.MODEL_CONFIG.get(model_name, {"multilingual": False})

    def load(self) -> None:
        """Load the model and tokenizer. Called lazily on first translation."""
        if self._loaded:
            return

        print("Loading translation model... (this may take a moment on first run)")

        # Determine device
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
        elif torch.backends.mps.is_available():
            self.device = torch.device("mps")
        else:
            self.device = torch.device("cpu")

        # Load model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        self.model.to(self.device)
        self.model.eval()

        # Set source language for multilingual models
        if self._config.get("multilingual") and self._config.get("src_lang"):
            self.tokenizer.src_lang = self._config["src_lang"]

        # Initialize kakasi for romaji conversion
        self.kakasi = pykakasi.kakasi()

        self._loaded = True
        print("Model loaded successfully!\n")

    def _to_hiragana(self, text: str) -> str:
        """Convert Japanese text to hiragana."""
        result = self.kakasi.convert(text)
        return "".join(item["hira"] for item in result)

    def _to_romaji(self, text: str) -> str:
        """Convert Japanese text to romaji."""
        result = self.kakasi.convert(text)
        # Join without extra spaces - pykakasi already handles word boundaries
        return "".join(item["hepburn"] for item in result)

    def _create_result(self, japanese: str, confidence: float = 1.0) -> TranslationResult:
        """Create a TranslationResult from Japanese text."""
        return TranslationResult(
            japanese=japanese,
            hiragana=self._to_hiragana(japanese),
            romaji=self._to_romaji(japanese),
            confidence=confidence,
        )

    def translate(
        self,
        text: str,
        num_alternatives: int = 2,
        prefer_native: bool = True,
    ) -> TranslationResponse:
        """
        Translate English text to Japanese.

        Args:
            text: English text to translate
            num_alternatives: Number of alternative translations to generate
            prefer_native: Prefer native Japanese words over loanwords (katakana)

        Returns:
            TranslationResponse with main translation and alternatives
        """
        self.load()

        # Tokenize input
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Generate multiple translations using beam search
        num_beams = max(5, num_alternatives + 1)
        num_return_sequences = num_alternatives + 1

        # Prepare generation kwargs
        gen_kwargs = {
            "max_length": 128,
            "num_beams": num_beams,
            "num_return_sequences": num_return_sequences,
            "early_stopping": True,
        }

        # For multilingual models, set the forced BOS token for target language
        if self._config.get("multilingual") and self._config.get("tgt_lang"):
            tgt_lang_id = self.tokenizer.convert_tokens_to_ids(self._config["tgt_lang"])
            gen_kwargs["forced_bos_token_id"] = tgt_lang_id

        with torch.no_grad():
            outputs = self.model.generate(**inputs, **gen_kwargs)

        # Decode outputs
        translations = self.tokenizer.batch_decode(outputs, skip_special_tokens=True)

        # Process results
        results = []
        seen = set()

        for i, japanese in enumerate(translations):
            if japanese in seen:
                continue
            seen.add(japanese)

            # Calculate confidence (decreases for later results)
            confidence = 1.0 - (i * 0.1)
            results.append(self._create_result(japanese, confidence))

        # Main result is the first one
        main_result = results[0] if results else self._create_result("")

        # Alternatives are the rest
        alternatives = results[1 : num_alternatives + 1]

        # Add note for beginners if relevant
        note = None
        if prefer_native and any("ー" in r.japanese for r in results):
            note = "💡 Some alternatives use katakana (loanwords). Native Japanese words are often preferred for beginners."

        return TranslationResponse(
            original=text,
            main=main_result,
            alternatives=alternatives,
            note=note,
        )


# Alternative models that can be used
AVAILABLE_MODELS = {
    "nllb": "facebook/nllb-200-distilled-600M",  # Default - best quality
    "helsinki": "Helsinki-NLP/opus-mt-en-jap",  # Smaller but lower quality
    # Note: mbart (facebook/mbart-large-50-many-to-many-mmt) has compatibility
    # issues with transformers v5 tokenizers
}
