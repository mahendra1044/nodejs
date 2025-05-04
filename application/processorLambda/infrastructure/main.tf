provider "aws" {
  region = var.region
  access_key = var.processor_aws_access_key
  secret_key = var.processor_aws_secret_key
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  vpc_cidr = "10.2.0.0/16"
}

# SQS Module
module "sqs" {
  source = "./modules/sqs"
  queue_name = "safe-creation-queue"
  dlq_name = "safe-creation-dlq"
  cyberark_account_id = var.cyberark_account_id
}

# DynamoDB Module
module "dynamodb" {
  source = "./modules/dynamodb"
  table_name = "RetryStore"
}

# SES Module
module "ses" {
  source = "./modules/ses"
  domain = "example.com"
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"
  dlq_arn = module.sqs.dlq_arn
}

# IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_execution" {
  name = "processor-lambda-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_execution" {
  name   = "processor-lambda-execution-policy"
  role   = aws_iam_role.lambda_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:SendMessage"
        ]
        Resource = module.sqs.queue_arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = module.dynamodb.table_arn
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "processor" {
  function_name = "processor-lambda"
  handler       = "dist/index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_execution.arn
  filename      = "lambda.zip" # Placeholder; assume built artifact
  source_code_hash = filebase64sha256("lambda.zip")
  timeout       = 900
  memory_size   = 128
  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [module.vpc.security_group_id]
  }
  environment {
    variables = {
      SQS_QUEUE_URL        = module.sqs.queue_url
      SQS_DLQ_URL          = module.sqs.dlq_url
      DYNAMODB_TABLE       = "RetryStore"
      SES_SOURCE           = "no-reply@example.com"
      SES_RECIPIENT        = "admin@example.com"
      AWS_REGION           = var.region
      SAVIYNT_API_URL      = "https://api.apigee.com/saviynt"
      CYBERARK_API_URL     = "https://api.apigee.com/cyberark"
      SERVICENOW_API_URL   = "https://servicenow.api.com"
      LOG_LEVEL            = "info"
    }
  }
}

# Lambda Event Source Mapping
resource "aws_lambda_event_source_mapping" "sqs" {
  event_source_arn = module.sqs.queue_arn
  function_name    = aws_lambda_function.processor.arn
  batch_size       = 10
}

# CloudWatch Event Rule for Retries
resource "aws_cloudwatch_event_rule" "retry" {
  name                = "retry-processor-lambda"
  schedule_expression = "rate(15 minutes)"
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.retry.name
  target_id = "processor-lambda"
  arn       = aws_lambda_function.processor.arn
}

resource "aws_lambda_permission" "cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.retry.arn
}