import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
}

interface WordSearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type?: string;
  similarity_score?: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'search' | 'quiz' | 'daily' | 'knowledge' | 'profile'>('home');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser({
        id: userId,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role
      });
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        setCurrentView('home');
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: 'user'
          });

        if (profileError) throw profileError;

        // Initialize user points
        await supabase
          .from('user_points')
          .insert({
            user_id: data.user.id,
            total_points: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0
          });

        await loadUserProfile(data.user.id);
        setCurrentView('home');
      }
    } catch (error: any) {
      Alert.alert('Registration Error', error.message);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCurrentView('home');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const searchWords = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://www.stratalia.nl/api/words/search?query=${encodeURIComponent(searchQuery)}&limit=10`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search words');
    } finally {
      setIsSearching(false);
    }
  };

  const speakWord = (word: string) => {
    Speech.speak(word, { language: 'nl-NL', rate: 0.8 });
  };

  const speakMeaning = (meaning: string) => {
    Speech.speak(meaning, { language: 'nl-NL', rate: 0.8 });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'home' && styles.navButtonActive]}
          onPress={() => setCurrentView('home')}
        >
          <Text style={styles.navButtonText}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'search' && styles.navButtonActive]}
          onPress={() => setCurrentView('search')}
        >
          <Text style={styles.navButtonText}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'quiz' && styles.navButtonActive]}
          onPress={() => setCurrentView('quiz')}
        >
          <Text style={styles.navButtonText}>🧠</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'daily' && styles.navButtonActive]}
          onPress={() => setCurrentView('daily')}
        >
          <Text style={styles.navButtonText}>📅</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'knowledge' && styles.navButtonActive]}
          onPress={() => setCurrentView('knowledge')}
        >
          <Text style={styles.navButtonText}>📚</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'profile' && styles.navButtonActive]}
          onPress={() => setCurrentView('profile')}
        >
          <Text style={styles.navButtonText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {currentView === 'home' && <HomeScreen user={user} />}
        {currentView === 'search' && (
          <SearchScreen 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearch={searchWords}
            onSpeakWord={speakWord}
            onSpeakMeaning={speakMeaning}
          />
        )}
        {currentView === 'quiz' && <QuizScreen user={user} />}
        {currentView === 'daily' && <DailyWordScreen user={user} />}
        {currentView === 'knowledge' && <KnowledgeScreen user={user} />}
        {currentView === 'profile' && <ProfileScreen user={user} onSignOut={signOut} />}
      </ScrollView>
    </View>
  );
}

