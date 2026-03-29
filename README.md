# Plant Disease Detector

An AI-powered application to instantly diagnose 38 plant diseases from uploading or taking photos of plant leaves.

## Technologies Used
- **Frontend**: React + TypeScript + Vite + custom Vanilla CSS (Dark green theme, glassmorphism)
- **Backend**: FastAPI + Python
- **ML Model**: MobileNetV2 fine-tuned on PlantVillage dataset
- **Dataset**: PlantVillage Dataset (38 classes)

## Quick Start Guide

### 1. Backend Server
Navigate to the `backend/` directory and run the setup script:
```bash
cd backend
start.bat
```
This script creates a Python virtual environment, installs all requirements, and starts the FastAPI server on port 8000. Keep this terminal open.

### 2. Frontend Application
Navigate to the `frontend/` directory, install Node dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to the URL displayed in the terminal (usually `http://localhost:5173`).

### 3. Usage
- Go to the **Scan** page to test the app.
- You can upload an image from your computer or use your laptop/mobile web camera to snap a photo of a leaf.
- Note: If `plant_model.h5` model does not exist, the backend will still run and provide dummy predictions to allow full end-to-end testing of the UI.
- To train a real model with your local GPUs, place the PlantVillage dataset inside `backend/PlantVillage` and run `python model/train.py`.

## Folder Structure
- `backend/`
  - `main.py` - FastAPI entry point serving predictions and data.
  - `model/predict.py` - ML model loading, preprocessing, inference mapping.
  - `model/train.py` - Script using Keras ImageDataGenerator and MobileNetV2 base to create the h5 file.
- `frontend/`
  - `src/App.tsx` - App routing with React Router.
  - `src/pages/` - Home, Scan, Result, Encyclopedia pages.
  - `src/index.css` - Custom design system handling dark/lime colors and glass animations.
