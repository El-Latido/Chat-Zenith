FROM node:22-alpine

WORKDIR /app

# Instalar bash y herramientas básicas necesarias
RUN apk add --no-cache bash

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (incluyendo las de desarrollo para compilar)
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la aplicación React y el servidor Express
RUN npm run build

# Exponer el puerto que espera Hugging Face
EXPOSE 7860

# Configurar variables de entorno predeterminadas
ENV PORT=7860
ENV NODE_ENV=production

# Iniciar el servidor compilado
CMD ["node", "dist/server.cjs"]
