resource "aws_dynamodb_table" "main" {
  name           = var.table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "correlationId"
  attribute {
    name = "correlationId"
    type = "S"
  }
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

variable "table_name" {
  type = string
}

output "table_arn" {
  value = aws_dynamodb_table.main.arn
}