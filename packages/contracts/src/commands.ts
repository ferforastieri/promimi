export interface CreateOfferCommand { title: string; storeId: string; currentPrice: number; affiliateUrl: string; categoryId?: string | null; }
export interface RequestPublicationCommand { offerId: string; destinations: string[]; }
export interface RunRoutineCommand { routineId: string; executionId?: string; }
