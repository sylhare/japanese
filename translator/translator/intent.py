"""Intent detection to distinguish translation requests from instructions."""

from dataclasses import dataclass
from enum import Enum
from typing import Optional

from transformers import pipeline


class IntentType(Enum):
    """Types of user intents."""

    TRANSLATE = "translate"  # User wants to translate text
    INSTRUCTION = "instruction"  # User is giving an instruction
    QUESTION = "question"  # User is asking about the tool
    EXIT = "exit"  # User wants to quit


@dataclass
class Intent:
    """Detected intent with associated data."""

    type: IntentType
    text: str  # The text to process (either to translate or instruction)
    confidence: float = 1.0


# Keywords that indicate instructions rather than translations
INSTRUCTION_KEYWORDS = [
    "help",
    "quit",
    "exit",
    "bye",
    "settings",
    "change",
    "switch",
    "model",
    "options",
    "config",
    "configure",
    "prefer",
    "use",
    "show",
    "display",
    "how do",
    "how to",
    "what is",
    "what are",
    "can you",
    "could you",
    "please",
    "alternatives",
    "more options",
    "explain",
    "why",
    "history",
    "clear",
    "reset",
]

EXIT_KEYWORDS = ["quit", "exit", "bye", "goodbye", "q", ":q", "さようなら"]


class IntentDetector:
    """Detects user intent from input text."""

    def __init__(self, use_llm: bool = True):
        """
        Initialize the intent detector.

        Args:
            use_llm: Whether to use an LLM for intent detection (more accurate but slower)
        """
        self.use_llm = use_llm
        self.classifier = None
        self._loaded = False

    def _load_classifier(self) -> None:
        """Load the zero-shot classifier for intent detection."""
        if self._loaded or not self.use_llm:
            return

        try:
            self.classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=-1,  # CPU for this lightweight task
            )
            self._loaded = True
        except Exception:
            # Fall back to rule-based if model loading fails
            self.use_llm = False

    def detect(self, text: str) -> Intent:
        """
        Detect the intent of user input.

        Args:
            text: User input text

        Returns:
            Intent object with detected type and processed text
        """
        text_lower = text.lower().strip()

        # Check for exit commands first (highest priority)
        if text_lower in EXIT_KEYWORDS or text_lower.startswith(("quit", "exit")):
            return Intent(type=IntentType.EXIT, text=text, confidence=1.0)

        # Check for help command
        if text_lower in ("help", "?", "h"):
            return Intent(type=IntentType.INSTRUCTION, text="help", confidence=1.0)

        # Quick rule-based checks for common patterns
        if self._is_likely_instruction(text_lower):
            return self._classify_instruction(text)

        # If LLM is enabled, use it for ambiguous cases
        if self.use_llm and self._is_ambiguous(text):
            return self._llm_classify(text)

        # Default: assume it's a translation request
        return Intent(type=IntentType.TRANSLATE, text=text, confidence=0.9)

    def _is_likely_instruction(self, text: str) -> bool:
        """Check if text looks like an instruction based on patterns."""
        # Starts with instruction keywords
        for keyword in INSTRUCTION_KEYWORDS:
            if text.startswith(keyword):
                return True

        # Contains question marks with instruction words
        if "?" in text:
            for keyword in ["how", "what", "why", "can", "could", "would"]:
                if keyword in text:
                    return True

        return False

    def _is_ambiguous(self, text: str) -> bool:
        """Check if the text is ambiguous (could be translation or instruction)."""
        # Short text might be ambiguous
        if len(text.split()) <= 3:
            return True

        # Contains some instruction-like words
        text_lower = text.lower()
        instruction_count = sum(1 for kw in INSTRUCTION_KEYWORDS if kw in text_lower)
        return instruction_count >= 1

    def _classify_instruction(self, text: str) -> Intent:
        """Classify as an instruction and determine the type."""
        text_lower = text.lower()

        if any(kw in text_lower for kw in ["help", "how to", "how do"]):
            return Intent(type=IntentType.INSTRUCTION, text="help", confidence=0.95)

        if any(kw in text_lower for kw in ["what is", "what are", "explain"]):
            return Intent(type=IntentType.QUESTION, text=text, confidence=0.9)

        return Intent(type=IntentType.INSTRUCTION, text=text, confidence=0.85)

    def _llm_classify(self, text: str) -> Intent:
        """Use LLM to classify ambiguous input."""
        self._load_classifier()

        if not self.classifier:
            # Fall back to translation if classifier not available
            return Intent(type=IntentType.TRANSLATE, text=text, confidence=0.7)

        try:
            result = self.classifier(
                text,
                candidate_labels=[
                    "text to translate to Japanese",
                    "instruction or command for the tool",
                    "question about the tool or Japanese",
                ],
            )

            label = result["labels"][0]
            score = result["scores"][0]

            if "translate" in label:
                return Intent(type=IntentType.TRANSLATE, text=text, confidence=score)
            elif "instruction" in label:
                return Intent(type=IntentType.INSTRUCTION, text=text, confidence=score)
            else:
                return Intent(type=IntentType.QUESTION, text=text, confidence=score)

        except Exception:
            # Default to translation on error
            return Intent(type=IntentType.TRANSLATE, text=text, confidence=0.6)
