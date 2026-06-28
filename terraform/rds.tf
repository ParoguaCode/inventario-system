resource "aws_db_subnet_group" "private" {
  name       = "${var.project_name}-rds-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = { Name = "${var.project_name}-rds-subnet-group" }
}

# ─── pg-inventario (utilizada por microservicios producto e inventario) ──────

resource "aws_db_instance" "pg_inventario" {
  identifier           = "${var.project_name}-pg-inventario"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = var.db_instance_class # db.t3.micro (Free Tier)
  allocated_storage    = var.db_allocated_storage
  storage_type         = "gp2"
  
  db_name              = var.db_inventario_name
  username             = var.db_inventario_username
  password             = var.db_inventario_password

  db_subnet_group_name   = aws_db_subnet_group.private.name
  vpc_security_group_ids = [aws_security_group.rds_inventario.id]
  
  publicly_accessible    = false
  skip_final_snapshot    = true # Para facilitar la destrucción en entornos de prueba
  
  tags = { Name = "${var.project_name}-pg-inventario" }
}

# ─── pg-reposicion (utilizada exclusivamente por microservicio reposicion) ───

resource "aws_db_instance" "pg_reposicion" {
  identifier           = "${var.project_name}-pg-reposicion"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = var.db_instance_class # db.t3.micro (Free Tier)
  allocated_storage    = var.db_allocated_storage
  storage_type         = "gp2"
  
  db_name              = var.db_reposicion_name
  username             = var.db_reposicion_username
  password             = var.db_reposicion_password

  db_subnet_group_name   = aws_db_subnet_group.private.name
  vpc_security_group_ids = [aws_security_group.rds_reposicion.id]
  
  publicly_accessible    = false
  skip_final_snapshot    = true
  
  tags = { Name = "${var.project_name}-pg-reposicion" }
}
