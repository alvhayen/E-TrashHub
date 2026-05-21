import { Request, Response, NextFunction } from 'express';

// Define expected interface for Prisma errors
interface PrismaError extends Error {
  code?: string;
  meta?: any;
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  // Handle Prisma Specific Errors if they exist in the stack
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as PrismaError;
    
    // P2002: Unique constraint failed
    if (prismaError.code === 'P2002') {
      statusCode = 409;
      message = 'Data conflict: Record already exists.';
      code = 'CONFLICT';
    } 
    // P2025: Record not found
    else if (prismaError.code === 'P2025') {
      statusCode = 404;
      message = 'Requested record not found.';
      code = 'NOT_FOUND';
    }
    // General Prisma errors
    else {
      statusCode = 400;
      message = 'Database operation failed.';
      code = `DB_ERROR_${prismaError.code}`;
    }
  }

  // Handle standard express-jwt unauthorized errors
  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid or expired token.';
    code = 'UNAUTHORIZED';
  }

  console.error(`[Error] ${req.method} ${req.url} - ${statusCode} ${code} - ${err.message}`);

  const errorResponse: any = {
    success: false,
    message,
    code,
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.details = err.stack;
    if (err.meta) {
      errorResponse.meta = err.meta;
    }
  }

  res.status(statusCode).json(errorResponse);
}
