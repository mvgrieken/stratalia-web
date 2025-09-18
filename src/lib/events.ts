/**
 * Event System for Gamification
 * Simple event bus for handling user actions and gamification events
 */

import { logger } from '@/lib/logger';

export interface BaseEvent {
  id: string;
  type: string;
  userId?: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface UserEvent extends BaseEvent {
  userId: string;
}

export interface QuizCompletedEvent extends UserEvent {
  type: 'quiz.completed';
  data: {
    score: number;
    totalQuestions: number;
    percentage: number;
    timeTaken: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface WordLearnedEvent extends UserEvent {
  type: 'word.learned';
  data: {
    word: string;
    wordId: string;
    source: 'search' | 'daily' | 'quiz';
  };
}

export interface StreakEvent extends UserEvent {
  type: 'streak.updated';
  data: {
    currentStreak: number;
    longestStreak: number;
    action: 'increased' | 'reset';
  };
}

export interface LevelUpEvent extends UserEvent {
  type: 'level.up';
  data: {
    newLevel: number;
    previousLevel: number;
    pointsEarned: number;
    totalPoints: number;
  };
}

export type GameEvent = QuizCompletedEvent | WordLearnedEvent | StreakEvent | LevelUpEvent;

type EventHandler<T extends BaseEvent = BaseEvent> = (_event: T) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();
  private middleware: Array<(_event: BaseEvent) => BaseEvent | null> = [];

  /**
   * Subscribe to an event type
   */
  on<T extends BaseEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
  }

  /**
   * Unsubscribe from an event type
   */
  off<T extends BaseEvent>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit<T extends BaseEvent>(event: T): Promise<void> {
    logger.info(`Event emitted: type=${event.type}, userId=${event.userId}`);

    // Apply middleware
    let processedEvent = event;
    for (const middleware of this.middleware) {
      const result = middleware(processedEvent);
      if (result === null) {
        logger.info(`Event filtered by middleware: type=${event.type}`);
        return;
      }
      processedEvent = result as T;
    }

    // Get handlers for this event type
    const handlers = this.handlers.get(event.type) || [];
    
    // Execute handlers
    const promises = handlers.map(async (handler) => {
      try {
        await handler(processedEvent);
      } catch (error) {
        logger.error(`Event handler failed: eventType=${event.type}, eventId=${event.id} ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Add middleware to process events
   */
  use(middleware: (_event: BaseEvent) => BaseEvent | null): void {
    this.middleware.push(middleware);
  }

  /**
   * Get event statistics
   */
  getStats(): { eventTypes: string[]; handlerCounts: Record<string, number> } {
    const eventTypes = Array.from(this.handlers.keys());
    const handlerCounts: Record<string, number> = {};
    
    for (const [eventType, handlers] of Array.from(this.handlers.entries())) {
      handlerCounts[eventType] = handlers.length;
    }

    return { eventTypes, handlerCounts };
  }
}

// Singleton event bus
export const eventBus = new EventBus();

/**
 * Event factory functions
 */
export const createEvent = {
  quizCompleted: (userId: string, data: QuizCompletedEvent['data']): QuizCompletedEvent => ({
    id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'quiz.completed',
    userId,
    timestamp: new Date().toISOString(),
    data
  }),

  wordLearned: (userId: string, data: WordLearnedEvent['data']): WordLearnedEvent => ({
    id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'word.learned',
    userId,
    timestamp: new Date().toISOString(),
    data
  }),

  streakUpdated: (userId: string, data: StreakEvent['data']): StreakEvent => ({
    id: `streak-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'streak.updated',
    userId,
    timestamp: new Date().toISOString(),
    data
  }),

  levelUp: (userId: string, data: LevelUpEvent['data']): LevelUpEvent => ({
    id: `level-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'level.up',
    userId,
    timestamp: new Date().toISOString(),
    data
  })
};

/**
 * Event handlers for gamification
 */
export class GamificationHandlers {
  /**
   * Handle quiz completion
   */
  static async handleQuizCompleted(_event: QuizCompletedEvent): Promise<void> {
    logger.info(`Processing quiz completion: userId=${_event.userId}, score=${_event.data.score}, percentage=${_event.data.percentage}`);

    // Calculate points based on performance
    const basePoints = 10;
    const bonusPoints = Math.floor(_event.data.percentage / 10) * 5;
    const timeBonus = _event.data.timeTaken < 60 ? 5 : 0;
    const totalPoints = basePoints + bonusPoints + timeBonus;

    // Emit points earned event
    await eventBus.emit(createEvent.levelUp(_event.userId, {
      newLevel: 1, // This would be calculated based on total points
      previousLevel: 1,
      pointsEarned: totalPoints,
      totalPoints: 0 // This would be fetched from user profile
    }));

    // Update user streak if this is a daily quiz
    // This would integrate with a user service
    logger.info(`Quiz completion processed: userId=${_event.userId}, pointsEarned=${totalPoints}`);
  }

  /**
   * Handle word learning
   */
  static async handleWordLearned(_event: WordLearnedEvent): Promise<void> {
    logger.info(`Processing word learned: userId=${_event.userId}, word=${_event.data.word}`);

    // Award points for learning a new word
    const points = 2;
    
    // This would integrate with a user service to update points
    logger.info(`Word learned processed: userId=${_event.userId}, word=${_event.data.word}, pointsEarned=${points}`);
  }

  /**
   * Handle streak updates
   */
  static async handleStreakUpdated(_event: StreakEvent): Promise<void> {
    logger.info(`Processing streak update: userId=${_event.userId}, currentStreak=${_event.data.currentStreak}`);

    // Award bonus points for streaks
    if (_event.data.action === 'increased' && _event.data.currentStreak % 7 === 0) {
      const streakBonus = Math.floor(_event.data.currentStreak / 7) * 10;
      
      await eventBus.emit(createEvent.levelUp(_event.userId, {
        newLevel: 1,
        previousLevel: 1,
        pointsEarned: streakBonus,
        totalPoints: 0
      }));
    }

    logger.info(`Streak update processed: userId=${_event.userId}, streak=${_event.data.currentStreak}`);
  }

  /**
   * Handle level up
   */
  static async handleLevelUp(_event: LevelUpEvent): Promise<void> {
    logger.info(`Processing level up: userId=${_event.userId}, newLevel=${_event.data.newLevel}`);

    // This would integrate with notification service
    // Send congratulations notification
    // Unlock new features/achievements
    
    logger.info(`Level up processed: userId=${_event.userId}, newLevel=${_event.data.newLevel}`);
  }
}

// Register event handlers
eventBus.on('quiz.completed', GamificationHandlers.handleQuizCompleted);
eventBus.on('word.learned', GamificationHandlers.handleWordLearned);
eventBus.on('streak.updated', GamificationHandlers.handleStreakUpdated);
eventBus.on('level.up', GamificationHandlers.handleLevelUp);

// Add logging middleware
eventBus.use((event) => {
  logger.debug(`Event processed: type=${event.type}, id=${event.id}, userId=${event.userId}`);
  return event;
});
