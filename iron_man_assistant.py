#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

# ====== CONFIGURATION ======
# Optional Piper TTS model paths
PIPER_MODEL_PATH = "/home/korri/piper_models/en_US-kristen-medium.onnx"
PIPER_VOICE_JSON = "/home/korri/piper_models/en_US-kristen-medium.onnx.json"

# Directory to store generated speech
AUDIO_DIR = Path.home() / "ironman_audio"
AUDIO_DIR.mkdir(exist_ok=True)

# ====== FUNCTIONS ======
def speak_piper(text: str, filename: Path) -> bool:
    """Generate speech using Piper TTS"""
    try:
        subprocess.run([
            "piper",
            "-m", PIPER_MODEL_PATH,
            "-c", PIPER_VOICE_JSON,
            "-t", text,
            "-o", str(filename)
        ], check=True)
        print(f"[PIPER] Generated: {filename}")
        return True
    except Exception as e:
        print(f"[PIPER ERROR] {e}")
        return False

def speak_espeak(text: str, filename: Path) -> bool:
    """Generate speech using espeak-ng to WAV file"""
    try:
        subprocess.run([
            "espeak-ng",
            "-v", "en-us",
            text,
            "--stdout"
        ], check=True, stdout=open(filename, "wb"))
        print(f"[ESPEAK] Generated: {filename}")
        return True
    except Exception as e:
        print(f"[ESPEAK ERROR] {e}")
        return False

def speak(text: str) -> Path:
    """Generate speech (Piper first, fallback to espeak-ng)"""
    counter = len(list(AUDIO_DIR.glob("*.wav"))) + 1
    filename = AUDIO_DIR / f"speech_{counter}.wav"

    # Try Piper first
    if Path(PIPER_MODEL_PATH).exists() and Path(PIPER_VOICE_JSON).exists():
        if speak_piper(text, filename):
            return filename

    # Fallback to espeak-ng
    if speak_espeak(text, filename):
        return filename

    print("[ERROR] Could not generate speech!")
    return filename

def play_audio(filename: Path):
    """Do NOT attempt real-time playback — just show file path"""
    print(f"Audio file ready: {filename}")

# ====== MAIN ======
if __name__ == "__main__":
    print("System online. Audio output confirmed.")
    file = speak("System online. Audio output confirmed.")
    play_audio(file)
