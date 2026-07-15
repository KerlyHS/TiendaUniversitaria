# Tienda Universitaria

![Logo de Tienda Universitaria](img/LogoTienda.png)

## Descripción

**Tienda Universitaria** es una plataforma web desarrollada para la **Universidad Nacional de Loja (UNL)**, cuyo propósito es comercializar productos elaborados en las quintas experimentales y por los emprendimientos estudiantiles, fortaleciendo el vínculo entre la universidad y la comunidad.

El sistema permite gestionar usuarios, productos, pedidos, inventario, caja y procesos de compra mediante una plataforma web moderna, contribuyendo al desarrollo académico, social y empresarial de la institución.

---

# Guía de Instalación y Ejecución

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu equipo:

- Git
- Python 3.8 o superior
- Node.js
- npm

Puedes verificar las versiones instaladas ejecutando:

```bash
python --version
node --version
npm --version
git --version
```

---

## Clonar el repositorio

Clona el proyecto desde GitHub:

```bash
git clone https://github.com/KerlyHS/TiendaUniversitaria.git
```

Ingresa a la carpeta del proyecto:

```bash
cd TiendaUniversitaria
```

---

# Instalación del Backend (Django)

## 1. Crear el entorno virtual

```bash
python -m venv venv
```

---

## 2. Activar el entorno virtual

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Cuando el entorno esté activo observarás algo similar a:

```text
(venv)
```

al inicio de la terminal.

---

## 3. Instalar las dependencias

```bash
pip install -r requirements.txt
```

---

## 4. Aplicar las migraciones

```bash
python manage.py migrate
```

---

## 5. (Opcional) Crear un superusuario

Si deseas acceder al panel administrativo:

```bash
python manage.py createsuperuser
```

Completa la información solicitada.

---

## 6. Iniciar el servidor Django

```bash
python manage.py runserver
```

El backend estará disponible en:

```
http://localhost:8000
```

Panel administrativo:

```
http://localhost:8000/admin
```

---

# Instalación del Frontend

Abre una nueva terminal.

Ingresa a la carpeta del frontend:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará disponible en la dirección que indique Vite (generalmente):

```
http://localhost:5173
```

---

# Orden recomendado para ejecutar el sistema

## Terminal 1

Backend

```bash
venv\Scripts\activate
python manage.py runserver
```

---

## Terminal 2

Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Acceso al sistema

| Servicio | URL |
|----------|-----|
| Frontend Web | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Panel Administrativo | http://localhost:8000/admin |

---

# Actualizar el proyecto

Si ya tienes el proyecto descargado y deseas obtener la última versión:

```bash
git pull origin main
```

---

# Base de Datos

Durante el desarrollo el proyecto utiliza **SQLite**.

La base de datos se encuentra en la raíz del proyecto con el nombre:

```
db.sqlite3
```

Si el archivo no existe, puede generarse ejecutando:

```bash
python manage.py migrate
```

> **Importante:** Si el equipo de desarrollo trabaja con una base de datos compartida que contiene usuarios, productos o información de prueba, esta deberá ser proporcionada por el administrador del proyecto.

---

# Estructura General del Proyecto

```
TiendaUniversitaria
│
├── core/
├── tienda/
├── frontend/
├── docs/
├── img/
├── requirements.txt
├── manage.py
├── db.sqlite3
└── README.md
```

---

# Problemas Frecuentes

## Python no encontrado

Verifica que Python esté instalado y agregado al PATH del sistema.

Comprueba con:

```bash
python --version
```

---

## El entorno virtual no está activado

Actívalo nuevamente.

Windows:

```bash
venv\Scripts\activate
```

Linux:

```bash
source venv/bin/activate
```

---

## Error al instalar dependencias del Backend

Actualiza pip:

```bash
python -m pip install --upgrade pip
```

Luego vuelve a ejecutar:

```bash
pip install -r requirements.txt
```

---

## Error con npm

Si ocurre algún problema con las dependencias del frontend:

Elimina la carpeta:

```
node_modules
```

y el archivo:

```
package-lock.json
```

Luego instala nuevamente:

```bash
npm install
```

---

## Migraciones pendientes

Ejecuta:

```bash
python manage.py migrate
```

---

## No aparece la base de datos

Si el archivo **db.sqlite3** no existe:

```bash
python manage.py migrate
```

---

## Los productos o usuarios no aparecen

Verifica que la base de datos utilizada sea la correcta.

Si estás trabajando con una base de datos compartida, solicita la copia actualizada al administrador del proyecto.

---

## El frontend no puede conectarse al backend

Comprueba que:

- El backend esté ejecutándose.
- El frontend esté ejecutándose.
- Ambos utilicen los puertos configurados.
- No exista un firewall bloqueando la conexión.

---

# Recomendaciones

- Mantén siempre dos terminales abiertas: una para el Backend y otra para el Frontend.
- Activa el entorno virtual antes de ejecutar cualquier comando de Django.
- No elimines la base de datos sin realizar una copia de seguridad.
- Mantén el proyecto actualizado utilizando:

```bash
git pull origin main
```

- Revisa el archivo `.env.template` si el proyecto requiere configurar variables de entorno.

---

# API Service

## Overview

This service provides the backend API for the Tienda Universitaria, ensuring LOPDP compliance for user registration and data management.

---

## API Endpoints

### User Registration

**URL**

```
POST /api/v1/usuarios/registro/
```

**Request Body**

```json
{
  "nombre_completo": "John Doe",
  "email": "john.doe@unl.edu.ec",
  "password": "secure_password123",
  "consentimiento_lopdp": true
}
```

---

### Privacy Policy

**URL**

```
GET /api/v1/politica-privacidad/
```

Obtiene la última versión activa de la política de privacidad.

---

## Technical Stack

- Django 6.0.4
- Django REST Framework (DRF)
- SQLite (Development)
- PostgreSQL (Production)

---

## Compliance

- LOPDP Art. 39 – Privacy by Design
- Data Minimization
- Consent Audit

---

# Misión

Somos el espacio de vinculación de la Universidad Nacional de Loja que comercializa y promociona los productos generados en las quintas experimentales y los emprendimientos estudiantiles, fortaleciendo la formación académica de pregrado y contribuyendo al bienestar de la comunidad a través de una oferta de calidad, sostenible y de beneficio social.

---

# Visión

Consolidarnos como el portal oficial de productos y servicios de la Universidad Nacional de Loja, donde la tecnología y el talento universitario se unen para servir a la comunidad. Visualizamos una plataforma moderna, transparente y confiable que impulse los emprendimientos universitarios y fortalezca el desarrollo social y económico de la región.

---

# Características del Proyecto

- Plataforma web para la comercialización de productos universitarios.
- Gestión de usuarios con cumplimiento de la LOPDP.
- Catálogo de productos.
- Gestión de inventario.
- Gestión de pedidos.
- Administración de caja.
- Panel administrativo.
- API REST desarrollada con Django REST Framework.
- Base de datos SQLite para desarrollo y PostgreSQL para producción. 
