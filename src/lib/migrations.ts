/**
 * Database Migration System
 * Simple migration system for database schema changes
 */

import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
  executed_at?: string;
}

class MigrationService {
  private readonly migrationsTable = 'migrations';

  /**
   * Initialize migrations table
   */
  async initialize(): Promise<void> {
    logger.info('Initializing migrations table');

    try {
      const supabase = getSupabaseServiceClient();
      
      // Create migrations table if it doesn't exist
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (error) {
        logger.error('Failed to initialize migrations table', error);
        throw error;
      }

      logger.info('Migrations table initialized successfully');
    } catch (error) {
      logger.error('Migration initialization failed', error);
      throw error;
    }
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations(): Promise<string[]> {
    try {
      const supabase = getSupabaseServiceClient();
      
      const { data, error } = await supabase
        .from(this.migrationsTable)
        .select('id')
        .order('executed_at');

      if (error) {
        logger.error('Failed to get executed migrations', error);
        throw error;
      }

      return data?.map(m => m.id) || [];
    } catch (error) {
      logger.error('Get executed migrations failed', error);
      return [];
    }
  }

  /**
   * Execute a migration
   */
  async executeMigration(migration: Migration): Promise<void> {
    logger.info(`Executing migration: ${migration.name}`);

    try {
      const supabase = getSupabaseServiceClient();
      
      // Execute the migration SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: migration.up
      });

      if (sqlError) {
        logger.error(`Migration ${migration.name} failed`, sqlError);
        throw sqlError;
      }

      // Record the migration as executed
      const { error: recordError } = await supabase
        .from(this.migrationsTable)
        .insert([{
          id: migration.id,
          name: migration.name,
          executed_at: new Date().toISOString()
        }]);

      if (recordError) {
        logger.error(`Failed to record migration ${migration.name}`, recordError);
        throw recordError;
      }

      logger.info(`Migration ${migration.name} executed successfully`);
    } catch (error) {
      logger.error(`Migration execution failed: ${migration.name}`, error);
      throw error;
    }
  }

  /**
   * Rollback a migration
   */
  async rollbackMigration(migration: Migration): Promise<void> {
    logger.info(`Rolling back migration: ${migration.name}`);

    try {
      const supabase = getSupabaseServiceClient();
      
      // Execute the rollback SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: migration.down
      });

      if (sqlError) {
        logger.error(`Migration rollback ${migration.name} failed`, sqlError);
        throw sqlError;
      }

      // Remove the migration record
      const { error: recordError } = await supabase
        .from(this.migrationsTable)
        .delete()
        .eq('id', migration.id);

      if (recordError) {
        logger.error(`Failed to remove migration record ${migration.name}`, recordError);
        throw recordError;
      }

      logger.info(`Migration ${migration.name} rolled back successfully`);
    } catch (error) {
      logger.error(`Migration rollback failed: ${migration.name}`, error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(migrations: Migration[]): Promise<void> {
    logger.info('Running pending migrations');

    try {
      await this.initialize();
      
      const executedMigrations = await this.getExecutedMigrations();
      const pendingMigrations = migrations.filter(m => !executedMigrations.includes(m.id));

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration run failed', error);
      throw error;
    }
  }
}

// Define migrations
export const migrations: Migration[] = [
  {
    id: '001_create_words_table',
    name: 'Create words table',
    up: `
      CREATE TABLE IF NOT EXISTS words (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        word VARCHAR(255) NOT NULL UNIQUE,
        definition TEXT,
        meaning TEXT,
        example TEXT,
        category VARCHAR(100),
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
      CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
      CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty);
    `,
    down: `
      DROP TABLE IF EXISTS words;
    `
  },
  {
    id: '002_create_quiz_questions_table',
    name: 'Create quiz questions table',
    up: `
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        question_text TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        wrong_answers TEXT[] NOT NULL,
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_quiz_questions_word ON quiz_questions(word);
    `,
    down: `
      DROP TABLE IF EXISTS quiz_questions;
    `
  },
  {
    id: '003_create_word_of_the_day_table',
    name: 'Create word of the day table',
    up: `
      CREATE TABLE IF NOT EXISTS word_of_the_day (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
        date DATE NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_word_of_the_day_date ON word_of_the_day(date);
    `,
    down: `
      DROP TABLE IF EXISTS word_of_the_day;
    `
  },
  {
    id: '004_create_quiz_results_table',
    name: 'Create quiz results table',
    up: `
      CREATE TABLE IF NOT EXISTS quiz_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        time_taken INTEGER NOT NULL,
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        questions JSONB,
        correct_answers TEXT[],
        wrong_answers JSONB,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
      CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at);
    `,
    down: `
      DROP TABLE IF EXISTS quiz_results;
    `
  },
  {
    id: '005_add_full_text_search',
    name: 'Add full text search indexes',
    up: `
      -- Create full text search index for words
      CREATE INDEX IF NOT EXISTS idx_words_full_text 
      ON words USING gin(to_tsvector('dutch', word || ' ' || COALESCE(definition, '') || ' ' || COALESCE(meaning, '')));
      
      -- Create full text search index for quiz questions
      CREATE INDEX IF NOT EXISTS idx_quiz_questions_full_text 
      ON quiz_questions USING gin(to_tsvector('dutch', word || ' ' || question_text));
    `,
    down: `
      DROP INDEX IF EXISTS idx_words_full_text;
      DROP INDEX IF EXISTS idx_quiz_questions_full_text;
    `
  }
];

// Singleton instance
export const migrationService = new MigrationService();
