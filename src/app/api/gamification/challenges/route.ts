import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  reward_points: number;
  reward_badge?: string;
  requirements: {
    type: 'quiz_score' | 'streak' | 'words_learned' | 'community_contributions' | 'time_spent';
    target: number;
    current?: number;
  }[];
  start_date: string;
  end_date: string;
  is_completed: boolean;
  progress_percentage: number;
  participants_count: number;
}

interface ChallengesResponse {
  active_challenges: Challenge[];
  completed_challenges: Challenge[];
  upcoming_challenges: Challenge[];
  user_stats: {
    total_challenges_completed: number;
    total_rewards_earned: number;
    current_streak: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    const challengesData = await generateChallenges(user_id);

    return NextResponse.json(challengesData);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { challenge_id, user_id, action } = body;

    if (!challenge_id || !user_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Handle challenge actions (join, complete, claim reward)
    const result = await handleChallengeAction(challenge_id, user_id, action, supabase);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error handling challenge action:', error);
    return NextResponse.json({ error: 'Failed to handle challenge action' }, { status: 500 });
  }
}

async function generateChallenges(_user_id?: string | null): Promise<ChallengesResponse> {
  try {
    console.log(`🎯 Generating challenges for user: ${_user_id}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are missing!');
      return {
        active_challenges: [],
        completed_challenges: [],
        upcoming_challenges: [],
        user_stats: {
          total_challenges_completed: 0,
          total_rewards_earned: 0,
          current_streak: 0
        }
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const now = new Date();

    // Haal challenges op uit Supabase
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (challengesError) {
      console.error('❌ Error fetching challenges:', challengesError);
      throw challengesError;
    }

    // Haal user progress op als user_id is opgegeven
    let userProgress = null;
    if (_user_id) {
      const { data: progress, error: progressError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', _user_id);

      if (progressError) {
        console.error('❌ Error fetching user progress:', progressError);
      } else {
        userProgress = progress;
      }
    }

    // Transform challenges to our format
    const activeChallenges: Challenge[] = challenges?.map(challenge => {
      const userChallenge = userProgress?.find(p => p.challenge_id === challenge.id);
      
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type as any,
        difficulty: challenge.difficulty as any,
        reward_points: challenge.reward_points,
        reward_badge: challenge.reward_badge_id ? '🏆' : undefined,
        requirements: challenge.conditions || [],
        start_date: challenge.start_date,
        end_date: challenge.end_date,
        is_completed: userChallenge?.is_completed || false,
        progress_percentage: userChallenge?.progress || 0,
        participants_count: challenge.max_participants || 0
      };
    }).filter(challenge => {
      const startDate = new Date(challenge.start_date);
      const endDate = new Date(challenge.end_date);
      return startDate <= now && endDate >= now;
    }) || [];

    const completedChallenges: Challenge[] = challenges?.map(challenge => {
      const userChallenge = userProgress?.find(p => p.challenge_id === challenge.id);
      
      if (!userChallenge?.is_completed) return null;
      
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type as any,
        difficulty: challenge.difficulty as any,
        reward_points: challenge.reward_points,
        reward_badge: challenge.reward_badge_id ? '🏆' : undefined,
        requirements: challenge.conditions || [],
        start_date: challenge.start_date,
        end_date: challenge.end_date,
        is_completed: true,
        progress_percentage: 100,
        participants_count: challenge.max_participants || 0
      };
    }).filter(Boolean) as Challenge[] || [];

    const upcomingChallenges: Challenge[] = challenges?.map(challenge => {
      const startDate = new Date(challenge.start_date);
      if (startDate <= now) return null;
      
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type as any,
        difficulty: challenge.difficulty as any,
        reward_points: challenge.reward_points,
        reward_badge: challenge.reward_badge_id ? '🏆' : undefined,
        requirements: challenge.conditions || [],
        start_date: challenge.start_date,
        end_date: challenge.end_date,
        is_completed: false,
        progress_percentage: 0,
        participants_count: 0
      };
    }).filter(Boolean) as Challenge[] || [];

    // Haal user stats op
    const userStats = {
      total_challenges_completed: completedChallenges.length,
      total_rewards_earned: 0,
      current_streak: 0
    };

    if (_user_id) {
      const { data: userPoints, error: pointsError } = await supabase
        .from('user_points')
        .select('total_points, current_streak')
        .eq('user_id', _user_id)
        .single();

      if (!pointsError && userPoints) {
        userStats.current_streak = userPoints.current_streak;
        userStats.total_rewards_earned = userPoints.total_points;
      }
    }

    console.log(`✅ Generated ${activeChallenges.length} active, ${completedChallenges.length} completed, ${upcomingChallenges.length} upcoming challenges`);

    return {
      active_challenges: activeChallenges,
      completed_challenges: completedChallenges,
      upcoming_challenges: upcomingChallenges,
      user_stats: userStats
    };

  } catch (error) {
    console.error('❌ Error generating challenges:', error);
    // Return empty challenges instead of mock data
    return {
      active_challenges: [],
      completed_challenges: [],
      upcoming_challenges: [],
      user_stats: {
        total_challenges_completed: 0,
        total_rewards_earned: 0,
        current_streak: 0
      }
    };
  }
}

async function handleChallengeAction(challenge_id: string, user_id: string, action: string, supabase: any) {
  try {
    console.log(`🎯 Handling challenge action: ${action} for user ${user_id}, challenge ${challenge_id}`);

    switch (action) {
      case 'join': {
        // Voeg user toe aan challenge
        const { error: joinError } = await supabase
          .from('user_challenges')
          .insert({
            user_id,
            challenge_id,
            progress: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          });

        if (joinError) {
          console.error('❌ Error joining challenge:', joinError);
          return { error: 'Failed to join challenge' };
        }

        return { message: 'Challenge joined successfully', challenge_id, user_id };
      }

      case 'complete': {
        // Markeer challenge als voltooid
        const { error: completeError } = await supabase
          .from('user_challenges')
          .update({
            is_completed: true,
            progress: 100,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .eq('challenge_id', challenge_id);

        if (completeError) {
          console.error('❌ Error completing challenge:', completeError);
          return { error: 'Failed to complete challenge' };
        }

        // Haal reward op uit challenge
        const { data: challenge, error: challengeError } = await supabase
          .from('challenges')
          .select('reward_points')
          .eq('id', challenge_id)
          .single();

        if (challengeError) {
          console.error('❌ Error fetching challenge reward:', challengeError);
        }

        // Update user points
        if (challenge?.reward_points) {
          const { error: pointsError } = await supabase
            .from('user_points')
            .upsert({
              user_id,
              total_points: challenge.reward_points,
              level: 1,
              current_streak: 1,
              longest_streak: 1
            });

          if (pointsError) {
            console.error('❌ Error updating user points:', pointsError);
          }
        }

        return { 
          message: 'Challenge completed!', 
          reward_earned: challenge?.reward_points || 0, 
          challenge_id, 
          user_id 
        };
      }

      case 'claim_reward':
        // Reward is al toegekend bij completion
        return { message: 'Reward claimed successfully', challenge_id, user_id };

      default:
        return { error: 'Invalid action' };
    }

  } catch (error) {
    console.error('❌ Error handling challenge action:', error);
    return { error: 'Failed to handle challenge action' };
  }
}
