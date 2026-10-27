// A tiny error class that carries an HTTP status code.
// Throw it (or pass it to next) and the error-handling middleware turns it into a JSON reply.
// `fields` is optional: a form can use it to show one message next to each bad field.
export class HttpError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
