import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function AITodoList({ cleanerEmail }) {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState(new Set());

  useEffect(() => {
    if (cleanerEmail) {
      loadTodos();
    }
  }, [cleanerEmail]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('agentAssistant', {
        action: 'get_todo_list',
        cleaner_email: cleanerEmail
      });
      setTodos(response.data?.todos || []);
    } catch (error) {
      console.error('Failed to load todo list:', error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (todoId) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

  const handleAction = (todo) => {
    if (todo.action_link) {
      navigate(createPageUrl(todo.action_link.replace('/', '')));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-puretask-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-fredoka text-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-puretask-blue" />
          Your AI-Recommended To-Dos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-fredoka text-gray-600">All caught up! Great job.</p>
          </div>
        ) : (
          <AnimatePresence>
            <ol className="space-y-3">
              {todos.map((todo, idx) => (
                <motion.li
                  key={todo.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    completedItems.has(todo.id) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <Checkbox
                    checked={completedItems.has(todo.id)}
                    onCheckedChange={() => handleToggle(todo.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-fredoka ${
                      completedItems.has(todo.id) ? 'line-through text-gray-500' : 'text-gray-800'
                    }`}>
                      {idx + 1}. {todo.description}
                    </p>
                    {todo.reason && (
                      <p className="text-xs text-gray-600 font-verdana mt-1">{todo.reason}</p>
                    )}
                    {todo.action_button && !completedItems.has(todo.id) && (
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-2 p-0 h-auto text-puretask-blue"
                        onClick={() => handleAction(todo)}
                      >
                        {todo.action_button} →
                      </Button>
                    )}
                  </div>
                </motion.li>
              ))}
            </ol>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}