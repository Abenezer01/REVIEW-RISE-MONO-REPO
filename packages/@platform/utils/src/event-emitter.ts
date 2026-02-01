type Handler<T = any> = (data: T) => void;

/**
 * A simple event emitter for cross-layer communication.
 */
export class EventEmitter {
  private events: Map<string, Handler[]> = new Map();

  on<T = any>(event: string, handler: Handler<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  off<T = any>(event: string, handler: Handler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      this.events.set(
        event,
        handlers.filter((h) => h !== handler)
      );
    }
  }

  emit<T = any>(event: string, data: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}

/**
 * Global instance for system message events
 */
export const systemMessageEvents = new EventEmitter();

// Event names
export const SYSTEM_MESSAGE_EVENT = 'SYSTEM_MESSAGE_EVENT';
