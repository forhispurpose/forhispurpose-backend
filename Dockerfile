FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

# Hugging Face Spaces (Docker SDK) routes traffic to this port by default.
EXPOSE 7860
ENV PORT=7860

CMD ["node", "server.js"]
