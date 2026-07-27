FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del frontend
COPY . .

# Exponer el puerto por defecto de Vite
EXPOSE 3000

# Comando para iniciar el servidor de desarrollo de Vite, expuesto a la red de Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
