variable "aws_region" {
  description = "Región de AWS donde se desplegará todo."
  type        = string
  default     = "us-east-1"
}

# Definir en terraform.tfvars (no commitear) o usar `aws configure` / env vars.
variable "access_key" {
  description = "AWS access key."
  type        = string
  sensitive   = true
  default     = null
}

variable "secret_key" {
  description = "AWS secret key."
  type        = string
  sensitive   = true
  default     = null
}

variable "project_name" {
  description = "Prefijo para nombrar todos los recursos."
  type        = string
  default     = "inventario-system"
}

variable "vpc_cidr" {
  description = "Bloque CIDR de la VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs de las subnets públicas — para ECS tasks (una por AZ)."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs de las subnets privadas — para RDS PostgreSQL (una por AZ)."
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "azs" {
  description = "Availability Zones a usar."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# ─── ECS Fargate ─────────────────────────────────────────────────────────────

variable "task_cpu" {
  description = "CPU por tarea Fargate (256 = 0.25 vCPU — mínimo y más barato)."
  type        = string
  default     = "256"
}

variable "task_memory" {
  description = "Memoria por tarea Fargate en MB (512 — mínimo y más barato)."
  type        = string
  default     = "512"
}

variable "producto_desired_count" {
  description = "Número de tareas Fargate para el microservicio producto."
  type        = number
  default     = 1
}

variable "inventario_desired_count" {
  description = "Número de tareas Fargate para el microservicio inventario."
  type        = number
  default     = 1
}

variable "reposicion_desired_count" {
  description = "Número de tareas Fargate para el microservicio reposicion."
  type        = number
  default     = 1
}

variable "image_tag" {
  description = "Tag de las imágenes en ECR."
  type        = string
  default     = "latest"
}

# ─── RDS PostgreSQL ───────────────────────────────────────────────────────────

variable "db_instance_class" {
  description = "Tipo de instancia RDS (db.t3.micro es free tier eligible)."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Almacenamiento inicial en GB para cada instancia RDS."
  type        = number
  default     = 20
}

variable "db_inventario_name" {
  description = "Nombre de la base de datos pg-inventario."
  type        = string
  default     = "db_inventario"
}

variable "db_inventario_username" {
  description = "Usuario de la BD pg-inventario."
  type        = string
  default     = "dbadmin"
}

variable "db_inventario_password" {
  description = "Contraseña de la BD pg-inventario."
  type        = string
  sensitive   = true
}

variable "db_reposicion_name" {
  description = "Nombre de la base de datos pg-reposicion."
  type        = string
  default     = "db_reposicion"
}

variable "db_reposicion_username" {
  description = "Usuario de la BD pg-reposicion."
  type        = string
  default     = "dbadmin"
}

variable "db_reposicion_password" {
  description = "Contraseña de la BD pg-reposicion."
  type        = string
  sensitive   = true
}
