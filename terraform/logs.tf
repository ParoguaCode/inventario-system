resource "aws_cloudwatch_log_group" "nats" {
  name              = "/ecs/${var.project_name}/nats"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "producto" {
  name              = "/ecs/${var.project_name}/producto"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "inventario" {
  name              = "/ecs/${var.project_name}/inventario"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "reposicion" {
  name              = "/ecs/${var.project_name}/reposicion"
  retention_in_days = 7
}
