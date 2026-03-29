from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from io import BytesIO
from PIL import Image
from model.predict import predict_image, get_all_diseases
from disease_info import get_disease_info
import os
import re

app = FastAPI(title="Plant Disease Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(BytesIO(contents)).convert("RGB")
    result = predict_image(image)
    return result

@app.get("/diseases")
def list_diseases():
    return {"diseases": get_all_diseases()}

@app.get("/disease-info/{disease_name:path}")
def disease_detail(disease_name: str):
    info = get_disease_info(disease_name)
    return info

@app.get("/image/{class_name}")
def get_class_image(class_name: str):
    safe_name = class_name.replace("/", "").replace("\\", "").replace("..", "")
    folder_path = os.path.join(os.path.dirname(__file__), "PlantVillage", safe_name)
    if os.path.exists(folder_path):
        for f in os.listdir(folder_path):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                return FileResponse(os.path.join(folder_path, f))
    return {"error": "Image not found"}


# ─────────────────────────────────────────────────────────────────────────────
# FloraBot Chat — Intent-based engine powered by disease knowledge base
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    disease: str

def _tokenize(text: str) -> set:
    """Return a set of lowercase alpha tokens — real word boundary matching."""
    return set(re.findall(r"[a-z]+", text.lower()))

def _numbered_list(items: list, limit: int = 5) -> str:
    return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items[:limit]))