// Auth Screen Component
function AuthScreen({ onSignIn, onSignUp }: { onSignIn: (email: string, password: string) => void; onSignUp: (email: string, password: string, fullName: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = () => {
    if (isLogin) {
      onSignIn(email, password);
    } else {
      onSignUp(email, password, fullName);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>Stratalia</Text>
      <Text style={styles.subtitle}>Leer straattaal</Text>
      
      <View style={styles.authForm}>
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Volledige naam"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Wachtwoord"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isLogin ? 'Inloggen' : 'Registreren'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? 'Nog geen account? Registreer' : 'Al een account? Inloggen'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Home Screen Component
function HomeScreen({ user }: { user: User }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Welkom, {user.full_name}!</Text>
      <Text style={styles.screenSubtitle}>Leer straattaal met Stratalia</Text>
      
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionEmoji}>🔍</Text>
          <Text style={styles.quickActionText}>Zoek Woorden</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionEmoji}>🧠</Text>
          <Text style={styles.quickActionText}>Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionEmoji}>📅</Text>
          <Text style={styles.quickActionText}>Woord van de Dag</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Search Screen Component
function SearchScreen({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  isSearching, 
  onSearch, 
  onSpeakWord, 
  onSpeakMeaning 
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: WordSearchResult[];
  isSearching: boolean;
  onSearch: () => void;
  onSpeakWord: (word: string) => void;
  onSpeakMeaning: (meaning: string) => void;
}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Zoek Straattaal</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Zoek een straattaalwoord..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>Zoeken</Text>
        </TouchableOpacity>
      </View>

      {isSearching && <Text style={styles.loadingText}>Zoeken...</Text>}

      {searchResults.map((result) => (
        <View key={result.id} style={styles.resultCard}>
          <Text style={styles.resultWord}>{result.word}</Text>
          <Text style={styles.resultMeaning}>{result.meaning}</Text>
          {result.example && (
            <Text style={styles.resultExample}>"{result.example}"</Text>
          )}
          <View style={styles.audioButtons}>
            <TouchableOpacity 
              style={styles.audioButton}
              onPress={() => onSpeakWord(result.word)}
            >
              <Text style={styles.audioButtonText}>🔊 {result.word}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.audioButton}
              onPress={() => onSpeakMeaning(result.meaning)}
            >
              <Text style={styles.audioButtonText}>🔊 Betekenis</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

// Quiz Screen Component
function QuizScreen({ user }: { user: User }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://www.stratalia.nl/api/quiz?difficulty=medium&limit=5');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        setError('Fout bij het laden van quiz vragen');
      }
    } catch (err) {
      setError('Fout bij het laden van quiz vragen');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    fetchQuizQuestions();
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !questions[currentQuestion]) return;

    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Award points
    if (user) {
      fetch('https://www.stratalia.nl/api/gamification/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          points: isCorrect ? 10 : 0,
          action_type: 'quiz_answer',
          metadata: { question_id: question.id, correct: isCorrect }
        })
      }).catch(console.error);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setError(null);
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Quiz</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Quiz vragen laden...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Quiz</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchQuizQuestions}>
            <Text style={styles.retryButtonText}>Opnieuw proberen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Quiz</Text>
        <Text style={styles.screenSubtitle}>Test je straattaal kennis</Text>
        <View style={styles.startContainer}>
          <Text style={styles.startDescription}>
            Beantwoord 5 vragen over straattaal en verdien punten!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (quizCompleted) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Quiz Voltooid!</Text>
        <View style={styles.resultContainer}>
          <Text style={styles.resultScore}>Score: {score}/{questions.length}</Text>
          <Text style={styles.resultPercentage}>
            {Math.round((score / questions.length) * 100)}%
          </Text>
          <Text style={styles.resultMessage}>
            {score === questions.length ? 'Perfect! 🎉' : 
             score >= questions.length * 0.8 ? 'Goed gedaan! 👏' : 
             'Niet slecht! 👍'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
            <Text style={styles.retryButtonText}>Nieuwe Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const allAnswers = [question.correct_answer, ...(question.wrong_answers || [])].sort();

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Quiz</Text>
      <View style={styles.quizContainer}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Vraag {currentQuestion + 1} van {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.question_text}</Text>
          <Text style={styles.questionWord}>"{question.word}"</Text>
        </View>

        <View style={styles.answersContainer}>
          {allAnswers.map((answer, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerButton,
                selectedAnswer === answer && styles.selectedAnswer
              ]}
              onPress={() => setSelectedAnswer(answer)}
            >
              <Text style={[
                styles.answerText,
                selectedAnswer === answer && styles.selectedAnswerText
              ]}>
                {answer}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !selectedAnswer && styles.disabledButton]}
          onPress={submitAnswer}
          disabled={!selectedAnswer}
        >
          <Text style={styles.submitButtonText}>
            {currentQuestion < questions.length - 1 ? 'Volgende' : 'Voltooien'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Daily Word Screen Component
function DailyWordScreen({ user }: { user: User }) {
  const [dailyWord, setDailyWord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyWord = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://www.stratalia.nl/api/words/daily');
      if (response.ok) {
        const data = await response.json();
        setDailyWord(data);
        
        // Award points for viewing daily word
        if (user) {
          fetch('https://www.stratalia.nl/api/gamification/points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              points: 25,
              action_type: 'daily_word_viewed',
              metadata: { word: data.word }
            })
          }).catch(console.error);
        }
      } else {
        setError('Fout bij het laden van het woord van de dag');
      }
    } catch (err) {
      setError('Fout bij het laden van het woord van de dag');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyWord();
  }, []);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Woord van de Dag</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Woord van de dag laden...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Woord van de Dag</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDailyWord}>
            <Text style={styles.retryButtonText}>Opnieuw proberen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!dailyWord) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Woord van de Dag</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Geen woord van de dag beschikbaar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Woord van de Dag</Text>
      <View style={styles.dailyWordContainer}>
        <View style={styles.dailyWordCard}>
          <Text style={styles.dailyWordTitle}>{dailyWord.word}</Text>
          <Text style={styles.dailyWordMeaning}>{dailyWord.meaning}</Text>
          {dailyWord.example && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Voorbeeld:</Text>
              <Text style={styles.exampleText}>"{dailyWord.example}"</Text>
            </View>
          )}
          
          <View style={styles.audioButtons}>
            <TouchableOpacity 
              style={styles.audioButton}
              onPress={() => speakWord(dailyWord.word)}
            >
              <Text style={styles.audioButtonText}>🔊 {dailyWord.word}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.audioButton}
              onPress={() => speakWord(dailyWord.meaning)}
            >
              <Text style={styles.audioButtonText}>🔊 Betekenis</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dailyWordActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchDailyWord}>
            <Text style={styles.refreshButtonText}>🔄 Nieuw Woord</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dailyWordTips}>
          <Text style={styles.tipsTitle}>💡 Leertips</Text>
          <Text style={styles.tipText}>• Probeer het woord vandaag te gebruiken</Text>
          <Text style={styles.tipText}>• Luister naar de uitspraak</Text>
          <Text style={styles.tipText}>• Onthoud het voorbeeld</Text>
        </View>
      </View>
    </View>
  );
}

