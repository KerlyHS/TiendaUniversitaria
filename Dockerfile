FROM python:3.12-slim

# Evitar la generación de archivos .pyc y permitir que la salida de Python se envíe directamente al terminal
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Instalar dependencias del sistema necesarias para algunas librerías de Python (como ReportLab)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de requerimientos y luego instalar las dependencias
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copiar el resto del código del backend
COPY . /app/

# Exponer el puerto de desarrollo de Django
EXPOSE 8000

# Comando para ejecutar el servidor en modo desarrollo
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
