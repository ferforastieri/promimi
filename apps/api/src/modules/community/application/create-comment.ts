import { sanitizeComment } from "../domain/comment-policy.js";
export const createCommentInput = (body: string) => sanitizeComment(body);
