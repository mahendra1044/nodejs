resource "aws_ecs_cluster" "main" {
  name = "saviynt-cluster"
}

resource "aws_ecs_task_definition" "saviynt" {
  family                   = "saviynt-wrapper"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions = jsonencode([
    {
      name  = "saviynt-wrapper"
      image = var.saviynt_image
      essential = true
      portMappings = [
        { containerPort = 3000, hostPort = 3000 }
      ]
      environment = [
        { name = "SAVIYNT_API_URL", value = "https://saviynt.api.com" },
        { name = "AWS_REGION", value = "us-east-1" },
        { name = "LOG_LEVEL", value = "info" }
      ]
      secrets = [
        { name = "SAVIYNT_API_KEY", valueFrom = "arn:aws:secretsmanager:us-east-1:*:secret:saviynt-api-key" },
        { name = "APIGEE_API_KEY", valueFrom = "arn:aws:secretsmanager:us-east-1:*:secret:apigee-api-key" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/saviynt-wrapper"
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "saviynt" {
  name            = "saviynt-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.saviynt.arn
  desired_count   = 2
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.subnets
    security_groups = [var.security_group_id]
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.saviynt.arn
    container_name   = "saviynt-wrapper"
    container_port   = 3000
  }
}

resource "aws_lb" "main" {
  name               = "saviynt-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.subnets
}

resource "aws_lb_target_group" "saviynt" {
  name        = "saviynt-tg"
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
    target_group_arn = aws_lb_target_group.saviynt.arn
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "saviynt-ecs-task-execution-role"
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
  name   = "saviynt-ecs-task-execution-policy"
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
          "secretsmanager:GetSecretValue"
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

variable "saviynt_image" {
  type = string
}

output "saviynt_alb_dns" {
  value = aws_lb.main.dns_name
}