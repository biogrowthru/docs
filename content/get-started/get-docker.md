version: '3.8'
services:
  n8n:
    container_name: n8n-local
    image: docker.n8n.io/n8nio/n8n
    ports:
"5678:5678" # локальный порт можно поменять при необходимости
    environment:
N8N_HOST=localhost
WEBHOOK_URL=http://localhost:5678/
N8N_PATH=/
N8N_PORT=5678
N8N_ENDPOINT_WEBHOOK_TEST=webhook-test
N8N_SECURE_COOKIE=false
    volumes:
./data:/home/node/.n8n
    restart: unless-stopped
    networks:
n8n
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "1"

networks:
  n8n:
    driver: bridge
```
