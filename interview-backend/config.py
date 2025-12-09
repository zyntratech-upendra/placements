from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    # Load these values from environment/.env via BaseSettings
    mongodb_uri: Optional[str] = None
    mongodb_db_name: str = "ai_interviewer"

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="allow"
    )

class Settingsgpt(BaseSettings):
    openai_api_key: Optional[str] = None

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="allow"
    )


@lru_cache()
def get_settings():
    return Settings()

@lru_cache()
def get_settingsgpt():
    return Settingsgpt()
