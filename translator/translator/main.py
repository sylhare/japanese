"""Main CLI entry point for the Japanese translator."""

import sys
from pathlib import Path

from prompt_toolkit import PromptSession
from prompt_toolkit.history import FileHistory
from prompt_toolkit.styles import Style
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

from translator.intent import Intent, IntentDetector, IntentType
from translator.models import JapaneseTranslator, TranslationResponse

# Rich console for pretty output
console = Console()

# Custom prompt style
PROMPT_STYLE = Style.from_dict(
    {
        "prompt": "#ff6b6b bold",
        "": "#e0e0e0",
    }
)

# Help text
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
  • Alternative translations

[bold]Navigation:[/bold]
  ↑/↓ arrows    Navigate through previous inputs
  Ctrl+C        Cancel current input
  Ctrl+D        Exit

[bold]Tips:[/bold]
  • The translator prefers native Japanese words for beginners
  • Keep sentences simple for better translations
  • Try rephrasing if the translation seems off

[dim]Example: "I want to eat sushi" → 寿司が食べたい (すしがたべたい)[/dim]
"""


def print_welcome() -> None:
    """Print welcome message."""
    welcome = Text()
    welcome.append("🇯🇵 Japanese Translator\n", style="bold cyan")
    welcome.append("English → Japanese with Hiragana, Kanji & Romaji\n\n", style="dim")
    welcome.append("Type ", style="white")
    welcome.append("help", style="green bold")
    welcome.append(" for usage info, or ", style="white")
    welcome.append("quit", style="red bold")
    welcome.append(" to exit.\n", style="white")

    console.print(Panel(welcome, border_style="cyan", padding=(0, 2)))
    console.print()


def display_translation(response: TranslationResponse) -> None:
    """Display translation results in a clean format."""
    console.print()
    console.print(f"[bold white]English:[/bold white]  {response.original}")
    console.print(f"[bold yellow]Japanese:[/bold yellow] {response.main.japanese}")
    console.print(f"[cyan]Hiragana:[/cyan] {response.main.hiragana}")
    console.print(f"[magenta italic]Romaji:[/magenta italic]   {response.main.romaji}")

    # Alternatives
    if response.alternatives:
        console.print()
        console.print("[dim]Alternatives:[/dim]")
        for i, alt in enumerate(response.alternatives, 1):
            console.print(f"  [dim]{i}.[/dim] [yellow]{alt.japanese}[/yellow] [dim]({alt.romaji})[/dim]")

    # Note if any
    if response.note:
        console.print()
        console.print(f"[dim]{response.note}[/dim]")

    console.print()


def handle_instruction(intent: Intent, translator: JapaneseTranslator) -> bool:
    """
    Handle non-translation instructions.

    Returns:
        True if the program should continue, False if it should exit.
    """
    text = intent.text.lower().strip()

    if text == "help" or intent.type == IntentType.QUESTION:
        console.print(HELP_TEXT)
        return True

    if text == "clear":
        console.clear()
        print_welcome()
        return True

    # Generic instruction handling
    console.print(f"[yellow]I understood this as an instruction: {intent.text}[/yellow]")
    console.print("[dim]If you wanted to translate this text, try rephrasing it.[/dim]")
    console.print()

    return True


def create_session() -> PromptSession:
    """Create a prompt session with history support."""
    # Store history in user's home directory
    history_file = Path.home() / ".japanese_translator_history"

    return PromptSession(
        history=FileHistory(str(history_file)),
        style=PROMPT_STYLE,
        enable_history_search=True,
    )


def main() -> None:
    """Main entry point for the translator CLI."""
    # Print welcome
    print_welcome()

    # Initialize components
    translator = JapaneseTranslator()
    intent_detector = IntentDetector(use_llm=False)  # Start with rule-based for speed

    # Create prompt session with history
    session = create_session()

    # Main loop
    while True:
        try:
            # Get user input with prompt
            user_input = session.prompt(
                [("class:prompt", "翻訳 ❯ ")],
                style=PROMPT_STYLE,
            ).strip()

            # Skip empty input
            if not user_input:
                continue

            # Detect intent
            intent = intent_detector.detect(user_input)

            # Handle based on intent
            if intent.type == IntentType.EXIT:
                console.print("\n[cyan]さようなら! (Goodbye!)[/cyan] 👋\n")
                break

            elif intent.type in (IntentType.INSTRUCTION, IntentType.QUESTION):
                should_continue = handle_instruction(intent, translator)
                if not should_continue:
                    break

            elif intent.type == IntentType.TRANSLATE:
                try:
                    response = translator.translate(
                        intent.text,
                        num_alternatives=2,
                        prefer_native=True,
                    )
                    display_translation(response)
                except Exception as e:
                    console.print(f"[red]Translation error: {e}[/red]")
                    console.print("[dim]Please try again or rephrase your input.[/dim]\n")

        except KeyboardInterrupt:
            console.print("\n[dim]Press Ctrl+D or type 'quit' to exit[/dim]\n")
            continue

        except EOFError:
            console.print("\n[cyan]さようなら! (Goodbye!)[/cyan] 👋\n")
            break

        except Exception as e:
            console.print(f"[red]Error: {e}[/red]\n")


if __name__ == "__main__":
    main()
