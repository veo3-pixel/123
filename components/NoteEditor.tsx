
import React, { useEffect, useRef } from 'react';
import { Note, NoteCategory } from '../types';
import { Trash2, Star, Share2, ChevronLeft, Calendar, Tag, Maximize2 } from 'lucide-react';

interface NoteEditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate, onDelete, onBack }) => {
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [note.content]);

  return (
    <div className="flex flex-col h-full bg-white md:bg-transparent animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="md:hidden p-2 text-gray-400 hover:text-primary transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border">
             <Calendar size={12} /> Last saved: {new Date(note.updatedAt).toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-3">
          <button 
            onClick={() => onUpdate({ isFavorite: !note.isFavorite })}
            className={`p-2 rounded-lg transition-colors ${note.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Toggle Favorite"
          >
            <Star size={20} fill={note.isFavorite ? 'currentColor' : 'none'} />
          </button>
          
          <select 
            className="text-xs font-bold bg-gray-50 border rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
            value={note.category}
            onChange={(e) => onUpdate({ category: e.target.value as NoteCategory })}
          >
            {Object.values(NoteCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button 
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Note"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Writing Surface */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Title Input */}
          <input 
            type="text"
            placeholder="Title / عنوان"
            className="w-full text-2xl md:text-4xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-200 font-urdu text-right md:text-left"
            value={note.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            dir="auto"
          />

          {/* Metadata Bar */}
          <div className="flex items-center gap-4 text-[11px] font-bold text-primary opacity-50 uppercase tracking-tighter">
             <span className="flex items-center gap-1"><Tag size={12}/> {note.category}</span>
             <span className="w-1 h-1 bg-primary rounded-full"></span>
             <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Content Editor */}
          <textarea 
            ref={contentRef}
            placeholder="Start writing in Urdu or English... / لکھنا شروع کریں..."
            className="w-full text-lg md:text-xl leading-relaxed bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-gray-200 font-urdu min-h-[400px]"
            value={note.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            dir="auto"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Bottom Context Info (Mobile) */}
      <div className="p-4 md:hidden border-t bg-white flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
         <span>Characters: {note.content.length}</span>
         <span>Words: {note.content.trim().split(/\s+/).filter(Boolean).length}</span>
      </div>
    </div>
  );
};

export default NoteEditor;
