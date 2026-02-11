'use client';

import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰',
  '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
  '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔',
  '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨',
  '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒',
  '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🥳', '🥺', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈',
  '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀',
  '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞',
  '💓', '💗', '💖', '💘', '💝', '💟', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
  '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🙏', '✍️', '💅', '🤳', '💪',
  '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🔥', '💧',
  '💨', '☀️', '🌙', '⭐', '✨', '⚡', '☄️', '🪐', '🎉', '🎊', '🎈', '🎁', '🎄', '🎃'
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export default function EmojiPicker({ onEmojiSelect, disabled }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" type="button" disabled={disabled}>
            <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 h-96 p-2">
        <div className="h-full overflow-y-auto grid grid-cols-8 gap-1 no-scrollbar">
          {EMOJIS.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => onEmojiSelect(emoji)}
              type="button"
              className="text-2xl rounded-md hover:bg-accent transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
