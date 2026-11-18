export interface FloatingEvents {
  emit<T extends string>(event: T, data?: any): void;
  on(event: string, handler: (data?: any) => void): void;
  off(event: string, handler: (data?: any) => void): void;
}
