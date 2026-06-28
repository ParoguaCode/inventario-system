resource "aws_ecr_repository" "producto" {
  name                 = "${var.project_name}/producto"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "inventario" {
  name                 = "${var.project_name}/inventario"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "reposicion" {
  name                 = "${var.project_name}/reposicion"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

locals {
  ecr_lifecycle_policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Mantener las últimas 5 imágenes (proyecto estudiantil)"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "producto" {
  repository = aws_ecr_repository.producto.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "inventario" {
  repository = aws_ecr_repository.inventario.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "reposicion" {
  repository = aws_ecr_repository.reposicion.name
  policy     = local.ecr_lifecycle_policy
}
