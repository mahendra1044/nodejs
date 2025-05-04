resource "aws_cloudwatch_metric_alarm" "dlq" {
  alarm_name          = "DLQMessagesAlarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = 0
  alarm_actions       = [aws_sns_topic.dlq.arn]
  dimensions = {
    QueueName = split(":", var.dlq_arn)[5]
  }
}

resource "aws_sns_topic" "dlq" {
  name = "dlq-notifications"
}

variable "dlq_arn" {
  type = string
}

output "sns_topic_arn" {
  value = aws_sns_topic.dlq.arn
}