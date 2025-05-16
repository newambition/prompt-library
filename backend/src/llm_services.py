# backend/src/llm_services.py
import google.generativeai as genai
from typing import Optional

async def generate_text_from_gemini(api_key: str, prompt_text: str) -> tuple[Optional[str], Optional[str]]:
    """
    Generates text using the Gemini API.

    Args:
        api_key: The Gemini API key.
        prompt_text: The prompt to send to the LLM.

    Returns:
        A tuple containing (generated_text, error_message).
        If successful, generated_text is the response and error_message is None.
        If an error occurs, generated_text is None and error_message contains the error.
    """
    if not api_key:
        return None, "GEMINI_API_KEY is not configured in the backend."

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = await model.generate_content_async(prompt_text) # Use async version
        if response.parts:
            generated_text = "".join(part.text for part in response.parts if hasattr(part, 'text'))
        elif hasattr(response, 'text') and response.text:
            generated_text = response.text
        else:
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                return None, f"Prompt blocked: {response.prompt_feedback.block_reason_message or response.prompt_feedback.block_reason}"
            return None, "No text content found in Gemini response."

        return generated_text, None

    except Exception as e:
        # Log the full error for backend debugging
        print(f"Error calling Gemini API: {e}")
        # Return a more user-friendly error message
        return None, f"An error occurred while contacting the Gemini API: {str(e)}"

