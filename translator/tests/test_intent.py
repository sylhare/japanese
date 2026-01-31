"""Unit tests for the intent detection module."""

import pytest

from translator.intent import (
    EXIT_KEYWORDS,
    INSTRUCTION_KEYWORDS,
    Intent,
    IntentDetector,
    IntentType,
)


class TestIntentType:
    """Tests for IntentType enum."""

    def test_intent_types_exist(self):
        """Verify all expected intent types exist."""
        assert IntentType.TRANSLATE.value == "translate"
        assert IntentType.INSTRUCTION.value == "instruction"
        assert IntentType.QUESTION.value == "question"
        assert IntentType.EXIT.value == "exit"


class TestIntent:
    """Tests for Intent dataclass."""

    def test_intent_creation(self):
        """Test creating an Intent object."""
        intent = Intent(type=IntentType.TRANSLATE, text="hello", confidence=0.95)
        assert intent.type == IntentType.TRANSLATE
        assert intent.text == "hello"
        assert intent.confidence == 0.95

    def test_intent_default_confidence(self):
        """Test that default confidence is 1.0."""
        intent = Intent(type=IntentType.EXIT, text="quit")
        assert intent.confidence == 1.0


class TestIntentDetector:
    """Tests for IntentDetector class."""

    @pytest.fixture
    def detector(self):
        """Create a detector without LLM for faster tests."""
        return IntentDetector(use_llm=False)

    # Exit intent tests
    @pytest.mark.parametrize(
        "text",
        [
            "quit",
            "exit",
            "bye",
            "goodbye",
            "q",
            ":q",
            "さようなら",
            "QUIT",
            "Exit",
        ],
    )
    def test_exit_intent_detection(self, detector, text):
        """Test that exit commands are correctly detected."""
        intent = detector.detect(text)
        assert intent.type == IntentType.EXIT
        assert intent.confidence == 1.0

    # Help/instruction intent tests
    @pytest.mark.parametrize(
        "text",
        [
            "help",
            "?",
            "h",
        ],
    )
    def test_help_intent_detection(self, detector, text):
        """Test that help commands are correctly detected."""
        intent = detector.detect(text)
        assert intent.type == IntentType.INSTRUCTION
        assert intent.text == "help"

    @pytest.mark.parametrize(
        "text",
        [
            "how do I use this?",
            "how to translate?",
            "what is this tool?",
            "can you help me?",
        ],
    )
    def test_question_like_instructions(self, detector, text):
        """Test that question-like instructions are detected."""
        intent = detector.detect(text)
        assert intent.type in (IntentType.INSTRUCTION, IntentType.QUESTION)

    # Translation intent tests
    @pytest.mark.parametrize(
        "text",
        [
            "Hello",
            "I want to eat sushi",
            "Good morning",
            "The weather is nice today",
            "My name is John",
            "Where is the train station?",
            "I love you",
            "Thank you very much",
        ],
    )
    def test_translation_intent_detection(self, detector, text):
        """Test that regular text is detected as translation requests."""
        intent = detector.detect(text)
        assert intent.type == IntentType.TRANSLATE
        assert intent.text == text

    # Edge cases
    def test_empty_string_handling(self, detector):
        """Test handling of empty strings."""
        intent = detector.detect("")
        # Empty string should be treated as translation (will be filtered later)
        assert intent.type == IntentType.TRANSLATE

    def test_whitespace_only(self, detector):
        """Test handling of whitespace-only strings."""
        intent = detector.detect("   ")
        assert intent.type == IntentType.TRANSLATE

    def test_case_insensitivity_for_commands(self, detector):
        """Test that commands are case-insensitive."""
        assert detector.detect("HELP").type == IntentType.INSTRUCTION
        assert detector.detect("Help").type == IntentType.INSTRUCTION
        assert detector.detect("QUIT").type == IntentType.EXIT
        assert detector.detect("Quit").type == IntentType.EXIT


class TestKeywords:
    """Tests for keyword lists."""

    def test_exit_keywords_are_lowercase(self):
        """Verify exit keywords are lowercase for comparison."""
        for keyword in EXIT_KEYWORDS:
            # Japanese characters don't have case
            if keyword.isascii():
                assert keyword == keyword.lower()

    def test_instruction_keywords_are_lowercase(self):
        """Verify instruction keywords are lowercase for comparison."""
        for keyword in INSTRUCTION_KEYWORDS:
            assert keyword == keyword.lower()

    def test_common_exit_keywords_present(self):
        """Verify common exit keywords are present."""
        assert "quit" in EXIT_KEYWORDS
        assert "exit" in EXIT_KEYWORDS
        assert "bye" in EXIT_KEYWORDS

    def test_common_instruction_keywords_present(self):
        """Verify common instruction keywords are present."""
        assert "help" in INSTRUCTION_KEYWORDS
        assert "how do" in INSTRUCTION_KEYWORDS
        assert "what is" in INSTRUCTION_KEYWORDS
