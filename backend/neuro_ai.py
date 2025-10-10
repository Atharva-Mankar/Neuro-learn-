import tensorflow as tf
import numpy as np
import mediapipe as mp
import cv2
import os

# Load your trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "NeuroLearn_Model", "eye_state_model.h5")
model = tf.keras.models.load_model(MODEL_PATH)

# Initialize Mediapipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1)

def extract_eye_features(frame):
    """
    Extracts eye landmarks (x, y) normalized from a webcam frame.
    Returns a flat list of coordinates.
    """
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)
    
    if not result.multi_face_landmarks:
        return None

    landmarks = result.multi_face_landmarks[0].landmark
    indices = [
        33, 133, 160, 159, 158, 157, 173, 246,  # Left eye
        362, 263, 387, 386, 385, 384, 398, 373  # Right eye
    ]
    coords = []
    for i in indices:
        coords.extend([landmarks[i].x, landmarks[i].y])
    return coords

def predict_from_eye_data(landmarks):
    """
    Takes 32 landmark coordinates (x,y) and predicts fatigue/focus state.
    """
    arr = np.array(landmarks, dtype=np.float32).reshape(1, -1)
    prediction = model.predict(arr, verbose=0)[0][0]
    label = "Fatigued" if prediction > 0.5 else "Focused"
    confidence = round(float(prediction if label == "Fatigued" else 1 - prediction), 3)
    return {"prediction": label, "confidence": confidence}
