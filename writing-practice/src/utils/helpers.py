import yaml
import pathlib
import streamlit as st
from typing import Dict, Any

def load_config() -> Dict[str, Any]:
    """Load configuration from config.yaml"""
    config_path = pathlib.Path("config/config.yaml")
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {}

def load_writing_tips(language: str = "english") -> list:
    """Load writing tips based on language preference"""
    if language == "arabic":
        return [
            "ابدأ بفكرة رئيسية واضحة",
            "استخدم أمثلة محددة لدعم نقاطك",
            "نوّع في تركيب الجمل",
            "اقرأ كتابتك بصوت عالٍ للتحقق من التدفق",
            "خذ فترات راحة بين الكتابة والتحرير",
            "استخدم علامات الترقيم بشكل صحيح",
            "تأكد من اتساق الضمائر",
            "راجع قواعد النحو والصرف"
        ]
    else:
        return [
            "Start with a clear main idea",
            "Use specific examples to support your points",
            "Vary your sentence structure",
            "Read your writing aloud to check flow",
            "Take breaks between writing and editing",
            "Use proper punctuation",
            "Ensure pronoun consistency",
            "Review grammar and conjugation rules"
        ]

def initialize_session_state():
    """Initialize Streamlit session state variables"""
    if 'page' not in st.session_state:
        st.session_state.page = "Practice"
    if 'language' not in st.session_state:
        st.session_state.language = "english"
    if 'writing_history' not in st.session_state:
        st.session_state.writing_history = []
    if 'current_streak' not in st.session_state:
        st.session_state.current_streak = 0
    if 'total_writings' not in st.session_state:
        st.session_state.total_writings = 0
