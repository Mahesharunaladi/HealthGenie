"""
Image preprocessing for medical imaging
"""

import cv2
import numpy as np
from PIL import Image
import logging
from typing import Tuple

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """Image preprocessing for medical images"""
    
    def __init__(self, target_size: Tuple[int, int] = (240, 240)):
        """
        Initialize image preprocessor
        
        Args:
            target_size: Target size for resizing images
        """
        self.target_size = target_size
    
    def preprocess_mri_image(
        self,
        image_path: str
    ) -> np.ndarray:
        """
        Preprocess MRI image for brain tumor detection
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Preprocessed image array
        """
        try:
            # Read image
            image = cv2.imread(image_path)
            
            if image is None:
                # Try with PIL if OpenCV fails
                pil_image = Image.open(image_path)
                image = np.array(pil_image.convert('RGB'))
            
            # Convert BGR to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize to target size
            image = cv2.resize(image, self.target_size)
            
            # Apply contrast enhancement
            image = self._enhance_contrast(image)
            
            # Normalize pixel values to [0, 1]
            image = image.astype(np.float32) / 255.0
            
            return image
        
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    def _enhance_contrast(
        self,
        image: np.ndarray
    ) -> np.ndarray:
        """
        Enhance image contrast using CLAHE
        
        Args:
            image: Input image array
            
        Returns:
            Contrast-enhanced image
        """
        try:
            # Convert to LAB color space
            lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
            
            # Split channels
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE to L channel
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            
            # Merge channels
            lab = cv2.merge([l, a, b])
            
            # Convert back to RGB
            enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            
            return enhanced
        
        except Exception as e:
            logger.warning(f"Error enhancing contrast: {e}, returning original image")
            return image
    
    def validate_image(
        self,
        file_path: str,
        max_size_mb: int = 10
    ) -> Tuple[bool, str]:
        """
        Validate image file
        
        Args:
            file_path: Path to image file
            max_size_mb: Maximum allowed file size in MB
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        import os
        
        # Check if file exists
        if not os.path.exists(file_path):
            return False, "File does not exist"
        
        # Check file size
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        if file_size_mb > max_size_mb:
            return False, f"File size exceeds {max_size_mb}MB limit"
        
        # Check if file can be opened as image
        try:
            image = Image.open(file_path)
            image.verify()
            return True, "Valid image"
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"


# Global preprocessor instance
image_preprocessor = ImagePreprocessor()
