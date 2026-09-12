import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

export function installErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError)
      return reply
        .code(400)
        .send({
          error: "VALIDATION_ERROR",
          message: "Revise os campos informados.",
          details: error.flatten(),
        });
    const appError = error as { statusCode?: number; message?: string };
    const statusCode =
      appError.statusCode && appError.statusCode >= 400
        ? appError.statusCode
        : 500;
    if (statusCode >= 500) app.log.error(error);
    return reply
      .code(statusCode)
      .send({
        error: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
        message:
          statusCode >= 500
            ? "Não foi possível concluir esta ação."
            : (appError.message ?? "A solicitação não pôde ser concluída."),
      });
  });
}
