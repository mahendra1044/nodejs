resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  tags = { Name = "processor-vpc" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone = element(data.aws_availability_zones.available.names, count.index)
  tags              = { Name = "processor-private-subnet-${count.index}" }
}

resource "aws_security_group" "lambda" {
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "processor-lambda-sg" }
}

data "aws_availability_zones" "available" {}

variable "vpc_cidr" {
  type = string
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnets" {
  value = aws_subnet.private[*].id
}

output "security_group_id" {
  value = aws_security_group.lambda.id
}