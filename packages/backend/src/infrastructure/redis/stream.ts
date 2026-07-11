export interface StreamManager {
  add(stream: string, entry: Record<string, string>): Promise<string>;
  read(stream: string, lastId: string, count: number): Promise<StreamEntry[]>;
  ack(stream: string, group: string, id: string): Promise<void>;
  createGroup(stream: string, group: string): Promise<void>;
  pendingEntries(stream: string, group: string): Promise<StreamEntry[]>;
}
export interface StreamEntry {
  id: string;
  data: Record<string, string>;
}
