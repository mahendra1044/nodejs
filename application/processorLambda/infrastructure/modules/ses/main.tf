resource "aws_ses_domain_identity" "main" {
  domain = var.domain
}

variable "domain" {
  type = string
}