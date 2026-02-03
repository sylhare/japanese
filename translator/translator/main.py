"""
Main CLI entry point for the Japanese translator.

This module provides an interactive command-line interface for translating
English text to Japanese with hiragana and romaji representations.
"""

from pathlib import Path

from prompt_toolkit import PromptSession
from prompt_toolkit.history import FileHistory
from prompt_toolkit.styles import Style
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

from translator.intent import Intent, IntentDetector, IntentType
from translator.models import JapaneseTranslator, TranslationResult


console = Console()

PROMPT_STYLE = Style.from_dict({
    "prompt": "#ff6b6b bold",
    "": "#e0e0e0",
})

HELP_TEXT = """
[bold cyan]Japanese Translator - Help[/bold cyan]

[bold]Commands:[/bold]
  [green]help[/green] or [green]?[/green]     Show this help message
  [green]quit[/green] or [green]exit[/green]  Exit the translator
  [green]clear[/green]         Clear the screen

[bold]Usage:[/bold]
  Simply type English text to translate it to Japanese.
  The translator will show:
  • [yellow]Japanese[/yellow] (kanji/hiragana/katakana)
  • [cyan]Hiragana[/cyan] (reading in hiragana)
  • [magenta]Romaji[/magenta] (romanized pronunciation)

[bold]Navigation:[/bold]
  ↑/↓ arrows    Navigate through previous inputs
  Ctrl+C        Exit
  Ctrl+D        Cancel current input

[bold]Tips:[/bold]
  • Keep sentences simple for better translations
  • Try rephrasing if the translation seems off

[dim]Example: "I want to eat sushi" → 寿司が食べたい (すしがたべたい)[/dim]
"""


def print_welcome() -> None:
    """Print the welcome banner."""
    welcome = Text()
    welcome.append("日本語 Translator\n", style="bold cyan")
    welcome.append("English → Japanese with Hiragana, Kanji & Romaji\n\n", style="dim")
    welcome.append("Type ", style="white")
    welcome.append("help", style="green bold")
    welcome.append(" for usage info, or ", style="white")
    welcome.append("quit", style="red bold")
    welcome.append(" to exit.\n", style="white")

    console.print(Panel(welcome, border_style="cyan", padding=(0, 2)))
    console.print()


def display_translation(result: TranslationResult) -> None:
    """
    Display a translation result.

    Args:
        result: The translation result to display.
    """
    console.print()
    console.print(f"[bold white]English:[/bold white]  {result.original}")
    console.print(f"[bold yellow]Japanese:[/bold yellow] {result.japanese}")
    console.print(f"[cyan]Hiragana:[/cyan] {result.hiragana}")
    console.print(f"[magenta italic]Romaji:[/magenta italic]   {result.romaji}")
    console.print()


def handle_instruction(intent: Intent) -> bool:
    """
    Handle non-translation instructions.

    Args:
        intent: The detected intent from user input.

    Returns:
        True if the program should continue, False to exit.
    """
    text = intent.text.lower().strip()

    if text == "help" or intent.type == IntentType.QUESTION:
        console.print(HELP_TEXT)
        return True

    if text == "clear":
        console.clear()
        print_welcome()
        return True

    console.print(f"[yellow]I understood this as an instruction: {intent.text}[/yellow]")
    console.print("[dim]If you wanted to translate this text, try rephrasing it.[/dim]")
    console.print()
    return True


def create_session() -> PromptSession:
    """
    Create a prompt session with command history.

    Returns:
        A configured PromptSession with file-based history.
    """
    history_file = Path.home() / ".japanese_translator_history"
    return PromptSession(
        history=FileHistory(str(history_file)),
        style=PROMPT_STYLE,
        enable_history_search=True,
    )


def main() -> None:
    """Run the interactive translator CLI."""
    print_welcome()

    translator = JapaneseTranslator()
    translator.load()
    intent_detector = IntentDetector(use_llm=False)
    session = create_session()

    while True:
        try:
            user_input = session.prompt(
                [("class:prompt", "translate ❯ ")],
                style=PROMPT_STYLE,
            ).strip()

            if not user_input:
                continue

            intent = intent_detector.detect(user_input)

            if intent.type == IntentType.EXIT:
                console.print("\n[cyan]さようなら! (Goodbye!)[/cyan] 👋\n")
                break

            elif intent.type in (IntentType.INSTRUCTION, IntentType.QUESTION):
                if not handle_instruction(intent):
                    break

            elif intent.type == IntentType.TRANSLATE:
                try:
                    result = translator.translate(intent.text)
                    display_translation(result)
                except Exception as e:
                    console.print(f"[red]Translation error: {e}[/red]")
                    console.print("[dim]Please try again or rephrase your input.[/dim]\n")

        except KeyboardInterrupt:
            console.print("\n[cyan]さようなら! (Goodbye!)[/cyan] 👋\n")
            break

        except EOFError:
            console.print("\n[dim]Input cancelled[/dim]\n")
            continue

        except Exception as e:
            console.print(f"[red]Error: {e}[/red]\n")


if __name__ == "__main__":
    main()
