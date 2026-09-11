import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { requireStaff } from "../../../shared/auth/guards.js";
import { normalizeRoutine } from "../application/routine-service.js";
import { routineRepository } from "../infrastructure/drizzle-routine-repository.js";

/** Automation boundary: routines and global pause control. The worker owns execution. */
export const automationController: FastifyPluginAsync = async (app) => {
  app.get("/admin/routines", { preHandler: requireStaff }, async () => ({ data: await routineRepository.list() }));
  app.post("/admin/routines", { preHandler: requireStaff }, async (request, reply) => { const body = z.object({ name: z.string().min(3).max(120), enabled: z.boolean().default(false), scheduleCron: z.string().trim().regex(/^(\S+\s+){4}\S+$/, "Use cinco campos cron.").default("0 * * * *"), filters: z.record(z.unknown()).default({}), destinations: z.array(z.string()).default([]), dailyLimit: z.number().int().min(1).max(100).default(100) }).parse(request.body); const [routine] = await routineRepository.create(normalizeRoutine(body)); return reply.code(201).send({ data: routine }); });
  app.patch("/admin/routines/:id", { preHandler: requireStaff }, async (request) => { const { id } = request.params as { id: string }; const body = z.object({ name: z.string().min(3).max(120).optional(), enabled: z.boolean().optional(), scheduleCron: z.string().trim().regex(/^(\S+\s+){4}\S+$/, "Use cinco campos cron.").optional(), filters: z.record(z.unknown()).optional(), destinations: z.array(z.string()).optional(), dailyLimit: z.number().int().min(1).max(100).optional() }).parse(request.body); const [routine] = await routineRepository.update(id, body); return { data: routine }; });
  app.post("/admin/routines/:id/run", { preHandler: requireStaff }, async (request, reply) => { const { id } = request.params as { id: string }; if (!await routineRepository.find(id)) return reply.code(404).send({ error: "NOT_FOUND", message: "Rotina não encontrada." }); const [execution] = await routineRepository.queueExecution(id); return reply.code(202).send({ data: execution, message: "Execução adicionada à fila do worker." }); });
  app.get("/admin/automation", { preHandler: requireStaff }, async () => { const control = await routineRepository.automationControl(); return { data: { paused: control ? !control.enabled : false } }; });
  app.put("/admin/automation", { preHandler: requireStaff }, async (request) => { const { paused } = z.object({ paused: z.boolean() }).parse(request.body); await routineRepository.setPaused(paused); return { data: { paused } }; });
};
