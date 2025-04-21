import boto3
import json
import streamlit as st
from typing import Dict
from botocore.config import Config

def generate_feedback(topic: str, content: str, language: str = "english") -> Dict:
    """Generate feedback for the writing using Amazon Bedrock (Claude)"""
    try:
        # Get AWS credentials from Streamlit secrets
        aws_access_key = st.secrets["aws"]["aws_access_key_id"]
        aws_secret_key = st.secrets["aws"]["aws_secret_access_key"]
        aws_region = st.secrets["aws"]["region"]
        
        # Initialize Bedrock client
        bedrock = boto3.client(
            service_name='bedrock-runtime',
            region_name=aws_region,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            config=Config(retries={'max_attempts': 3})
        )
        
        # Create prompt based on language
        if language == "arabic":
            system_prompt = """أنت مدرس لغة عربية محترف. قم بتحليل النص المقدم وقدم ملاحظات بناءة حول:
            - القواعد النحوية
            - الأسلوب
            - الوضوح
            - التنظيم
            كن مشجعاً وصادقاً في تقييمك."""
        else:
            system_prompt = """You are a professional Arabic language tutor. Analyze the given text and provide constructive feedback on:
            - Grammar
            - Style
            - Clarity
            - Structure
            Be encouraging but honest in your assessment."""
        
        # Prepare the prompt for Claude
        prompt = f"""
        Human: {system_prompt}
        Here is the text to analyze:
        Title: {topic}
        Content: {content}
        Please provide your analysis.
        
        Assistant: I'll analyze the text and provide constructive feedback.
        """
        
        # Call Bedrock with Nova model
        body = json.dumps({
            "messages": [
                {
                    "role": "user", 
                    "content": [
                        {
                            "text": f"{system_prompt}\n\nPlease analyze this writing:\n\nTitle: {topic}\n\nContent:\n{content}"
                        }
                    ]
                }
            ]
        })
        
        response = bedrock.invoke_model(
            modelId='amazon.nova-micro-v1:0',
            body=body
        )
        
        # Parse response
        response_body = json.loads(response.get('body').read())
        feedback = response_body.get('response', '').strip()
        
        return {
            "success": True,
            "feedback": feedback,
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "feedback": None,
            "error": str(e)
        }
