export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, message)
  }
}
