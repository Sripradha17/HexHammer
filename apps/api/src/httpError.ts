// A tiny error class that carries an HTTP status code.
// Throw it (or pass it to next) and the error-handling middleware turns it into a JSON reply.
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
