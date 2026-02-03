"""Unit tests for the translation models module."""

import pytest

from translator.models import DEFAULT_MODEL, JapaneseTranslator, TranslationResult


class TestTranslationResult:
    """Tests for TranslationResult dataclass."""

    def test_creation(self):
        """Test creating a TranslationResult with all fields."""
        result = TranslationResult(
            original="Hello",
            japanese="こんにちは",
            hiragana="こんにちは",
            romaji="konnichiha",
        )
        assert result.original == "Hello"
        assert result.japanese == "こんにちは"
        assert result.hiragana == "こんにちは"
        assert result.romaji == "konnichiha"


class TestJapaneseTranslator:
    """Tests for JapaneseTranslator class."""

    def test_initialization(self):
        """Test translator initializes with default model."""
        translator = JapaneseTranslator()
        assert translator.model_name == DEFAULT_MODEL
        assert translator.model is None
        assert translator.tokenizer is None
        assert translator._loaded is False

    def test_custom_model_name(self):
        """Test initialization with custom model."""
        translator = JapaneseTranslator(model_name="custom/model")
        assert translator.model_name == "custom/model"

    def test_not_loaded_initially(self):
        """Test that model is not loaded on init."""
        translator = JapaneseTranslator()
        assert not translator._loaded
        assert translator.model is None
        assert translator.tokenizer is None
        assert translator.kakasi is None


class TestDefaultModel:
    """Tests for default model configuration."""

    def test_default_model_is_nllb(self):
        """Test that default model is NLLB."""
        assert DEFAULT_MODEL == "facebook/nllb-200-distilled-600M"

    def test_translator_uses_default_model(self):
        """Test that translator uses the default model."""
        translator = JapaneseTranslator()
        assert translator.model_name == DEFAULT_MODEL


@pytest.mark.slow
class TestJapaneseTranslatorIntegration:
    """Integration tests that load the actual model."""

    @pytest.fixture(scope="class")
    def loaded_translator(self):
        """Create and load a translator (cached for class)."""
        translator = JapaneseTranslator()
        translator.load()
        return translator

    def test_model_loads_successfully(self, loaded_translator):
        """Test that model loads without errors."""
        assert loaded_translator._loaded is True
        assert loaded_translator.model is not None
        assert loaded_translator.tokenizer is not None
        assert loaded_translator.kakasi is not None

    def test_basic_translation(self, loaded_translator):
        """Test basic translation produces output."""
        result = loaded_translator.translate("Hello")
        assert isinstance(result, TranslationResult)
        assert result.original == "Hello"
        assert result.japanese != ""
        assert result.hiragana != ""
        assert result.romaji != ""

    def test_hiragana_conversion(self, loaded_translator):
        """Test hiragana conversion works."""
        hiragana = loaded_translator._to_hiragana("東京")
        assert "とうきょう" in hiragana.replace(" ", "")

    def test_romaji_conversion(self, loaded_translator):
        """Test romaji conversion works."""
        romaji = loaded_translator._to_romaji("東京")
        assert "toukyou" in romaji.lower().replace(" ", "")
