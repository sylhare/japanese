"""
E2E smoke tests for the Japanese translator CLI.

These tests verify that the CLI works end-to-end by actually running
the translator command and checking its output.

Run separately from unit tests:
    uv run pytest tests/e2e -v

Note: These tests may be slow as they load the actual ML model.
"""

import subprocess
import sys
from pathlib import Path

import pytest

# Get the translator root directory
TRANSLATOR_ROOT = Path(__file__).parent.parent.parent


@pytest.fixture(scope="module")
def translator_cli():
    """Fixture that provides a function to run the translator CLI."""

    def run_cli(inputs: list[str], timeout: int = 120) -> subprocess.CompletedProcess:
        """
        Run the translator CLI with given inputs.

        Args:
            inputs: List of inputs to send to stdin (each followed by newline)
            timeout: Maximum time to wait for the command

        Returns:
            CompletedProcess with stdout and stderr
        """
        # Join inputs with newlines
        stdin_data = "\n".join(inputs)

        result = subprocess.run(
            [sys.executable, "-m", "translator.main"],
            input=stdin_data,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=TRANSLATOR_ROOT,
        )
        return result

    return run_cli


class TestCLISmoke:
    """Smoke tests for CLI functionality."""

    @pytest.mark.e2e
    def test_cli_starts_and_exits(self, translator_cli):
        """Test that CLI starts and can be exited cleanly."""
        result = translator_cli(["quit"])

        # Should exit successfully
        assert result.returncode == 0

        # Should show welcome message
        assert "Japanese Translator" in result.stdout

        # Should show goodbye message
        assert "さようなら" in result.stdout or "Goodbye" in result.stdout

    @pytest.mark.e2e
    def test_cli_shows_help(self, translator_cli):
        """Test that help command works."""
        result = translator_cli(["help", "quit"])

        assert result.returncode == 0
        assert "Commands:" in result.stdout or "Usage:" in result.stdout

    @pytest.mark.e2e
    def test_cli_alternative_exit_commands(self, translator_cli):
        """Test alternative exit commands."""
        for exit_cmd in ["exit", "bye", "q"]:
            result = translator_cli([exit_cmd])
            assert result.returncode == 0, f"Exit command '{exit_cmd}' failed"

    @pytest.mark.e2e
    @pytest.mark.slow
    def test_cli_translates_simple_text(self, translator_cli):
        """Test that CLI can translate simple text."""
        result = translator_cli(["Hello", "quit"], timeout=180)

        assert result.returncode == 0

        # Should contain Japanese characters in output
        output = result.stdout
        assert any(
            ord(c) > 0x3000 for c in output
        ), "Output should contain Japanese characters"

    @pytest.mark.e2e
    @pytest.mark.slow
    def test_cli_translates_multiple_inputs(self, translator_cli):
        """Test that CLI handles multiple translations."""
        result = translator_cli(
            ["Hello", "Thank you", "quit"],
            timeout=180,
        )

        assert result.returncode == 0

        # Count how many translation panels appear (rough check)
        # Each translation shows "Japanese" label
        assert result.stdout.count("Romaji") >= 2 or result.stdout.count("romaji") >= 2

    @pytest.mark.e2e
    @pytest.mark.slow
    def test_cli_handles_long_sentence(self, translator_cli):
        """Test that CLI handles longer sentences."""
        result = translator_cli(
            ["I would like to eat some delicious sushi for dinner", "quit"],
            timeout=180,
        )

        assert result.returncode == 0
        assert "sushi" in result.stdout.lower() or any(
            ord(c) > 0x3000 for c in result.stdout
        )


class TestCLIErrorHandling:
    """Tests for CLI error handling."""

    @pytest.mark.e2e
    def test_cli_handles_empty_input(self, translator_cli):
        """Test that empty inputs are handled gracefully."""
        result = translator_cli(["", "", "quit"])

        assert result.returncode == 0
        # Should not crash, should still exit cleanly
        assert "さようなら" in result.stdout or "Goodbye" in result.stdout

    @pytest.mark.e2e
    def test_cli_handles_special_characters(self, translator_cli):
        """Test handling of special characters in input."""
        result = translator_cli(["!@#$%", "quit"])

        # Should not crash
        assert result.returncode == 0


class TestCLIOutput:
    """Tests for CLI output format."""

    @pytest.mark.e2e
    @pytest.mark.slow
    def test_output_contains_all_formats(self, translator_cli):
        """Test that output includes Japanese, Hiragana, and Romaji."""
        result = translator_cli(["Hello", "quit"], timeout=180)

        assert result.returncode == 0
        output = result.stdout.lower()

        # Should contain labels for all formats
        assert "japanese" in output or "hiragana" in output
        assert "romaji" in output

    @pytest.mark.e2e
    @pytest.mark.slow
    def test_output_shows_original_text(self, translator_cli):
        """Test that output shows the original text."""
        test_text = "Good morning"
        result = translator_cli([test_text, "quit"], timeout=180)

        assert result.returncode == 0
        assert test_text in result.stdout


class TestCLIIntegration:
    """Integration tests for CLI with the full pipeline."""

    @pytest.mark.e2e
    @pytest.mark.slow
    def test_full_session_workflow(self, translator_cli):
        """Test a complete user session workflow."""
        result = translator_cli(
            [
                "help",           # Check help
                "Hello",          # Translate
                "Thank you",      # Another translation
                "quit",           # Exit
            ],
            timeout=300,
        )

        assert result.returncode == 0
        output = result.stdout

        # Help was shown
        assert "Commands:" in output or "Usage:" in output

        # Translations were shown
        assert output.count("Romaji") >= 2 or output.count("romaji") >= 2

        # Clean exit
        assert "さようなら" in output or "Goodbye" in output
