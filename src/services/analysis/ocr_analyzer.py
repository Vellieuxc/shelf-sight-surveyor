
"""
OCR Analyzer Module

This module provides functionality for analyzing merchandising images using Tesseract OCR.
It extracts product information such as SKU name, brand, price, flavor, and pack size.
"""

import os
import re
import json
import logging
from typing import Dict, Any, List, Optional, Union
from pathlib import Path

import cv2
import pytesseract
import numpy as np
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Common flavor terms that might appear in product descriptions
FLAVOR_KEYWORDS = [
    'vanilla', 'chocolate', 'strawberry', 'mint', 'cherry', 'lemon', 'lime', 'orange',
    'grape', 'apple', 'peach', 'coconut', 'coffee', 'caramel', 'banana', 'berry',
    'raspberry', 'blueberry', 'blackberry', 'mango', 'watermelon', 'honey', 'cinnamon',
    'pineapple', 'tropical', 'original', 'natural', 'unflavored', 'plain',
    'menthol', 'peppermint', 'spearmint', 'eucalyptus'
]

# Common pack size patterns
PACK_SIZE_PATTERNS = [
    r'\b\d+\s*ml\b',          # 500ml
    r'\b\d+\s*l\b',           # 2l
    r'\b\d+\s*liter\w*\b',    # 2 liter, 2 liters
    r'\b\d+\s*oz\b',          # 16oz
    r'\b\d+\s*pack\b',        # 6-pack
    r'\b\d+\s*count\b',       # 24 count
    r'\b\d+\s*ct\b',          # 24ct
    r'\b\d+\s*pk\b',          # 6pk
    r'\b\d+\s*g\b',           # 500g
    r'\b\d+\s*kg\b',          # 1kg
    r'\b\d+\s*gram\w*\b',     # 500 grams
    r'\b\d+\s*tab\w*\b',      # 20 tablets
    r'\b\d+\s*cap\w*\b',      # 30 capsules
    r'\b\d+-\s*pack\b',       # 6-pack
    r'\b\d+-\s*ct\b',         # 24-ct
    r'\b\d+x\d+\s*\w+\b',     # 3x500ml
]

def preprocess_image(image: Union[str, Path, np.ndarray, Image.Image]) -> np.ndarray:
    """
    Preprocess the image for better OCR results.
    
    Args:
        image: Can be a file path or a numpy array or PIL Image
    
    Returns:
        Preprocessed image as numpy array
    """
    try:
        # Convert input to numpy array if needed
        if isinstance(image, str) or isinstance(image, Path):
            logger.info(f"Loading image from path: {image}")
            img = cv2.imread(str(image))
            if img is None:
                raise ValueError(f"Could not load image from path: {image}")
        elif isinstance(image, Image.Image):
            img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        else:
            img = image
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
        
        # Apply noise reduction
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        logger.info("Image preprocessing completed")
        return denoised
        
    except Exception as e:
        logger.error(f"Error during image preprocessing: {e}")
        raise
        
def extract_text(image: Union[str, Path, np.ndarray, Image.Image]) -> str:
    """
    Extract all text from an image using Tesseract OCR.
    
    Args:
        image: Image to analyze (file path, numpy array, or PIL Image)
    
    Returns:
        Extracted text from the image
    """
    try:
        # Preprocess the image
        preprocessed_img = preprocess_image(image)
        
        # Apply OCR
        logger.info("Performing OCR on preprocessed image")
        text = pytesseract.image_to_string(preprocessed_img)
        
        logger.info(f"Extracted {len(text)} characters of text")
        return text
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        raise

