import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, Check, CheckCheck, Clock, 
  AlertCircle, MoreVertical, Trash2, Edit2, Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function ChatMessage({ 
  message, 
  isOwnMessage, 
  senderName, 
  onDelete,
  onEdit,
  onCopy,
  isAdmin = false
}) {
  const [imageError, setImageError] = useState(false);
  
  const isSystemMessage = message.type === 'system_message' || message.type === 'quick_action';
  const isAttachment = message.type === 'attachment';
  const isImage = message.type === 'image' || (
    message.attachment_url && 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(message.attachment_url)
  );

  const getDeliveryIcon = () => {
    if (!isOwnMessage) return null;
    
    switch (message.delivery_status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-slate-400 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'sent':
        return <Check className="w-3 h-3 text-slate-400" />;
      case 'delivered':
        return message.is_read ? (
          <CheckCheck className="w-3 h-3 text-blue-500" />
        ) : (
          <CheckCheck className="w-3 h-3 text-slate-400" />
        );
      default:
        return null;
    }
  };

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <Badge variant="outline" className="bg-slate-100 text-slate-700 px-4 py-2">
          {message.content}
        </Badge>
      </div>
    );
  }

  // Check if message is deleted for current user
  const isDeleted = message.deleted_for?.includes(message.sender_email);
  
  if (isDeleted && isOwnMessage) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} my-2`}>
        <div className="max-w-[70%] opacity-50">
          <p className="text-xs text-slate-400 italic">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group my-2`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        <p className="text-xs text-slate-500 mb-1">{isOwnMessage ? 'You' : senderName}</p>
        
        <div className="relative">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isOwnMessage
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                : 'bg-slate-100 text-slate-900'
            }`}
          >
            {isImage && !imageError ? (
              <div className="space-y-2">
                <img
                  src={message.attachment_url}
                  alt="Shared image"
                  className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.attachment_url, '_blank')}
                  onError={() => setImageError(true)}
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                {message.content && message.content !== message.attachment_url && (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            ) : isAttachment ? (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <FileText className="w-4 h-4" />
                <span>{message.content}</span>
                <Download className="w-4 h-4" />
              </a>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
            
            {message.edited && (
              <p className="text-xs opacity-70 mt-1">(edited by admin)</p>
            )}
          </div>

          {/* Message actions dropdown - only for admins */}
          {isAdmin && (
            <div className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCopy(message.content)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {message.type === 'text' && (
                    <DropdownMenuItem onClick={() => onEdit(message)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit (Admin)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete(message.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete (Admin)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Regular users can only copy */}
          {!isAdmin && isOwnMessage && (
            <div className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => onCopy(message.content)}
                title="Copy message"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-400">
            {format(new Date(message.created_date), 'MMM d, h:mm a')}
          </p>
          {getDeliveryIcon()}
        </div>
      </div>
    </div>
  );
}