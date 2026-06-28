#!/bin/bash
set -e

REGION="us-east-1"
ACCOUNT_ID="084029330336"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
PROJECT="inventario-system"

echo "========================================="
echo " Iniciando despliegue en AWS ECR..."
echo "========================================="

echo -e "\n[1/4] 🔐 Iniciando sesion en AWS ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY

echo -e "\n[2/4] 📦 Construyendo y subiendo imagen de Producto..."
docker build -t ${REGISTRY}/${PROJECT}/producto:latest -f apps/producto/Dockerfile .
docker push ${REGISTRY}/${PROJECT}/producto:latest

echo -e "\n[3/4] 📦 Construyendo y subiendo imagen de Inventario..."
docker build -t ${REGISTRY}/${PROJECT}/inventario:latest -f apps/inventario/Dockerfile .
docker push ${REGISTRY}/${PROJECT}/inventario:latest

echo -e "\n[4/4] 📦 Construyendo y subiendo imagen de Reposicion..."
docker build -t ${REGISTRY}/${PROJECT}/reposicion:latest -f apps/reposicion/Dockerfile .
docker push ${REGISTRY}/${PROJECT}/reposicion:latest

echo -e "\n========================================="
echo " ✅ ¡Despliegue de imagenes completado!"
echo " ⏳ ECS detectara los cambios e iniciara las nuevas tareas automaticamente."
echo "========================================="
