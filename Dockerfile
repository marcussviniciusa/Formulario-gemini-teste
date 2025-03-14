FROM node:18-alpine

WORKDIR /app

# Instalando dependências
COPY package*.json ./
RUN npm install

# Copiando arquivos da aplicação
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
