
import React from 'react';
import { Note } from '../types';
import { Star, Clock, BookOpen, Plus as PlusIcon } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, activeNoteId, onSelectNote, onCreateNote }) => {
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
        <BookOpen size={48} className="mb-4 opacity-10" />
        <p className="text-sm">Empty here...</p>
        <p className="font-urdu mt-1">کوئی نوٹس نہیں ملے</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-4">
      {notes.map(note => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          className={`w-full text-left p-4 border-b transition-colors relative group ${
            activeNoteId === note.id ? 'bg-red-50/50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className={`text-sm font-bold truncate flex-1 pr-4 ${!note.title && 'text-gray-400 italic'}`}>
              {note.title || 'Untitled Note'}
            </h3>
            {note.isFavorite && <Star size={14} className="text-amber-500 fill-current" />}
          </div>
          
          <p className="text-xs text-gray-500 line-clamp-2 font-urdu leading-relaxed text-right rtl">
            {note.content || 'خالی نوٹ...'}
          </p>
          
          <div className="flex items-center justify-between mt-3">
             <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase">
               {note.category}
             </span>
             <span className="text-[9px] text-gray-400 flex items-center gap-1">
               <Clock size={10} /> {new Date(note.updatedAt).toLocaleDateString()}
             </span>
          </div>

          {activeNoteId === note.id && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          )}
        </button>
      ))}
      
      {/* Floating Add Button for Mobile List */}
      <button 
        onClick={onCreateNote}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce"
      >
        <PlusIcon size={28} />
      </button>
    </div>
  );
};

export default NoteList;
