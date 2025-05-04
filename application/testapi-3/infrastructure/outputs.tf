output "lambda_function_arn" {
  value = aws_lambda_function.processor.arn
}

output "sqs_queue_url" {
  value = module.sqs.queue_url
}

output "sqs_queue_arn" {
  value = module.sqs.queue_arn
}