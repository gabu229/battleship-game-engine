import type { GameEvent, GameEventListener, GameEventType } from "../types";

/**
 * Event emitter for game events
 */
export class EventEmitter {
  private listeners = new Map<GameEventType, Set<GameEventListener>>();
  private onceListeners = new Map<GameEventType, Set<GameEventListener>>();

  /**
   * Subscribe to an event
   */
  on(eventType: GameEventType, listener: GameEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => this.off(eventType, listener);
  }

  /**
   * Subscribe to an event once
   */
  once(eventType: GameEventType, listener: GameEventListener): () => void {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, new Set());
    }

    this.onceListeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.onceListeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType: GameEventType, listener: GameEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }

    const onceListeners = this.onceListeners.get(eventType);
    if (onceListeners) {
      onceListeners.delete(listener);
    }
  }

  /**
   * Emit an event
   */
  emit(event: GameEvent): void {
    // Call regular listeners
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      }
    }

    // Call and remove once listeners
    const onceListeners = this.onceListeners.get(event.type);
    if (onceListeners) {
      for (const listener of onceListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(
            `Error in once event listener for ${event.type}:`,
            error,
          );
        }
      }
      this.onceListeners.delete(event.type);
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(eventType?: GameEventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
      this.onceListeners.delete(eventType);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Get listener count for an event type
   */
  listenerCount(eventType: GameEventType): number {
    const regular = this.listeners.get(eventType)?.size ?? 0;
    const once = this.onceListeners.get(eventType)?.size ?? 0;
    return regular + once;
  }

  /**
   * Clone the event emitter
   */
  clone(): EventEmitter {
    const cloned = new EventEmitter();

    // Copy regular listeners
    for (const [eventType, listeners] of this.listeners) {
      cloned.listeners.set(eventType, new Set(listeners));
    }

    // Copy once listeners
    for (const [eventType, listeners] of this.onceListeners) {
      cloned.onceListeners.set(eventType, new Set(listeners));
    }

    return cloned;
  }
}
