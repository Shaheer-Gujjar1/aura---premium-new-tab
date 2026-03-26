import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, ListTodo, X } from 'lucide-react';
import { useStore } from '../../stores/useStore';
import { cn } from '../../utils/cn';

export const TodoList: React.FC = () => {
  const { todos, addTodo, toggleTodo, removeTodo } = useStore();
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  return (
    <div className="flex flex-col w-72 h-fit min-h-[120px] relative">
      <div className="flex items-center gap-2 mb-2 px-1">
        <ListTodo className="w-4 h-4 text-white/50" />
        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white/50">Focus Tasks</h3>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/30"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <AnimatePresence initial={false}>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group flex items-center gap-3 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  todo.completed 
                    ? "bg-white border-white" 
                    : "border-white/30 hover:border-white/50"
                )}
              >
                {todo.completed && <Check className="w-3 h-3 text-black" />}
              </button>
              <span className={cn(
                "flex-1 text-sm transition-all",
                todo.completed && "text-white/30 line-through"
              )}>
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {todos.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <p className="text-sm">No tasks for today</p>
          </div>
        )}
      </div>
    </div>
  );
};
