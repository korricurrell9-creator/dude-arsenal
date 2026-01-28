import google.generativeai as genai
import os

# Use environment variable if available, otherwise fallback to "YOUR_API_KEY"
api_key = os.environ.get("GEMINI_API_KEY", "YOUR_API_KEY")
genai.configure(api_key=api_key)

# Set up the model
generation_config = {
  "temperature": 0.9,
  "top_p": 1,
  "top_k": 1,
  "max_output_tokens": 2048,
}

safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_ONLY_HIGH"
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_ONLY_HIGH"
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_ONLY_HIGH"
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_ONLY_HIGH"
  },
]

model = genai.GenerativeModel(model_name="gemini-pro",
                              generation_config=generation_config,
                              safety_settings=safety_settings)

prompt_parts = [
  "The rain in Spain falls mainly on the",
]

try:
    response = model.generate_content(prompt_parts)
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
    if api_key == "YOUR_API_KEY":
        print("Please set the GEMINI_API_KEY environment variable.")