def extract_price(text: str) -> Optional[str]:
    """
    Extract price information from text.
    
    Args:
        text: Text extracted from the image
    
    Returns:
        Extracted price or None if not found
    """
    # Common price patterns
    patterns = [
        r'\$\d+\.\d{2}',               # $10.99
        r'€\d+\.\d{2}',                # €10.99
        r'£\d+\.\d{2}',                # £10.99
        r'\d+\.\d{2}\s*[$€£]',         # 10.99$
        r'\$\d+',                      # $10
        r'€\d+',                       # €10
        r'£\d+',                       # £10
        r'\d+\s*[$€£]',                # 10$
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            logger.info(f"Found price: {matches[0]}")
            return matches[0]
    
    logger.info("No price found")
    return None

def extract_brand(text: str) -> Optional[str]:
    """
    Extract brand information from text.
    This is a simplified implementation that would need refinement based on specific datasets.
    
    Args:
        text: Text extracted from the image
    
    Returns:
        Extracted brand or None if not found
    """
    # Split text into lines and get the first word of each line as potential brand
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Simple heuristic: brands are often capitalized words at the beginning of text
    potential_brands = []
    
    for line in lines:
        words = line.split()
        if not words:
            continue
            
        # Consider first word if it's capitalized and not a common word
        first_word = words[0]
        if first_word[0].isupper() and len(first_word) > 1:
            potential_brands.append(first_word)
    
    if potential_brands:
        logger.info(f"Potential brand found: {potential_brands[0]}")
        return potential_brands[0]
    
    logger.info("No brand identified")
    return None

def extract_flavor(text: str) -> Optional[str]:
    """
    Extract flavor information from text based on common flavor keywords.
    
    Args:
        text: Text extracted from the image
    
    Returns:
        Extracted flavor or None if not found
    """
    text_lower = text.lower()
    
    for flavor in FLAVOR_KEYWORDS:
        # Match whole words only
        pattern = r'\b' + flavor + r'\b'
        if re.search(pattern, text_lower):
            logger.info(f"Found flavor: {flavor}")
            return flavor
    
    logger.info("No flavor identified")
    return None

def extract_pack_size(text: str) -> Optional[str]:
    """
    Extract pack size information from text.
    
    Args:
        text: Text extracted from the image
    
    Returns:
        Extracted pack size or None if not found
    """
    for pattern in PACK_SIZE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            logger.info(f"Found pack size: {matches[0]}")
            return matches[0]
    
    logger.info("No pack size found")
    return None

def extract_sku_name(text: str) -> Optional[str]:
    """
    Extract likely SKU name from text.
    This is a simplified implementation that needs refinement based on specific datasets.
    
    Args:
        text: Text extracted from the image
    
    Returns:
        Extracted SKU name or None if not found
    """
    # Simple heuristic: look for the longest line that might be a product name
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    if not lines:
        logger.info("No text found for SKU name extraction")
        return None
    
    # Find lines that are most likely to be product names
    potential_names = []
    for line in lines:
        # Skip very short lines or those that look like prices
        if len(line) < 5 or re.search(r'\$\d+\.\d{2}', line):
            continue
        potential_names.append(line)
    
    if potential_names:
        # Select the longest potential name
        sku_name = max(potential_names, key=len)
        logger.info(f"Extracted SKU name: {sku_name}")
        return sku_name
    
    logger.info("No suitable SKU name found")
    return None

def analyze_image(image: Union[str, Path, np.ndarray, Image.Image]) -> Dict[str, Any]:
    """
    Analyze a merchandising image and extract product information.
    
    Args:
        image: Image to analyze (file path, numpy array, or PIL Image)
    
    Returns:
        Dictionary containing the extracted product information
    """
    try:
        logger.info("Starting image analysis")
        
        # Extract text from image
        text = extract_text(image)
        
        # Extract product information
        sku_name = extract_sku_name(text)
        brand = extract_brand(text)
        price = extract_price(text)
        flavor = extract_flavor(text)
        pack_size = extract_pack_size(text)
        
        # Construct result
        result = {
            "SKUFullName": sku_name,
            "SKUBrand": brand,
            "PriceSKU": price,
            "Flavor": flavor,
            "PackSize": pack_size,
            # Additional fields with null values for compatibility
            "ProductCategory1": None,
            "ProductCategory2": None,
            "ProductCategory3": None,
            "NumberFacings": 1,
            "ShelfSection": None,
            "OutofStock": False,
            "Misplaced": False,
            "BoundingBox": None,
            "Tags": [],
            "ImageID": getattr(image, 'name', None) if isinstance(image, (str, Path)) else None
        }
        
        logger.info("Analysis completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error during image analysis: {e}")
        return {
            "SKUFullName": None,
            "SKUBrand": None,
            "PriceSKU": None,
            "Flavor": None,
            "PackSize": None,
            "ProductCategory1": None,
            "ProductCategory2": None,
            "ProductCategory3": None,
            "NumberFacings": None,
            "ShelfSection": None,
            "OutofStock": None,
            "Misplaced": None,
            "BoundingBox": None,
            "Tags": ["Error occurred during analysis"],
            "ImageID": None,
            "Error": str(e)
        }

def analyze_shelf_image(image: Union[str, Path, np.ndarray, Image.Image]) -> Dict[str, Any]:
    """
    Public API function to analyze a shelf image and return structured data.
    This function handles breaking down the image into potential product sections
    and analyzing each one.
    
    Args:
        image: Image to analyze (file path, numpy array, or PIL Image)
    
    Returns:
        JSON-compatible dictionary with analysis results
    """
    try:
        logger.info("Beginning shelf image analysis")
        
        # For simplicity in this initial version, we'll just analyze the whole image
        # In a production version, we would implement more sophisticated
        # object detection to identify individual products in the shelf
        
        # Process the image
        result = analyze_image(image)
        
        # Return results in the format expected by the application
        return {
            "success": True,
            "jobId": "ocr-analysis-job",
            "status": "completed",
            "data": [result],
        }
        
    except Exception as e:
        logger.error(f"Shelf image analysis failed: {e}")
        return {
            "success": False,
            "jobId": "ocr-analysis-job",
            "status": "failed",
            "data": [],
            "error": str(e)
        }

# If run directly, process a test image
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        try:
            result = analyze_shelf_image(image_path)
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("Please provide an image path")
