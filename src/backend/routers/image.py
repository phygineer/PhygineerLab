import io
import base64
from ultralytics import YOLO
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
from io import BytesIO
import cv2
import ssl
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel


ssl._create_default_https_context = ssl._create_unverified_context

router = APIRouter()

# Load the YOLO model (ensure you have the correct model in your environment)
model = YOLO("yolo11x.pt")


class ImageRequest(BaseModel):
    image: str

@router.get("/detectable-objects")
async def get_detectable_objects():
    return model.names

def convert_image_to_base64(image: np.ndarray) -> str:
    """Convert an image (np.ndarray) to a base64 string."""
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')

def convert_base64_to_image(base64_str: str) -> np.ndarray:
    """Convert a base64 string to an OpenCV image (np.ndarray)."""
    img_data = base64.b64decode(base64_str)
    img = Image.open(BytesIO(img_data))
    img_cv = np.array(img)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)
    return img_cv

@router.post("/detect-image/")
async def image_detection(request: ImageRequest):
    try:
        # Extract the base64-encoded image from the request
        base64_image = request.image
        if not base64_image:
            raise HTTPException(status_code=400, detail="No image found in the request body")

        # Convert base64 string to OpenCV image format
        img_cv = convert_base64_to_image(base64_image)

        # Run YOLO model to detect objects
        results = model(img_cv)

        # Draw bounding boxes for each detected object
        for result in results:
            for box in result.boxes:  # Accessing bounding boxes
                x1, y1, x2, y2 = map(int, box.xyxy[0])  # Box coordinates
                cls = int(box.cls.item())  # Convert class tensor to int
                conf = float(box.conf.item())  # Convert confidence tensor to float
                label = f"{model.names[cls]} {conf:.2f}"  # Format label with class name and confidence

                # Draw the bounding box and label on the image
                cv2.rectangle(img_cv, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(img_cv, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

        # Convert image with labels to base64
        base64_img = convert_image_to_base64(img_cv)

        return JSONResponse(content={"image": base64_img})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert-image-to-b64/")
async def image_to_base64(file: UploadFile = File(...)):
    # Read the uploaded image file
    image_bytes = await file.read()
    
    # Convert image to Base64
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    
    # Return the Base64 encoded image
    return {"image": encoded_image}

@router.post("/convert-b64-to-image/")
async def base64_to_image(request: ImageRequest):
    try:
        # Decode the base64 image string from the request
        img_data = base64.b64decode(request.image)

        # Create a BytesIO object to hold the image data
        image_file = BytesIO(img_data)

        # Return the image as a StreamingResponse
        return StreamingResponse(image_file, media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {e}")
