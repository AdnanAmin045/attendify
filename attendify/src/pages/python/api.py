import cv2
import numpy as np
import face_recognition
import base64
from flask import Flask, request, jsonify

app = Flask(__name__)

# Function to decode base64 image
def decode_base64_image(base64_str):
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

@app.route('/match-faces', methods=['POST'])
def match_faces():
    data = request.get_json()
    students = data.get('students', [])
    matched_ids = []

    known_encodings = []
    student_ids = []

    # Process each student image
    for student in students:
        student_id = student['id']
        base64_img = student['image_bytes']
        img = decode_base64_image(base64_img)

        # Convert BGR to RGB
        rgb_img = img[:, :, ::-1]

        # Get face encodings
        face_locations = face_recognition.face_locations(rgb_img)
        if len(face_locations) == 0:
            continue  # Skip if no face found

        encoding = face_recognition.face_encodings(rgb_img, face_locations)[0]
        known_encodings.append(encoding)
        student_ids.append(student_id)

    # Open camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return jsonify({"error": "Could not open camera"}), 500

    match_found = [False] * len(student_ids)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        rgb_frame = frame[:, :, ::-1]
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_encodings, face_encoding)
            for i, match in enumerate(matches):
                if match and not match_found[i]:
                    matched_ids.append(student_ids[i])
                    match_found[i] = True

        # Display the frame
        cv2.imshow("Face Recognition", frame)

        # Exit if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

    # Return the matched student IDs
    return jsonify({"matched_ids": matched_ids})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
