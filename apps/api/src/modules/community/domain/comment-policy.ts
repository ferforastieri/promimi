export const sanitizeComment = (body: string) => body.replace(/<[^>]*>/g, "").trim();
