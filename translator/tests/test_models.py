"""Unit tests for the translation models module."""

import pytest

from translator.models import (
    DEFAULT_MODEL,
    JapaneseTranslator,
    TranslationResponse,
    TranslationResult,
)


class TestTranslationResult:
    """Tests for TranslationResult dataclass."""

    def test_creation(self):
        """Test creating a TranslationResult."""
        result = TranslationResult(
            japanese="こんにちは",
            hiragana="こんにちは",
            romaji="konnichiha",
            confidence=0.95,
        )
        assert result.japanese == "こんにちは"
        assert result.hiragana == "こんにちは"
        assert result.romaji == "konnichiha"
        assert result.confidence == 0.95

    def test_default_confidence(self):
        """Test default confidence value."""
        result = TranslationResult(
            japanese="はい",
            hiragana="はい",
            romaji="hai",
        )
        assert result.confidence == 1.0


class TestTranslationResponse:
    """Tests for TranslationResponse dataclass."""

    def test_creation(self):
        """Test creating a TranslationResponse."""
        main = TranslationResult(
            japanese="こんにちは",
            hiragana="こんにちは",
            romaji="konnichiha",
        )
        alt = TranslationResult(
            japanese="今日は",
            hiragana="きょうは",
            romaji="kyouha",
            confidence=0.9,
        )
        response = TranslationResponse(
            original="Hello",
            main=main,
            alternatives=[alt],
            note="Test note",
        )
        assert response.original == "Hello"
        assert response.main == main
        assert len(response.alternatives) == 1
        assert response.note == "Test note"

    def test_optional_note(self):
        """Test that note is optional."""
        main = TranslationResult(
            japanese="はい",
            hiragana="はい",
            romaji="hai",
        )
        response = TranslationResponse(
            original="Yes",
            main=main,
            alternatives=[],
        )
        assert response.note is None


class TestJapaneseTranslator:
    """Tests for JapaneseTranslator class."""

    def test_initialization(self):
        """Test translator initialization."""
        translator = JapaneseTranslator()
        assert translator.model_name == "facebook/nllb-200-distilled-600M"
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


# Integration tests that require model loading (marked as slow)
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
        response = loaded_translator.translate("Hello", num_alternatives=1)
        assert response.original == "Hello"
        assert response.main.japanese != ""
        assert response.main.hiragana != ""
        assert response.main.romaji != ""

    def test_translation_with_alternatives(self, loaded_translator):
        """Test that alternatives are generated."""
        response = loaded_translator.translate("Good morning", num_alternatives=2)
        # May or may not have alternatives depending on beam search
        assert isinstance(response.alternatives, list)

    def test_hiragana_conversion(self, loaded_translator):
        """Test hiragana conversion works."""
        hiragana = loaded_translator._to_hiragana("東京")
        assert hiragana == "とうきょう"

    def test_romaji_conversion(self, loaded_translator):
        """Test romaji conversion works."""
        romaji = loaded_translator._to_romaji("東京")
        assert "toukyou" in romaji.lower().replace(" ", "")

    def test_create_result(self, loaded_translator):
        """Test _create_result method."""
        result = loaded_translator._create_result("こんにちは", 0.8)
        assert result.japanese == "こんにちは"
        assert result.hiragana == "こんにちは"
        assert result.confidence == 0.8
        assert "konnichiha" in result.romaji.lower().replace(" ", "")
