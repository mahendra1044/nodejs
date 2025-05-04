resource "aws_sqs_queue" "main" {
  name                        = var.queue_name
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 900
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 6
  })
}

resource "aws_sqs_queue" "dlq" {
  name       = var.dlq_name
  fifo_queue = true
}

resource "aws_sqs_queue_policy" "main" {
  queue_url = aws_sqs_queue.main.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.cyberark_account_id}:root"
        }
        Action = "sqs:SendMessage"
        Resource = aws_sqs_queue.main.arn
      }
    ]
  })
}

variable "queue_name" {
  type = string
}

variable "dlq_name" {
  type = string
}

variable "cyberark_account_id" {
  type = string
}

output "queue_url" {
  value = aws_sqs_queue.main.id
}

output "queue_arn" {
  value = aws_sqs_queue.main.arn
}

output "dlq_url" {
  value = aws_sqs_queue.dlq.id
}

output "dlq_arn" {
  value = aws_sqs_queue.dlq.arn
}