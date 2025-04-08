import boto3
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional
from botocore.exceptions import BotoCoreError, ClientError

class AudioGenerator:
    def __init__(self):
        """Initialize audio generator with Amazon Polly"""
        self.client = boto3.client('polly')
        
        # Define available Arabic voices by gender
        self.arabic_voices = {
            'female': ['Zeina'],  # Standard voice
            'male': ['Zayd']      # Neural voice
        }
        
        # Define which engine to use for each voice
        self.voice_engines = {
            'Zeina': 'standard',
            'Zayd': 'neural'
        }
        
        self.output_dir = Path('static/audio')
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_audio(self, text: str | Dict, gender: str = 'female') -> str:
        """
        Generate audio from text using Amazon Polly and save to file
        
        Args:
            text: Text to convert to speech or question dictionary
            gender: 'male' or 'female'
            
        Returns:
            Path to generated audio file
        """
        # Handle dictionary input
        if isinstance(text, dict):
            question_text = text.get('question', '')
            if not question_text:
                raise ValueError("No question text found in dictionary")
            text = question_text
        try:
            # Select voice based on gender
            voice_id = self.arabic_voices[gender.lower()][0]
            
            # Generate unique filename based on timestamp and text hash
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            text_hash = hash(text) & 0xffffffff  # Get positive 32-bit hash of text
            filename = f"audio_{timestamp}_{text_hash}.mp3"
            output_path = os.path.join(self.output_dir, filename)
            
            # Get the appropriate engine for the voice
            engine = self.voice_engines[voice_id]
            
            # Generate speech
            response = self.client.synthesize_speech(
                Text=text,
                OutputFormat='mp3',
                VoiceId=voice_id,
                Engine=engine,
                LanguageCode='ar-SA'
            )
            
            # Save to file
            if "AudioStream" in response:
                with open(output_path, 'wb') as f:
                    f.write(response["AudioStream"].read())
                return output_path
            else:
                raise Exception("No audio stream in response")
                
        except (BotoCoreError, ClientError) as error:
            print(f"Error generating audio: {error}")
            raise error

    def generate_question_audio(self, question_data: Dict) -> Dict[str, bytes]:
        """Generate audio for a question and its options
        
        Args:
            question_data: Dictionary containing question text and options
            
        Returns:
            Dictionary with audio bytes for question and options
        """
        if not isinstance(question_data, dict):
            raise ValueError("Expected dictionary input")
            
        audio_files = {
            'question': self.generate_audio(question_data['question']),
            'options': []
        }
        
        if 'options' in question_data:
            for option in question_data['options']:
                audio_files['options'].append(self.generate_audio(option))
                
        return audio_files

    def clean_old_files(self, max_age_hours: int = 24):
        """Clean up old audio files"""
        import time
        current_time = time.time()
        
        for file in self.output_dir.glob('*.mp3'):
            file_age = current_time - os.path.getctime(file)
            if file_age > max_age_hours * 3600:
                os.remove(file)