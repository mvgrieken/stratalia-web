import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeClient from '@/app/knowledge/KnowledgeClient';

const items = [
  { id: 'a', type: 'article', title: 'Intro', content: 'Text', author: 'A', category: 'intro', tags: ['intro'], difficulty: 'beginner', created_at: '', updated_at: '', is_active: true },
  { id: 'b', type: 'video', title: 'Deep dive', content: 'Video', author: 'B', category: 'video', tags: ['video'], difficulty: 'advanced', created_at: '', updated_at: '', is_active: true },
] as any;

describe('KnowledgeClient filters', () => {
  it('filters by type', () => {
    render(<KnowledgeClient initialItems={items} />);
    // Select type video
    const typeSelect = screen.getByLabelText('Type');
    fireEvent.change(typeSelect, { target: { value: 'video' } });
    expect(screen.getByText(/1 van 2 items gevonden/)).toBeInTheDocument();
  });

  it('filters by difficulty', () => {
    render(<KnowledgeClient initialItems={items} />);
    const levelSelect = screen.getByLabelText('Niveau');
    fireEvent.change(levelSelect, { target: { value: 'advanced' } });
    expect(screen.getByText(/1 van 2 items gevonden/)).toBeInTheDocument();
  });
});


