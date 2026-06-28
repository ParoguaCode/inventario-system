output "alb_dns_name" {
  description = "URL pública del ALB para el microservicio producto."
  value       = aws_lb.main.dns_name
}

output "ecr_producto_repository_url" {
  description = "URL del repo ECR para producto."
  value       = aws_ecr_repository.producto.repository_url
}

output "ecr_inventario_repository_url" {
  description = "URL del repo ECR para inventario."
  value       = aws_ecr_repository.inventario.repository_url
}

output "ecr_reposicion_repository_url" {
  description = "URL del repo ECR para reposicion."
  value       = aws_ecr_repository.reposicion.repository_url
}

output "ecr_login_command" {
  description = "Comando para autenticar Docker contra ECR."
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${local.ecr_registry}"
}

output "cluster_name" {
  description = "Nombre del cluster ECS."
  value       = aws_ecs_cluster.main.name
}

output "service_discovery_namespace" {
  description = "Namespace DNS interno."
  value       = aws_service_discovery_private_dns_namespace.main.name
}

output "rds_pg_inventario_endpoint" {
  description = "Endpoint de la BD pg-inventario."
  value       = aws_db_instance.pg_inventario.endpoint
}

output "rds_pg_reposicion_endpoint" {
  description = "Endpoint de la BD pg-reposicion."
  value       = aws_db_instance.pg_reposicion.endpoint
}