@app.post("/chat")
def chat_bot(req: ChatRequest):
    raw = req.message.strip()
    msg = raw.lower()
    words = _tokenize(msg)
    disease = req.disease or "your plant condition"
    is_healthy = "healthy" in disease.lower()

    # Pull rich info from the knowledge base
    info = get_disease_info(disease)

    # ── GREETING (exact word match — no more false triggers from "which"/"this") ──
    GREETINGS = {"hi", "hii", "hiii", "hello", "hey", "hola", "greetings", "howdy", "wassup", "sup", "heya"}
    if words & GREETINGS:
        if is_healthy:
            return {"reply": (
                f"Hey there! I'm FloraBot 🌿\n\n"
                f"Great news — your plant scan shows: {disease} ✅\n\n"
                "Ask me about:\n• Watering tips\n• Sunlight needs\n• Soil & nutrition\n• Prevention advice"
            )}
        return {"reply": (
            f"Hey! I'm FloraBot 🌿\n\n"
            f"Your scan detected: {disease}\n\n"
            "You can ask me:\n"
            "• What caused this?\n"
            "• What are the symptoms?\n"
            "• How do I treat it?\n"
            "• How do I prevent it?\n"
            "• What is the impact on my crop?\n"
            "• How serious/urgent is it?\n\n"
            "What would you like to know?"
        )}

    # ── OVERVIEW ──────────────────────────────────────────────────────────────
    if any(p in msg for p in ["what is", "tell me about", "explain", "describe", "overview", "what's this", "about this", "summarize"]):
        return {"reply": f"About {disease}:\n\n{info['overview']}"}

    # ── CAUSES ───────────────────────────────────────────────────────────────
    if words & {"cause", "causes", "caused", "why", "reason", "reasons", "origin", "how", "happens", "trigger", "triggers"}:
        if is_healthy:
            return {"reply": "Your plant is healthy — no disease causes to worry about! Keep maintaining your current care routine."}
        return {"reply": f"What causes {disease}:\n\n{_numbered_list(info['causes'])}"}

    # ── SYMPTOMS ─────────────────────────────────────────────────────────────
    if words & {"symptom", "symptoms", "signs", "sign", "look", "looks", "appear", "appearance", "identify", "detect", "recognize", "visible"}:
        return {"reply": f"Symptoms of {disease}:\n\n{_numbered_list(info['symptoms'])}"}

    # ── TREATMENT ────────────────────────────────────────────────────────────
    if words & {"treat", "treatment", "cure", "fix", "medicine", "fungicide", "spray", "heal", "control", "manage", "help", "rid", "remove", "apply", "steps"}:
        if is_healthy:
            return {"reply": (
                "Your plant is healthy — no treatment needed! 🌱\n\n"
                "1. Water consistently at the base — avoid wetting leaves.\n"
                "2. Apply balanced NPK fertilizer monthly.\n"
                "3. Ensure 6–8 hours of sunlight daily.\n"
                "4. Monitor monthly for any early signs of disease."
            )}
        return {"reply": f"Treatment steps for {disease}:\n\n{_numbered_list(info['treatment'])}"}

    # ── PREVENTION ───────────────────────────────────────────────────────────
    if words & {"prevent", "prevention", "avoid", "stop", "future", "protect", "protection", "next", "recurring", "again"}:
        return {"reply": f"How to prevent {disease}:\n\n{_numbered_list(info['prevention'])}"}

    # ── IMPACT / DRAWBACKS ───────────────────────────────────────────────────
    if words & {"impact", "damage", "loss", "yield", "effect", "effects", "affect", "drawback", "drawbacks", "consequence", "consequences", "risk", "serious", "dangerous", "bad", "economic", "loss"}:
        return {"reply": f"Impact & drawbacks of {disease}:\n\n{_numbered_list(info['impact'])}"}

    # ── SEVERITY / URGENCY ───────────────────────────────────────────────────
    if words & {"severity", "severe", "serious", "urgent", "critical", "mild", "danger", "dangerous", "emergency", "bad", "how", "worse", "worst"}:
        if is_healthy:
            return {"reply": f"Severity: Low ✅\n\nYour plant is healthy. No urgent action needed — just maintain your regular care routine."}
        sev = "High" if any(k in disease.lower() for k in ["blight", "virus", "rot", "wilt", "mosaic", "streak", "canker"]) else "Medium"
        tips = {
            "High": "Act immediately — isolate the plant, apply appropriate fungicide/bactericide today, and monitor daily.",
            "Medium": "Address within 48–72 hours. Remove infected leaves and apply treatment to prevent further spread."
        }
        return {"reply": f"Severity of {disease}: {sev}\n\n{tips[sev]}\n\nAsk me 'how to treat it?' for detailed steps."}

    # ── SPREAD / CONTAGIOUS ──────────────────────────────────────────────────
    if words & {"spread", "contagious", "infect", "infectious", "neighbor", "other", "nearby", "transfer", "contact"}:
        if is_healthy:
            return {"reply": "A healthy plant poses no infection risk to its neighbours. Keep up the good work!"}
        return {"reply": (
            f"Can {disease} spread?\n\n"
            "Yes — it can spread through:\n"
            "1. Rain or irrigation water splashing spores/bacteria.\n"
            "2. Wind carrying spores to nearby plants.\n"
            "3. Insects or contaminated gardening tools.\n"
            "4. Direct plant-to-plant contact.\n\n"
            "Isolate the affected plant immediately and disinfect tools before touching healthy plants."
        )}

    # ── WATERING ─────────────────────────────────────────────────────────────
    if words & {"water", "watering", "irrigation", "moisture", "drought", "wet", "dry", "irrigate", "thirsty"}:
        return {"reply": (
            "Watering tips:\n\n"
            "1. Always water at the base — never overhead.\n"
            "2. Let the top 1 inch of soil dry between waterings.\n"
            "3. Morning watering is best — leaves dry before nightfall.\n"
            "4. Consistent moisture reduces plant stress and disease risk.\n"
            "5. Use drip irrigation for best results in disease prevention."
        )}

    # ── SUNLIGHT ─────────────────────────────────────────────────────────────
    if words & {"sun", "sunlight", "light", "shade", "indoor", "outdoor", "shadow", "dark", "bright"}:
        return {"reply": (
            "Sunlight guidelines:\n\n"
            "1. Most plants need 6–8 hours of direct sunlight per day.\n"
            "2. Avoid harsh afternoon sun in extreme heat — use shade cloth.\n"
            "3. For indoor plants, place near a south-facing window.\n"
            "4. Rotate pots weekly for even light exposure.\n"
            "5. Insufficient light weakens plants and increases disease susceptibility."
        )}

    # ── SOIL / NUTRIENTS ─────────────────────────────────────────────────────
    if words & {"soil", "fertilize", "fertilizer", "nutrient", "nutrients", "nitrogen", "potassium", "phosphorus", "compost", "ph", "feed", "feeding", "deficiency"}:
        return {"reply": (
            "Soil & nutrition advice:\n\n"
            "1. Maintain soil pH between 6.0–6.8 for most plants.\n"
            "2. Apply balanced NPK fertilizer at the start of the growing season.\n"
            "3. Add compost to improve soil structure and microbial health.\n"
            "4. Avoid excess nitrogen — it makes plants more disease-prone.\n"
            "5. Test your soil every 2 years to catch deficiencies early."
        )}

    # ── THANKS / POSITIVE ACKNOWLEDGEMENT ────────────────────────────────────
    if words & {"thanks", "thank", "ty", "thx", "bye", "goodbye", "cheers", "great", "awesome", "perfect", "nice", "good", "ok", "okay", "cool", "helpful", "appreciate"}:
        return {"reply": "You're welcome! Happy growing! 🌱 Feel free to come back with any other plant health questions."}

    # ── FALLBACK ─────────────────────────────────────────────────────────────
    return {"reply": (
        f"I didn't quite catch that, but I can help you with {disease}!\n\n"
        "Try asking:\n"
        "• 'What caused this disease?'\n"
        "• 'What are the symptoms?'\n"
        "• 'How do I treat it?'\n"
        "• 'How do I prevent it?'\n"
        "• 'What is the impact on my crop?'\n"
        "• 'Is it serious?'\n"
        "• 'Watering / soil / sunlight tips'\n\n"
        "What would you like to know?"
    )}
