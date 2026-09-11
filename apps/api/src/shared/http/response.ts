export const ok = <T>(data: T) => ({ data });
export const created = <T>(data: T) => ({ data });
export const failure = (error: string, message: string) => ({ error, message });
