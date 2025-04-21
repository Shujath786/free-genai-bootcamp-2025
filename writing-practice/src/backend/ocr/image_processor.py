import cv2
import numpy as np
import pytesseract
from PIL import Image
from typing import Optional, Dict
import logging
from src.utils.logger import setup_logger

# Setup logger
logger = setup_logger(__name__)

class ImageProcessor:
    def __init__(self):
        """Initialize the image processor"""
        # Configure pytesseract path if needed
        # pytesseract.pytesseract.tesseract_cmd = r'path_to_tesseract_executable'
        self.supported_languages = {'eng': 'English', 'ara': 'Arabic'}
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess the image for better OCR results
        """
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding to get black and white image
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Noise removal
            denoised = cv2.fastNlMeansDenoising(binary)
            
            return denoised
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
    
    def extract_text(self, image_data: bytes, language: str = 'eng') -> Dict:
        """
        Extract text from image using OCR
        Args:
            image_data: Binary image data
            language: Language code ('eng' for English, 'ara' for Arabic)
        Returns:
            Dictionary containing extracted text and confidence score
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Perform OCR
            if language not in self.supported_languages:
                raise ValueError(f"Unsupported language: {language}")
            
            # Get OCR data including confidence scores
            ocr_data = pytesseract.image_to_data(
                processed_image,
                lang=language,
                output_type=pytesseract.Output.DICT
            )
            
            # Extract text and calculate average confidence
            text = ' '.join([word for word in ocr_data['text'] if word.strip()])
            confidences = [conf for conf, word in zip(ocr_data['conf'], ocr_data['text']) 
                         if word.strip() and conf != -1]
            
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': text,
                'confidence': avg_confidence,
                'language': self.supported_languages[language]
            }
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            raise
