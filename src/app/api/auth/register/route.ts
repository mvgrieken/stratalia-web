import { NextRequest, NextResponse } from 'next/server';

interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
  age?: number;
  location?: string;
  interests?: string[];
  learning_goals?: string[];
}

interface RegisterResponse {
  success: boolean;
  user_id?: string;
  message: string;
  requires_verification?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, display_name, age, location, interests, learning_goals } = body;

    // Validation
    if (!email || !password || !display_name) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email, password en display name zijn verplicht' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wachtwoord moet minimaal 8 karakters lang zijn' 
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Ongeldig email adres' 
      }, { status: 400 });
    }

    // Mock registration - in production this would integrate with Supabase Auth
    const registrationResult = await mockUserRegistration(body);

    return NextResponse.json(registrationResult);
  } catch (error) {
    console.error('Error in user registration:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Registratie mislukt. Probeer het opnieuw.' 
    }, { status: 500 });
  }
}

async function mockUserRegistration(userData: RegisterRequest): Promise<RegisterResponse> {
  // Mock user ID generation
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mock email verification requirement
  const requiresVerification = true;
  
  // Mock successful registration
  return {
    success: true,
    user_id: userId,
    message: 'Registratie succesvol! Check je email voor verificatie.',
    requires_verification: requiresVerification
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