// Knowledge Screen Component
function KnowledgeScreen({ user }: { user: User }) {
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadedItems, setDownloadedItems] = useState<Set<string>>(new Set());

  const fetchKnowledgeItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://www.stratalia.nl/api/content/approved?limit=20');
      if (response.ok) {
        const data = await response.json();
        setKnowledgeItems(data.content || []);
      } else {
        setError('Fout bij het laden van kennisbank items');
      }
    } catch (err) {
      setError('Fout bij het laden van kennisbank items');
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = async (item: any) => {
    try {
      // Save to AsyncStorage for offline access
      const offlineData = {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        downloaded_at: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`knowledge_${item.id}`, JSON.stringify(offlineData));
      setDownloadedItems(prev => new Set([...prev, item.id]));
      
      Alert.alert('Gedownload', 'Item is opgeslagen voor offline gebruik');
    } catch (error) {
      Alert.alert('Fout', 'Kon item niet downloaden');
    }
  };

  const loadDownloadedItems = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const knowledgeKeys = keys.filter(key => key.startsWith('knowledge_'));
      const downloadedIds = new Set(knowledgeKeys.map(key => key.replace('knowledge_', '')));
      setDownloadedItems(downloadedIds);
    } catch (error) {
      console.error('Error loading downloaded items:', error);
    }
  };

  useEffect(() => {
    fetchKnowledgeItems();
    loadDownloadedItems();
  }, []);

  if (loading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Kennisbank</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Kennisbank items laden...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Kennisbank</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchKnowledgeItems}>
            <Text style={styles.retryButtonText}>Opnieuw proberen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Kennisbank</Text>
      <Text style={styles.screenSubtitle}>Leer meer over straattaal</Text>
      
      <View style={styles.knowledgeContainer}>
        {knowledgeItems.map((item) => (
          <View key={item.id} style={styles.knowledgeCard}>
            <View style={styles.knowledgeHeader}>
              <Text style={styles.knowledgeTitle}>{item.title}</Text>
              <View style={styles.knowledgeActions}>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadItem(item)}
                  disabled={downloadedItems.has(item.id)}
                >
                  <Text style={styles.downloadButtonText}>
                    {downloadedItems.has(item.id) ? '✅' : '⬇️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.knowledgeContent} numberOfLines={3}>
              {item.content}
            </Text>
            
            <View style={styles.knowledgeMeta}>
              <Text style={styles.knowledgeCategory}>{item.category}</Text>
              {downloadedItems.has(item.id) && (
                <Text style={styles.offlineIndicator}>📱 Offline beschikbaar</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {knowledgeItems.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Geen kennisbank items beschikbaar</Text>
        </View>
      )}
    </View>
  );
}

// Profile Screen Component
function ProfileScreen({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Profiel</Text>
      <Text style={styles.profileText}>Naam: {user.full_name}</Text>
      <Text style={styles.profileText}>Email: {user.email}</Text>
      <Text style={styles.profileText}>Rol: {user.role}</Text>
      
      <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
        <Text style={styles.signOutButtonText}>Uitloggen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  screen: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  authForm: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultWord: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultMeaning: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  resultExample: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  audioButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  audioButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  audioButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  comingSoon: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
  // Quiz styles
  quizContainer: {
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  questionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  questionWord: {
    fontSize: 20,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedAnswer: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedAnswerText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 20,
  },
  resultScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  resultMessage: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Daily word styles
  dailyWordContainer: {
    padding: 20,
  },
  dailyWordCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  dailyWordTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  dailyWordMeaning: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  exampleContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  exampleLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  exampleText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  audioButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  audioButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  dailyWordActions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dailyWordTips: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  // Knowledge styles
  knowledgeContainer: {
    padding: 20,
  },
  knowledgeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  knowledgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  knowledgeActions: {
    flexDirection: 'row',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  knowledgeContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  knowledgeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  knowledgeCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offlineIndicator: {
    fontSize: 12,
    color: '#34C759',
  },
  profileText: {
    fontSize: 16,
    marginBottom: 12,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
