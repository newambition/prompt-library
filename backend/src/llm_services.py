# backend/src/llm_services.py
import google.generativeai as genai
from typing import Optional, Tuple, Dict, Type
from abc import ABC, abstractmethod

# Try to import OpenAI, but don't fail if not installed yet (developer might be setting up)
# It will fail at runtime if called without the library.
NO_OPENAI_LIB = False
try:
    from openai import AsyncOpenAI, APIError as OpenAIAPIError # Alias to avoid name clash
except ImportError:
    NO_OPENAI_LIB = True
    # print("WARNING: OpenAI library not installed. OpenAIProvider will not function.")

# Try to import Anthropic
NO_ANTHROPIC_LIB = False
try:
    from anthropic import AsyncAnthropic, APIError as AnthropicAPIError # Alias
except ImportError:
    NO_ANTHROPIC_LIB = True
    # print("WARNING: Anthropic library not installed. AnthropicProvider will not function.")

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""
    @abstractmethod
    async def generate_text(self, api_key: str, model_id: str, prompt_text: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Generates text using the LLM provider.

        Args:
            api_key: The API key for the provider.
            model_id: The specific model ID to use for this provider.
            prompt_text: The prompt to send to the LLM.

        Returns:
            A tuple containing (generated_text, error_message).
            If successful, generated_text is the response and error_message is None.
            If an error occurs, generated_text is None and error_message contains the error.
        """
        pass

class GeminiProvider(BaseLLMProvider):
    """LLM Provider for Google Gemini models."""
    async def generate_text(self, api_key: str, model_id: str, prompt_text: str) -> Tuple[Optional[str], Optional[str]]:
        if not api_key:
            return None, "API_KEY_NOT_CONFIGURED" # Standardized error key

        try:
            genai.configure(api_key=api_key)
            # Use the model_id passed from the request
            model = genai.GenerativeModel(model_id) 
            response = await model.generate_content_async(prompt_text)
            
            if response.parts:
                generated_text = "".join(part.text for part in response.parts if hasattr(part, 'text'))
            elif hasattr(response, 'text') and response.text: # Fallback for older response structures if any
                generated_text = response.text
            else: # Handle cases where no usable text parts are found, including blocked prompts
                if response.prompt_feedback and response.prompt_feedback.block_reason:
                    return None, f"PROMPT_BLOCKED:{response.prompt_feedback.block_reason_message or response.prompt_feedback.block_reason}"
                return None, "NO_TEXT_CONTENT_IN_RESPONSE"

            return generated_text, None

        except ValueError as ve: # Specific handling for model_id issues
            print(f"ValueError with Gemini model {model_id}: {ve}")
            if "model not found" in str(ve).lower() or "service not found" in str(ve).lower():
                return None, f"MODEL_NOT_FOUND:{model_id}"
            return None, f"GEMINI_API_ERROR:Invalid configuration or model ID '{model_id}'. {str(ve)}"
        except Exception as e:
            print(f"Error calling Gemini API with model {model_id}: {e}")
            return None, f"GEMINI_API_ERROR:{str(e)}"

class OpenAIProvider(BaseLLMProvider):
    """LLM Provider for OpenAI models (e.g., GPT-3.5, GPT-4)."""
    async def generate_text(self, api_key: str, model_id: str, prompt_text: str) -> Tuple[Optional[str], Optional[str]]:
        if NO_OPENAI_LIB:
            print("OpenAI library is not installed. Please run 'pip install openai'")
            return None, "OPENAI_LIB_NOT_INSTALLED"
            
        if not api_key:
            return None, "API_KEY_NOT_CONFIGURED"

        client = AsyncOpenAI(api_key=api_key)
        try:
            response = await client.chat.completions.create(
                model=model_id,
                messages=[{"role": "user", "content": prompt_text}]
                # Add other parameters like max_tokens, temperature if needed in the future
            )
            if response.choices and response.choices[0].message and response.choices[0].message.content:
                return response.choices[0].message.content.strip(), None
            else:
                # This case might indicate an unexpected response structure or an empty message
                print(f"OpenAI API response for model {model_id} lacked expected content: {response}")
                return None, "OPENAI_UNEXPECTED_RESPONSE_STRUCTURE"
        except OpenAIAPIError as e:
            # Handle API errors (e.g., rate limits, server errors from OpenAI)
            print(f"OpenAI API Error with model {model_id}: {e}")
            error_message = f"OPENAI_API_ERROR:{e.status_code} - {e.message or e.code or 'Unknown API Error'}"
            if e.status_code == 401: # Authentication error
                error_message = "OPENAI_AUTHENTICATION_ERROR:Invalid API key or insufficient permissions."
            elif e.status_code == 404: # Model not found (though often caught by model validation first)
                 error_message = f"OPENAI_MODEL_NOT_FOUND:{model_id}"
            elif e.status_code == 429: # Rate limit
                error_message = "OPENAI_RATE_LIMIT_EXCEEDED:Rate limit exceeded. Please try again later."
            # Add more specific status code handling if needed
            return None, error_message
        except Exception as e:
            # Handle other unexpected errors (network issues, etc.)
            print(f"Unexpected error calling OpenAI API with model {model_id}: {e}")
            return None, f"OPENAI_UNEXPECTED_ERROR:{str(e)}"

class AnthropicProvider(BaseLLMProvider):
    """LLM Provider for Anthropic Claude models."""
    async def generate_text(self, api_key: str, model_id: str, prompt_text: str, max_tokens_to_sample: int = 2048) -> Tuple[Optional[str], Optional[str]]:
        if NO_ANTHROPIC_LIB:
            print("Anthropic library is not installed. Please run 'pip install anthropic'")
            return None, "ANTHROPIC_LIB_NOT_INSTALLED"

        if not api_key:
            return None, "API_KEY_NOT_CONFIGURED"

        client = AsyncAnthropic(api_key=api_key)
        try:
            response = await client.messages.create(
                model=model_id,
                max_tokens=max_tokens_to_sample, # Anthropic requires max_tokens
                messages=[{"role": "user", "content": prompt_text}]
            )
            if response.content and response.content[0] and hasattr(response.content[0], 'text'):
                return response.content[0].text.strip(), None
            else:
                print(f"Anthropic API response for model {model_id} lacked expected content: {response}")
                return None, "ANTHROPIC_UNEXPECTED_RESPONSE_STRUCTURE"
        except AnthropicAPIError as e:
            print(f"Anthropic API Error with model {model_id}: {e}")
            error_message = f"ANTHROPIC_API_ERROR:{e.status_code} - {e.message or e.body.get('error', {}).get('message', 'Unknown API Error') if e.body else 'Unknown API Error'}"
            if e.status_code == 401: # Authentication error
                error_message = "ANTHROPIC_AUTHENTICATION_ERROR:Invalid API key or insufficient permissions."
            elif e.status_code == 403: # Permission denied, often for specific model access or feature
                error_message = f"ANTHROPIC_PERMISSION_DENIED:Permission denied for model {model_id} or feature. {e.message or ''}"
            elif e.status_code == 404: # Not found (can be model or endpoint)
                 error_message = f"ANTHROPIC_NOT_FOUND:{model_id} or endpoint not found."
            elif e.status_code == 429: # Rate limit
                error_message = "ANTHROPIC_RATE_LIMIT_EXCEEDED:Rate limit exceeded. Please try again later."
            # Add more specific status code handling if needed
            return None, error_message
        except Exception as e:
            print(f"Unexpected error calling Anthropic API with model {model_id}: {e}")
            return None, f"ANTHROPIC_UNEXPECTED_ERROR:{str(e)}"

# Provider Registry
PROVIDER_REGISTRY: Dict[str, Type[BaseLLMProvider]] = {
    "gemini": GeminiProvider,
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    # Add other providers here
}

async def get_llm_response(provider_name: str, api_key: str, model_id: str, prompt_text: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Gets a response from the specified LLM provider and model.

    Args:
        provider_name: The name of the LLM provider (e.g., "gemini", "openai").
        api_key: The API key for the provider.
        model_id: The specific model ID to use.
        prompt_text: The prompt to send to the LLM.

    Returns:
        A tuple (generated_text, error_message).
    """
    provider_class = PROVIDER_REGISTRY.get(provider_name.lower())
    if not provider_class:
        return None, f"UNSUPPORTED_PROVIDER:{provider_name}"

    provider_instance = provider_class()
    return await provider_instance.generate_text(api_key=api_key, model_id=model_id, prompt_text=prompt_text)

# Remove old standalone function if it exists (or comment out)
# async def generate_text_from_gemini(api_key: str, prompt_text: str) -> tuple[Optional[str], Optional[str]]:
#     ... (old implementation)

