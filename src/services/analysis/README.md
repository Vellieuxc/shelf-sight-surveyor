
# OCR-based Shelf Image Analysis Module

This module provides functionality to analyze merchandising shelf images using Tesseract OCR.

## Components

- `ocr_analyzer.py` - Core Python module that performs OCR analysis
- `fastapi_server.py` - FastAPI server exposing the OCR functionality as a REST API
- `ocr_api_connector.ts` - TypeScript connector to the OCR API
- `ocr_service.ts` - TypeScript service for integrating with the OCR analyzer

## Features

- Extracts product information from shelf images:
  - SKU name
  - Brand
  - Price
  - Flavor
  - Pack size
- Preprocesses images to improve OCR accuracy
- Handles error scenarios gracefully

## Requirements

### Python Dependencies
```
pip install pytesseract pillow opencv-python fastapi uvicorn requests
```

### System Dependencies
- Tesseract OCR must be installed on the system
  - Ubuntu/Debian: `apt-get install tesseract-ocr`
  - macOS: `brew install tesseract`
  - Windows: Download installer from https://github.com/UB-Mannheim/tesseract/wiki

## Usage

### Starting the FastAPI Server
```bash
cd src/services/analysis
uvicorn fastapi_server:app --reload
```

### Frontend Integration
The TypeScript service can be integrated with the frontend by importing and using the `analyzeWithOcr` function.

## API Endpoints

- `POST /analyze` - Submit an image for analysis
- `GET /status/{jobId}` - Check the status of an analysis job
- `GET /health` - Health check endpoint
- `DELETE /cleanup` - Clean up old analysis jobs

## Implementation Notes

This implementation replaces the previous Edge Analyzer with a Python-based OCR solution.
The module is designed to be modular and extensible, allowing for future enhancements.

Key improvements that could be made:
- Add object detection to identify individual products on a shelf
- Implement more sophisticated text parsing rules
- Add a database backend for persistent job storage
- Add authentication and rate limiting for the API
