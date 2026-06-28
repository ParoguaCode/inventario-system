resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

data "aws_caller_identity" "current" {}

locals {
  account_id         = data.aws_caller_identity.current.account_id
  ecr_registry       = "${local.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
  producto_image     = "${aws_ecr_repository.producto.repository_url}:${var.image_tag}"
  inventario_image   = "${aws_ecr_repository.inventario.repository_url}:${var.image_tag}"
  reposicion_image   = "${aws_ecr_repository.reposicion.repository_url}:${var.image_tag}"

  nats_dns_url = "nats://nats.${aws_service_discovery_private_dns_namespace.main.name}:4222"
}

# ─── Task Definitions ────────────────────────────────────────────────────────

resource "aws_ecs_task_definition" "nats" {
  family                   = "${var.project_name}-nats"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "nats"
    image     = "nats:2.10-alpine"
    essential = true
    command   = ["-js", "-m", "8222"]
    portMappings = [
      { containerPort = 4222, protocol = "tcp" },
      { containerPort = 8222, protocol = "tcp" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.nats.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "nats"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "producto" {
  family                   = "${var.project_name}-producto"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "producto"
    image     = local.producto_image
    essential = true
    portMappings = [
      { containerPort = 3000, protocol = "tcp" }
    ]
    environment = [
      { name = "PORT", value = "3000" },
      { name = "NATS_URL", value = local.nats_dns_url },
      { name = "DB_INVENTARIO_HOST", value = aws_db_instance.pg_inventario.address },
      { name = "DB_INVENTARIO_PORT", value = tostring(aws_db_instance.pg_inventario.port) },
      { name = "DB_INVENTARIO_NAME", value = aws_db_instance.pg_inventario.db_name },
      { name = "DB_INVENTARIO_USER", value = var.db_inventario_username },
      { name = "DB_INVENTARIO_PASSWORD", value = var.db_inventario_password }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.producto.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "producto"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "inventario" {
  family                   = "${var.project_name}-inventario"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "inventario"
    image     = local.inventario_image
    essential = true
    environment = [
      { name = "NATS_URL", value = local.nats_dns_url },
      { name = "DB_INVENTARIO_HOST", value = aws_db_instance.pg_inventario.address },
      { name = "DB_INVENTARIO_PORT", value = tostring(aws_db_instance.pg_inventario.port) },
      { name = "DB_INVENTARIO_NAME", value = aws_db_instance.pg_inventario.db_name },
      { name = "DB_INVENTARIO_USER", value = var.db_inventario_username },
      { name = "DB_INVENTARIO_PASSWORD", value = var.db_inventario_password }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.inventario.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "inventario"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "reposicion" {
  family                   = "${var.project_name}-reposicion"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "reposicion"
    image     = local.reposicion_image
    essential = true
    environment = [
      { name = "NATS_URL", value = local.nats_dns_url },
      { name = "DB_REPOSICION_HOST", value = aws_db_instance.pg_reposicion.address },
      { name = "DB_REPOSICION_PORT", value = tostring(aws_db_instance.pg_reposicion.port) },
      { name = "DB_REPOSICION_NAME", value = aws_db_instance.pg_reposicion.db_name },
      { name = "DB_REPOSICION_USER", value = var.db_reposicion_username },
      { name = "DB_REPOSICION_PASSWORD", value = var.db_reposicion_password }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.reposicion.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "reposicion"
      }
    }
  }])
}

# ─── ECS Services ────────────────────────────────────────────────────────────

resource "aws_ecs_service" "nats" {
  name            = "nats"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.nats.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.nats.id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.nats.arn
  }
}

resource "aws_ecs_service" "producto" {
  name            = "producto"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.producto.arn
  desired_count   = var.producto_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.producto.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.producto.arn
    container_name   = "producto"
    container_port   = 3000
  }

  service_registries {
    registry_arn = aws_service_discovery_service.producto.arn
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "inventario" {
  name            = "inventario"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.inventario.arn
  desired_count   = var.inventario_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.inventario.id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.inventario.arn
  }
}

resource "aws_ecs_service" "reposicion" {
  name            = "reposicion"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.reposicion.arn
  desired_count   = var.reposicion_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.reposicion.id]
    assign_public_ip = true
  }

  service_registries {
    registry_arn = aws_service_discovery_service.reposicion.arn
  }
}
