resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repositories)
  name     = each.value
  image_tag_mutability = "MUTABLE"
}

variable "repositories" {
  type = list(string)
}

output "repository_urls" {
  value = { for repo in aws_ecr_repository.repos : repo.name => repo.repository_url }
}