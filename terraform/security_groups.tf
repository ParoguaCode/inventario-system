# ─── ALB ─────────────────────────────────────────────────────────────────────

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Permite HTTP entrante desde internet hacia el ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP desde internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-alb-sg" }
}

# ─── Microservicio producto (HTTP :3000) ──────────────────────────────────────

resource "aws_security_group" "producto" {
  name        = "${var.project_name}-producto-sg"
  description = "Permite trafico solo desde el ALB hacia producto:3000"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP desde ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-producto-sg" }
}

# ─── Microservicio inventario (Worker NATS — sin puerto entrante) ─────────────

resource "aws_security_group" "inventario" {
  name        = "${var.project_name}-inventario-sg"
  description = "Worker NATS: no acepta conexiones entrantes"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-inventario-sg" }
}

# ─── Microservicio reposicion (Worker NATS — sin puerto entrante) ─────────────

resource "aws_security_group" "reposicion" {
  name        = "${var.project_name}-reposicion-sg"
  description = "Worker NATS: no acepta conexiones entrantes"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-reposicion-sg" }
}

# ─── NATS Broker ──────────────────────────────────────────────────────────────

resource "aws_security_group" "nats" {
  name        = "${var.project_name}-nats-sg"
  description = "NATS broker: ingreso solo desde los 3 microservicios"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-nats-sg" }
}

# Reglas de ingreso NATS separadas para evitar dependencias circulares
resource "aws_vpc_security_group_ingress_rule" "nats_from_producto" {
  security_group_id            = aws_security_group.nats.id
  referenced_security_group_id = aws_security_group.producto.id
  ip_protocol                  = "tcp"
  from_port                    = 4222
  to_port                      = 4222
  description                  = "NATS desde producto"
}

resource "aws_vpc_security_group_ingress_rule" "nats_from_inventario" {
  security_group_id            = aws_security_group.nats.id
  referenced_security_group_id = aws_security_group.inventario.id
  ip_protocol                  = "tcp"
  from_port                    = 4222
  to_port                      = 4222
  description                  = "NATS desde inventario"
}

resource "aws_vpc_security_group_ingress_rule" "nats_from_reposicion" {
  security_group_id            = aws_security_group.nats.id
  referenced_security_group_id = aws_security_group.reposicion.id
  ip_protocol                  = "tcp"
  from_port                    = 4222
  to_port                      = 4222
  description                  = "NATS desde reposicion"
}

# ─── RDS pg-inventario (compartida: producto + inventario) ────────────────────

resource "aws_security_group" "rds_inventario" {
  name        = "${var.project_name}-rds-inventario-sg"
  description = "PostgreSQL pg-inventario: acceso desde producto e inventario"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-inventario-sg" }
}

resource "aws_vpc_security_group_ingress_rule" "rds_inventario_from_producto" {
  security_group_id            = aws_security_group.rds_inventario.id
  referenced_security_group_id = aws_security_group.producto.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "PostgreSQL desde producto"
}

resource "aws_vpc_security_group_ingress_rule" "rds_inventario_from_inventario" {
  security_group_id            = aws_security_group.rds_inventario.id
  referenced_security_group_id = aws_security_group.inventario.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "PostgreSQL desde inventario"
}

# ─── RDS pg-reposicion (exclusiva: reposicion) ────────────────────────────────

resource "aws_security_group" "rds_reposicion" {
  name        = "${var.project_name}-rds-reposicion-sg"
  description = "PostgreSQL pg-reposicion: acceso solo desde reposicion"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-reposicion-sg" }
}

resource "aws_vpc_security_group_ingress_rule" "rds_reposicion_from_reposicion" {
  security_group_id            = aws_security_group.rds_reposicion.id
  referenced_security_group_id = aws_security_group.reposicion.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "PostgreSQL desde reposicion"
}
