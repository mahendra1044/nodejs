variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "saviynt_aws_access_key" {
  description = "AWS access key for SaviyntWrapper account"
  type        = string
}

variable "saviynt_aws_secret_key" {
  description = "AWS secret key for SaviyntWrapper account"
  type        = string
}