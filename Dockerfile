FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/DoubtSolver/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory to include all necessary files
# This ensures vector.py and any other modules are included
COPY backend/ /app/backend/

# Copy Firebase credentials file (adjust path if needed)
COPY studybuddy-681c2-firebase-adminsdk-fbsvc-d5c7bd9100.json /app/

# Set environment variables
ENV PORT=8000

# Command to run the application
CMD ["python", "backend/DoubtSolver/main.py"]