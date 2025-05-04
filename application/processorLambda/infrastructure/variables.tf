variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "processor_aws_access_key" {
  description = "AWS access key for ProcessorLambda account"
  type        = string
}

variable "processor_aws_secret_key" {
  description = "AWS secret key for ProcessorLambda account"
  type        = string
}

variable "cyberark_account_id" {
  description = "AWS account ID for CyberArkWrapper to allow cross-account SQS access"
  type        = string
}