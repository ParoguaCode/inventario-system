$REGION="us-east-1"
$ACCOUNT_ID="084029330336"
$REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
$PROJECT="inventario-system"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Iniciando despliegue en AWS ECR..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`n[1/4] 🔐 Iniciando sesion en AWS ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY

Write-Host "`n[2/4] 📦 Construyendo y subiendo imagen de Producto..." -ForegroundColor Yellow
docker build -t ${REGISTRY}/${PROJECT}/producto:latest -f apps/producto/Dockerfile .
docker push ${REGISTRY}/${PROJECT}/producto:latest

Write-Host "`n[3/4] 📦 Construyendo y subiendo imagen de Inventario..." -ForegroundColor Yellow
docker build -t ${REGISTRY}/${PROJECT}/inventario:latest -f apps/inventario/Dockerfile .
docker push ${REGISTRY}/${PROJECT}/inventario:latest

Write-Host "`n[4/4] 📦 Construyendo y subiendo imagen de Reposicion..." -ForegroundColor Yellow
docker build -t ${REGISTRY}/${PROJECT}/reposicion:latest -f apps/reposicion/Dockerfile .
docker push ${REGISTRY}/${PROJECT}/reposicion:latest

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host " ✅ ¡Despliegue de imagenes completado!" -ForegroundColor Green
Write-Host " ⏳ ECS detectara los cambios e iniciara las nuevas tareas automaticamente." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
