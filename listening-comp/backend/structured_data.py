from typing import List, Dict, Optional, Any
import boto3
from get_transcript import YouTubeTranscriptDownloader

# Model ID
MODEL_ID = "amazon.nova-micro-v1:0"

class TranscriptStructurer:
    def __init__(self, model_id: str = MODEL_ID):
        """Initialize Bedrock client"""
        self.bedrock_client = boto3.client('bedrock-runtime', region_name="us-east-1")
        self.model_id = model_id

    def _generate_response(self, message: str, inference_config: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Generate a response using Amazon Bedrock"""
        if inference_config is None:
            inference_config = {"temperature": 0.7}

        messages = [{
            "role": "user",
            "content": [{"text": message}]
        }]

        try:
            response = self.bedrock_client.converse(
                modelId=self.model_id,
                messages=messages,
                inferenceConfig=inference_config
            )
            return response['output']['message']['content'][0]['text']
            
        except Exception as e:
            print(f"Error generating response: {str(e)}")
            return None

    def extract_qa_structure(self, transcript: List[Dict]) -> Optional[str]:
        """Extract structured Q&A from transcript"""
        # Combine transcript text
        full_text = "\n".join(entry['text'] for entry in transcript)
        
        # Create prompt for Bedrock
        prompt = f"""Analyze this Arabic conversation transcript and extract all questions and answers.
        For each question found, format the output in the following structure:

        conversation:
        [The conversation snippet containing the question and answer]

        question:
        [The exact question asked]

        answer:
        [The answer given]

        ---

        Transcript:
        {full_text}"""
        
        # Get response from Bedrock
        return self._generate_response(prompt)

    def process_youtube_video(self, video_url: str) -> Optional[str]:
        """Process a YouTube video and extract structured Q&A"""
        # Get transcript
        downloader = YouTubeTranscriptDownloader()
        transcript = downloader.get_transcript(video_url)
        
        if not transcript:
            print("Failed to get transcript")
            return None
        
        # Extract structured data
        return self.extract_qa_structure(transcript)

# Example usage
if __name__ == "__main__":
    structurer = TranscriptStructurer()
    # Example video URL - Learn Arabic with Khasu
    video_url = "https://www.youtube.com/watch?v=dinQIb4ZFXY"
    
    result = structurer.process_youtube_video(video_url)
    if result:
        print(result)
