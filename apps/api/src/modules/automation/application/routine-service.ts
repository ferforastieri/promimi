import { isFiveFieldCron, supportedDestinations } from "../domain/routine-policy.js";
export const normalizeRoutine = <T extends { scheduleCron: string; destinations: string[] }>(routine: T): T => ({ ...routine, scheduleCron: routine.scheduleCron.trim(), destinations: routine.destinations.filter((item) => supportedDestinations.has(item)) });
export { isFiveFieldCron };
