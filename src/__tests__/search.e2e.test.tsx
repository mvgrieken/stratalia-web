import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchClient from '../app/search/SearchClient';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock speech APIs
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    continuous: false,
    interimResults: false,
    lang: 'nl-NL',
    start: jest.fn(),
    onresult: null,
    onerror: null,
    onend: null,
  })),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    continuous: false,
    interimResults: false,
    lang: 'nl-NL',
    start: jest.fn(),
    onresult: null,
    onerror: null,
    onend: null,
  })),
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: jest.fn(),
  },
});

describe('SearchClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders search form correctly', () => {
    render(<SearchClient />);
    
    expect(screen.getByPlaceholderText('Zoek een woord...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoeken/i })).toBeInTheDocument();
    expect(screen.getByText('Zoek naar straattaal woorden')).toBeInTheDocument();
  });

  it('handles search submission successfully', async () => {
    const mockResults = [
      {
        id: '1',
        word: 'skeer',
        meaning: 'arm, blut',
        example: 'Ik ben skeer deze maand',
        match_type: 'exact',
        similarity_score: 1
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<SearchClient />);
    
    const input = screen.getByPlaceholderText('Zoek een woord...');
    const submitButton = screen.getByRole('button', { name: /zoeken/i });
    
    // Type search query
    fireEvent.change(input, { target: { value: 'skeer' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Check loading state
    expect(screen.getByText('Zoeken...')).toBeInTheDocument();
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Resultaten (1)')).toBeInTheDocument();
    });
    
    expect(screen.getByText('skeer')).toBeInTheDocument();
    expect(screen.getByText('arm, blut')).toBeInTheDocument();
    expect(screen.getByText('Ik ben skeer deze maand')).toBeInTheDocument();
    
    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('/api/words/search?query=skeer&limit=10');
  });

  it('handles search form submission with Enter key', async () => {
    const mockResults = [
      {
        id: '1',
        word: 'breezy',
        meaning: 'cool, relaxed',
        example: 'Die docent is echt breezy',
        match_type: 'exact',
        similarity_score: 1
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<SearchClient />);
    
    const input = screen.getByPlaceholderText('Zoek een woord...');
    
    // Type search query
    fireEvent.change(input, { target: { value: 'breezy' } });
    
    // Press Enter
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Resultaten (1)')).toBeInTheDocument();
    });
    
    expect(screen.getByText('breezy')).toBeInTheDocument();
    expect(screen.getByText('cool, relaxed')).toBeInTheDocument();
  });

  it('handles search error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<SearchClient />);
    
    const input = screen.getByPlaceholderText('Zoek een woord...');
    const submitButton = screen.getByRole('button', { name: /zoeken/i });
    
    // Type search query
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles empty search query', () => {
    render(<SearchClient />);
    
    const submitButton = screen.getByRole('button', { name: /zoeken/i });
    
    // Submit without typing
    fireEvent.click(submitButton);
    
    // Should not make API call
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows speech recognition button when supported', () => {
    render(<SearchClient />);
    
    // Wait for speech recognition to be initialized
    waitFor(() => {
      expect(screen.getByTitle('Spraak invoer')).toBeInTheDocument();
    });
  });
});
