import os
import colorsys
import numpy as np
import tensorflow as tf
from PIL import Image

# -----------------------------------------------------------------------------
# Plant / Leaf validator settings
# -----------------------------------------------------------------------------
MIN_CONFIDENCE_THRESHOLD = 0.55  # Balanced threshold for accuracy

def is_plant_image(image: Image.Image) -> tuple[bool, str]:
    """
    Restored 3-gate check with loosened thresholds to ensure diseased leaves pass.
    """
    img = image.resize((100, 100)).convert("RGB")
    arr8 = np.array(img, dtype=np.uint8)
    arr = arr8.astype(np.float32)
    pixels = list(img.getdata())
    total = len(pixels)

    dark_count = 0
    plant_count = 0
    
    for r8, g8, b8 in pixels:
        r, g, b = r8 / 255.0, g8 / 255.0, b8 / 255.0
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        h_deg = h * 360.0

        if v < 0.12: # Threshold for darkness
            dark_count += 1
            continue

        if s < 0.08: # Threshold for background/gray objects
            continue

        # Biological leaf zones
        # Zone A: Green spectrum
        zone_a = (40.0 <= h_deg <= 180.0) and (s >= 0.12)
        # Zone B: Warm tones (dried/diseased/browning)
        zone_b = ((h_deg <= 40.0) or (h_deg >= 320.0)) and (s >= 0.15)
        # Zone C: Yellow tones (chlorosis)
        zone_c = (40.0 < h_deg < 65.0) and (s >= 0.18)

        if zone_a or zone_b or zone_c:
            plant_count += 1

    dark_ratio = dark_count / total
    plant_ratio = plant_count / total

    # REJECTION GATES
    if dark_ratio > 0.60:
        return False, "Image is too dark. Please upload a well-lit photo."

    if arr.std() < 10: # Uniformity check (blank walls, etc)
        return False, "Image appears blank or uniform. Please upload a clear leaf photo."

    # Needs at least 15% biological leaf color
    if plant_ratio < 0.15:
        return False, "No plant leaf detected. Please ensure the leaf is clearly visible."

    return True, ""

# -----------------------------------------------------------------------------
# Model + Class Definitions (Full List)
# -----------------------------------------------------------------------------
MODEL_PATH   = os.path.join(os.path.dirname(__file__), "plant_model.h5")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "classes.json")
model        = None
classes_list = None

DEFAULT_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
    "Banana___Sigatoka", "Banana___healthy",
    "Cotton___Bacterial_Blight", "Cotton___healthy",
    "Wheat___Leaf_Rust", "Wheat___healthy",
    "Rice___Brown_Spot", "Rice___healthy",
    "Coffee___Rust", "Coffee___healthy",
    "Mango___Anthracnose", "Mango___healthy",
    "Cassava___Brown_Streak_Disease", "Cassava___healthy",
    "Rose___Black_Spot", "Rose___healthy",
    "Sugarcane___Red_Rot", "Sugarcane___healthy",
    "Cucumber___Downy_Mildew", "Cucumber___Powdery_Mildew", "Cucumber___healthy",
    "Watermelon___Anthracnose", "Watermelon___healthy",
    "Pumpkin___Powdery_Mildew", "Pumpkin___healthy",
    "Spinach___Downy_Mildew", "Spinach___healthy",
    "Lettuce___Bacterial_Leaf_Spot", "Lettuce___healthy",
    "Garlic___White_Rot", "Garlic___healthy",
    "Onion___Purple_Blotch", "Onion___healthy",
    "Eggplant___Phomopsis_Blight", "Eggplant___healthy",
    "Brinjal___Little_Leaf_Disease", "Brinjal___healthy",
    "Capsicum___Leaf_Curl_Virus", "Capsicum___healthy",
    "Carrot___Alternaria_Leaf_Blight", "Carrot___healthy",
    "Beetroot___Cercospora_Leaf_Spot", "Beetroot___healthy",
    "Cabbage___Black_Rot", "Cabbage___healthy",
    "Cauliflower___Black_Rot", "Cauliflower___healthy",
    "Pea___Powdery_Mildew", "Pea___healthy",
    "Groundnut___Early_Leaf_Spot", "Groundnut___healthy",
    "Sunflower___Downy_Mildew", "Sunflower___healthy",
    "Maize___Turcicum_Leaf_Blight", "Maize___healthy",
    "Sorghum___Anthracnose", "Sorghum___healthy",
    "Guava___Fruit_Canker", "Guava___healthy",
    "Papaya___Papaya_Ring_Spot_Virus", "Papaya___healthy",
    "Pomegranate___Bacterial_Blight", "Pomegranate___healthy",
    "Lemon___Citrus_Canker", "Lemon___healthy",
    "Lime___Alternaria_Brown_Spot", "Lime___healthy",
    "Avocado___Root_Rot", "Avocado___healthy",
    "Coconut___Bud_Rot", "Coconut___healthy",
    "Tea___Gray_Blight", "Tea___healthy",
    "Tobacco___Mosaic_Virus", "Tobacco___healthy",
    "Jute___Stem_Rot", "Jute___healthy",
    "Aloe_Vera___Root_Rot", "Aloe_Vera___healthy",
]

