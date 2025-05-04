variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "cyberark_aws_access_key" {
  description = "AWS access key for CyberArkWrapper account"
  type        = string
}

variable "cyberark_aws_secret_key" {
  description = "AWS secret key for CyberArkWrapper account"
  type        = string
}

variable "sqs_queue_url" {
  description = "URL of the SQS queue in ProcessorLambda account"
  type        = string
}