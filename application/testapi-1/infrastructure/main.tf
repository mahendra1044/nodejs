provider "aws" {
  region = var.region
  access_key = var.saviynt_aws_access_key
  secret_key = var.saviynt_aws_secret_key
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  vpc_cidr = "10.0.0.0/16"
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"
  repositories = ["saviynt-wrapper"]
}

# SES Module
module "ses" {
  source = "./modules/ses"
  domain = "example.com"
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"
  vpc_id = module.vpc.vpc_id
  subnets = module.vpc.private_subnets
  security_group_id = module.vpc.security_group_id
  saviynt_image = "${module.ecr.repository_urls["saviynt-wrapper"]}:latest"
}