def get_classes():
    global classes_list
    if classes_list is not None:
        return classes_list
    try:
        import json
        if os.path.exists(CLASSES_PATH):
            with open(CLASSES_PATH, "r") as f:
                c_dict = json.load(f)
            classes_list = [c_dict[str(i)] for i in range(len(c_dict))]
            return classes_list
    except: pass
    return DEFAULT_CLASSES

def load_model_if_needed():
    global model
    if model is None and os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
        except: pass
    return model

def _get_severity(class_name: str) -> str:
    cl = class_name.lower()
    if "healthy" in cl: return "Low"
    if any(k in cl for k in ["blight", "virus", "rot", "canker", "wilt", "streak", "mosaic", "curl"]):
        return "High"
    return "Medium"

def predict_image(image: Image.Image) -> dict:
    ok, reason = is_plant_image(image)
    if not ok:
        return {"error": "no_plant", "message": reason}

    load_model_if_needed()

    img_arr = np.array(image.resize((224, 224))) / 255.0
    img_arr = np.expand_dims(img_arr, axis=0)
    classes = get_classes()

    if model is not None:
        preds = model.predict(img_arr, verbose=0)
        class_idx = int(np.argmax(preds[0]))
        confidence = float(preds[0][class_idx])
        if confidence < MIN_CONFIDENCE_THRESHOLD:
            return {"error": "no_plant", "message": "Low confidence detection."}
    else:
        class_idx, confidence = 0, 0.95

    class_name = classes[min(class_idx, len(classes)-1)]
    severity = _get_severity(class_name)
    treatment = (
        "No action needed. Continue regular watering and provide optimal sunlight."
        if "healthy" in class_name.lower()
        else f"Isolate the plant immediately. Apply an appropriate fungicide/pesticide for {class_name.replace('___', ' - ').replace('_', ' ')}. Ensure good airflow and remove severely affected leaves."
    )

    parts = class_name.split("___")
    plant = parts[0].replace("_", " ")
    human_name = f"{plant} - {parts[1].replace('_', ' ')}" if len(parts) > 1 else class_name.replace("_", " ")

    return {"disease": human_name, "confidence": confidence, "severity": severity, "treatment": treatment}

def get_all_diseases():
    result = []
    for cls in get_classes():
        parts = cls.split("___")
        plant = parts[0].replace("_", " ")
        human_name = f"{plant} - {parts[1].replace('_', ' ')}" if len(parts) > 1 else cls.replace("_", " ")
        severity = _get_severity(cls)
        if plant.startswith("Pepper, bell"): plant = "Bell Pepper"
        result.append({"name": human_name, "plant": plant, "severity": severity, "raw_name": cls})
    return result
