import os
from youtube_transcript_api import YouTubeTranscriptApi
from typing import Optional, List, Dict


class YouTubeTranscriptDownloader:
    def __init__(self, languages: List[str] = ["ar", "en", "ar-SA", "en-US", "en-GB"]):
        self.languages = languages

    def extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract video ID from YouTube URL
        
        Args:
            url (str): YouTube URL
            
        Returns:
            Optional[str]: Video ID if found, None otherwise
        """
        if "v=" in url:
            return url.split("v=")[1][:11]
        elif "youtu.be/" in url:
            return url.split("youtu.be/")[1][:11]
        return None

    def get_transcript(self, video_id: str) -> Optional[List[Dict]]:
        """
        Download YouTube Transcript
        
        Args:
            video_id (str): YouTube video ID or URL
            
        Returns:
            Optional[List[Dict]]: Transcript if successful, None otherwise
        """
        # Extract video ID if full URL is provided
        if "youtube.com" in video_id or "youtu.be" in video_id:
            video_id = self.extract_video_id(video_id)
            
        if not video_id:
            print("Invalid video ID or URL")
            return None

        print(f"Downloading transcript for video ID: {video_id}")
        
        # First, try to list available transcripts
        try:
            print("Attempting to list available transcripts...")
            available_transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
            print("\nAvailable transcript languages:")
            for transcript in available_transcripts:
                print(f"- {transcript.language_code} ({transcript.language})")
            print("\nAttempting to download transcript with specified languages...")
        except Exception as list_error:
            print(f"Could not list available transcripts: {str(list_error)}")
        
        try:
            print(f"Attempting to get transcript with languages: {self.languages}")
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=self.languages)
            print("Successfully downloaded transcript!")
            return transcript
        except Exception as e:
            print(f"\nAn error occurred: {str(e)}")
            if "Subtitles are disabled" in str(e):
                print("This video has disabled subtitles/transcripts.")
            elif "No transcripts were found" in str(e):
                print("No transcripts found for the specified languages. Trying without language filtering...")
                try:
                    # Try to get any available transcript
                    print("Attempting to get transcript without language filtering...")
                    transcript = YouTubeTranscriptApi.get_transcript(video_id)
                    print("Successfully downloaded transcript!")
                    return transcript
                except Exception as fallback_error:
                    print(f"Fallback attempt failed: {str(fallback_error)}")
            return None

    def save_transcript(self, transcript: List[Dict], filename: str) -> bool:
        """
        Save transcript to file
        
        Args:
            transcript (List[Dict]): Transcript data
            filename (str): Output filename
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Get the directory where this script is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        transcripts_dir = os.path.join(current_dir, 'transcripts')
        
        # Create transcripts directory if it doesn't exist
        os.makedirs(transcripts_dir, exist_ok=True)
        
        filename = os.path.join(transcripts_dir, f"{filename}.txt")
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                for entry in transcript:
                    f.write(f"{entry['text']}\n")
            print(f"Transcript saved to: {filename}")  
            return True
        except Exception as e:
            print(f"Error saving transcript: {str(e)}")
            return False

def main(video_url, print_transcript=False):
    # Initialize downloader
    downloader = YouTubeTranscriptDownloader()
    
    # Get transcript
    transcript = downloader.get_transcript(video_url)
    
    if transcript:
        # Save transcript
        video_id = downloader.extract_video_id(video_url)
        if downloader.save_transcript(transcript, video_id):
            print(f"Transcript saved successfully to {video_id}.txt")
            #Print transcript if True
            if print_transcript:
                # Print transcript
                for entry in transcript:
                    print(f"{entry['text']}")
        else:
            print("Failed to save transcript")
        
    else:
        print("Failed to get transcript")

if __name__ == "__main__":
    # YouTube video URL for "Learn Arabic with Khasu"
    video_id = "https://www.youtube.com/watch?v=dinQIb4ZFXY&ab_channel=LearnArabicwithKhasu"
    transcript = main(video_id, print_transcript=True)