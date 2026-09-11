export interface PublicationRequestedEvent { publicationId: string; }
export type OutboxEvent = { topic: "publication.requested"; payload: PublicationRequestedEvent; aggregateId: string };
