import subprocess
import sys

def generate_with_cli(prompt):
    try:
        # Call the gemini.mjs CLI tool which has cached credentials
        result = subprocess.run(['./gemini.mjs', prompt], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            return f"CLI Error: {result.stderr}"
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    prompt = "The rain in Spain falls mainly on the"
    print(f"Prompt: {prompt}")
    print("Response from Gemini CLI:")
    print(generate_with_cli(prompt))
