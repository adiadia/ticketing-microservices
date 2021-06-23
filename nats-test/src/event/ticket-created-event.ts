import { Subjects } from "./subject";

export interface TicketCreatedEvent{
  subject: Subjects.TicketCreated
  data: {
    id: String,
    title: String,
    price: number
  };
}