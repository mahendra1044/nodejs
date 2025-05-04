resource "aws_ecs_cluster" "main" {
  name = "cyberark-cluster"
}

resource "aws_ecs_task_definition" "cyberark" {
  family                   = "cyberark-wrapper"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions = jsonencode([
    {
      name  = "cyberark-wrapper"
      image = var.cyberark_image
      essential = true
      portMappings = [
        { containerPort = 3000, hostPort = 3000 }
      ]
      environment = [
        { name = "CYBERARK_API_URL", value = "https://cyberark.api.com" },
        { name = "SQS_QUEUE_URL", value = var.sqs_queue_url },
        { name = "AWS_REGION", value = "us-east-1" },
        { name = "LOG_LEVEL", value = "info" }
      ]
      secrets = [
        { name = "CYBERARK_API_KEY", valueFrom = "arn:aws:secretsmanager:us-east-1:*:secret:cyberark-api-key" },
        { name = "APIGEE_API_KEY", valueFrom = "arn:aws:secretsmanager:us-east-1:*:secret:apigee-api-key" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/cyberark-wrapper"
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "cyberark" {
  name            = "cyberark-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cyberark.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.subnets
    security_groups = [var.security_group_id]
 UPDATES
  load_balancer {
    target_group_arn = aws_lb_target_group.cyberark.arn
    container_name   = "cyberark-wrapper"
    container_port   = 3000
  }
}

resource "aws_lb" "main" {
  name               = "cyberark-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.subnets
}

resource "aws_lb_target_group" "cyberark" {
  name        = "cyberark-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cyberark.arn
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "cyberark-ecs-task-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "ecs_task_execution" {
  name   = "cyberark-ecs-task-execution-policy"
  role   = aws_iam_role.ecs_task_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "secretsmanager:GetSecretValue",
          "sqs:SendMessage"
        ]
        Resource = "*"
      }
    ]
  })
}

variable "vpc_id" {
  type = string
}

variable "subnets" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

variable "cyberark_image" {
  type = string
}

variable "sqs_queue_url" {
  type = string
}

output "cyberark_alb_dns" {
  value = aws_lb.main.dns_name
}