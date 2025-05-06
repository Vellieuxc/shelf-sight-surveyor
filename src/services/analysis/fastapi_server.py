
"""
FastAPI Server for OCR Analysis

This module provides a FastAPI server that exposes the OCR analyzer as a REST API.
It serves as the interface between the frontend and the OCR analyzer.
"""

from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import requests
from io import BytesIO
from PIL import Image
import uuid
import logging
import time

# Import OCR analyzer module
from .ocr_analyzer import analyze_shelf_image

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Merchandising OCR Analysis API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class AnalysisRequest(BaseModel):
    imageUrl: HttpUrl
    imageId: str
    options: Optional[Dict[str, Any]] = None

# Response models for analysis
class AnalysisJob(BaseModel):
    success: bool
    jobId: str
    status: str
    data: list = []
    error: Optional[str] = None

# Store for background jobs
analysis_jobs = {}

async def fetch_and_analyze_image(imageUrl: str, imageId: str, jobId: str, options: Dict[str, Any] = None):
    """
    Fetch an image and analyze it in the background
    
    Args:
        imageUrl: URL of the image to fetch
        imageId: ID of the image for reference
        jobId: ID of the analysis job
        options: Additional options for analysis
    """
    try:
        # Update job status
        analysis_jobs[jobId] = {
            "status": "processing",
            "data": [],
            "error": None
        }
        
        # Fetch the image
        logger.info(f"Fetching image from URL: {imageUrl}")
        response = requests.get(imageUrl, timeout=options.get("timeout", 30) if options else 30)
        response.raise_for_status()
        
        # Convert to PIL Image
        image = Image.open(BytesIO(response.content))
        image.name = imageId  # Add the image ID as an attribute
        
        # Analyze the image
        logger.info(f"Analyzing image: {imageId}")
        analysis_result = analyze_shelf_image(image)
        
        # Update job with results
        analysis_jobs[jobId] = {
            "status": "completed",
            "data": analysis_result.get("data", []),
            "error": analysis_result.get("error")
        }
        
        logger.info(f"Analysis completed for job: {jobId}")
        
    except Exception as e:
        logger.error(f"Error in background analysis: {str(e)}")
        analysis_jobs[jobId] = {
            "status": "error",
            "data": [],
            "error": str(e)
        }

@app.post("/analyze", response_model=AnalysisJob)
async def analyze_image(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Endpoint for image analysis
    
    Args:
        request: Analysis request with image URL and options
        background_tasks: FastAPI background tasks handler
    
    Returns:
        AnalysisJob: The analysis job information
    """
    try:
        logger.info(f"Received analysis request for image: {request.imageId}")
        
        # Generate job ID
        jobId = f"ocr-{uuid.uuid4()}"
        
        # Initialize job status
        analysis_jobs[jobId] = {
            "status": "pending",
            "data": [],
            "error": None
        }
        
        # Start background analysis
        background_tasks.add_task(
            fetch_and_analyze_image, 
            request.imageUrl, 
            request.imageId, 
            jobId, 
            request.options
        )
        
        return AnalysisJob(
            success=True,
            jobId=jobId,
            status="pending"
        )
        
    except Exception as e:
        logger.error(f"Error processing analysis request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{jobId}", response_model=AnalysisJob)
async def get_analysis_status(jobId: str):
    """
    Get the status of an analysis job
    
    Args:
        jobId: ID of the analysis job
    
    Returns:
        AnalysisJob: The analysis job status and results if available
    """
    if jobId not in analysis_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = analysis_jobs[jobId]
    
    return AnalysisJob(
        success=job["status"] == "completed",
        jobId=jobId,
        status=job["status"],
        data=job["data"],
        error=job["error"]
    )

# Cleanup endpoint to remove old jobs (optional, could be handled by scheduled task)
@app.delete("/cleanup")
async def cleanup_old_jobs():
    """
    Clean up old analysis jobs
    
    Returns:
        Dict: Result of the cleanup operation
    """
    count_before = len(analysis_jobs)
    
    # Get current time
    current_time = time.time()
    
    # Consider jobs older than 1 hour for cleanup
    cutoff_time = current_time - (60 * 60)  
    
    # Filter jobs to keep (would need to add timestamp to jobs)
    # This is a simplified version
    for job_id in list(analysis_jobs.keys())[:]:
        job = analysis_jobs[job_id]
        # In a real implementation, check job timestamp against cutoff
        if job["status"] in ["completed", "error"]:
            # Consider completed or error jobs for cleanup
            del analysis_jobs[job_id]
    
    count_after = len(analysis_jobs)
    
    return {
        "success": True,
        "removed_jobs": count_before - count_after,
        "remaining_jobs": count_after
    }

@app.get("/health")
async def health_check():
    """
    Simple health check endpoint
    
    Returns:
        Dict: Health status
    """
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
