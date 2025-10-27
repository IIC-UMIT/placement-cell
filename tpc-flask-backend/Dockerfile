# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code into the container
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Define environment variables (optional, can also be set in Cloud Run)
ENV PORT=8080

# Command to run your application
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
