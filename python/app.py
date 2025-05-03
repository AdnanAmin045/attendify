import cv2
import numpy as np
import face_recognition
import base64
from flask import Flask, jsonify, request
import threading

app = Flask(__name__)

camera_thread = None
camera_running = False
student_encodings = []  # List of dicts: {id, full_name, regno, encoding}
detected_student_ids = set()

def decode_student_images(students):
    global student_encodings
    student_encodings = []

    for student in students:
        image_data = base64.b64decode(student['image_bytea'])
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(rgb_img)

        if len(encodings) == 0:
            print(f"WARNING: No face found for student {student['id']}")
            continue

        student_encodings.append({
            'id': student['id'],
            'full_name': student['full_name'],
            'regno': student['regno'],
            'encoding': encodings[0]
        })

def camera_worker():
    global camera_running, student_encodings, detected_student_ids

    print("Camera worker started")
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("ERROR: Could not open camera")
        camera_running = False  # Make sure to stop the loop
        return

    while camera_running:
        ret, frame = cap.read()
        if not ret:
            print("WARNING: Failed to read frame from camera")
            continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for (top, right, bottom, left), live_encoding in zip(face_locations, face_encodings):
            match_found = False
            matched_student = None

            for student in student_encodings:
                # Using a stricter tolerance for face matching
                match = face_recognition.compare_faces([student['encoding']], live_encoding, tolerance=0.4)[0]
                if match:
                    match_found = True
                    matched_student = student
                    break

            if match_found and matched_student:
                label = f"{matched_student['full_name']} ({matched_student['regno']})"
                color = (0, 255, 0)

                if matched_student['id'] not in detected_student_ids:
                    detected_student_ids.add(matched_student['id'])  # Add ID to set

            else:
                label = "Unknown"
                color = (0, 0, 255)

            # Drawing the rectangle and label with student details
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.putText(frame, label, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        cv2.imshow('Live Face Match', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            camera_running = False

    cap.release()
    cv2.destroyAllWindows()
    print("Camera stopped")

@app.route('/start-camera', methods=['POST'])
def start_camera():
    global camera_thread, camera_running, detected_student_ids

    print("API /start-camera called")

    students = request.json.get('students', [])
    if not students:
        print("ERROR: No students data provided")
        return jsonify({"status": "error", "message": "No students data provided"}), 400

    decode_student_images(students)
    detected_student_ids.clear()

    if len(student_encodings) == 0:
        print("ERROR: No valid student faces detected")
        return jsonify({"status": "error", "message": "No valid student faces detected"}), 400

    if camera_thread is None or not camera_thread.is_alive():
        print("Starting new camera thread")
        camera_running = True
        camera_thread = threading.Thread(target=camera_worker)
        camera_thread.start()
        return jsonify({"status": "success", "message": "Camera started with student data"})
    else:
        print("Camera already running")
        return jsonify({"status": "info", "message": "Camera already running"})

@app.route('/stop-camera', methods=['GET'])
def stop_camera():
    global camera_running, detected_student_ids
    camera_running = False
    print("API /stop-camera called")
    return jsonify({
        "status": "success",
        "message": "Stopping camera",
        "detected_student_ids": list(detected_student_ids)
    })

if __name__ == '__main__':
    print("Flask app starting...")
    app.run(host='0.0.0.0', port=5001)
