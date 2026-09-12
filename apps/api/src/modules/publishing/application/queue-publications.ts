import { publicationDestinations } from "../domain/publication.js";
export const validDestinations = (items: string[]) =>
  items.filter((item) => publicationDestinations.has(item));
