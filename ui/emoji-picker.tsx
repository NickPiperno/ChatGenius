import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Smile, 
  Heart, 
  Coffee, 
  Plane, 
  Flag,
  Activity,
  Sun,
  Clock
} from 'lucide-react'

const emojiCategories = {
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
  emotions: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
  food: ['☕', '🍺', '🍷', '🥂', '🥃', '🍸', '🍹', '🧃', '🥤', '🍽️', '🍴', '🥄', '🍳', '🧂'],
  travel: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸'],
  nature: ['🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔'],
  flags: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️'],
  recent: [] as string[], // Will be populated from localStorage
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('smileys')

  const addToRecent = (emoji: string) => {
    const recent = JSON.parse(localStorage.getItem('recentEmojis') || '[]')
    const newRecent = [emoji, ...recent.filter((e: string) => e !== emoji)].slice(0, 15)
    localStorage.setItem('recentEmojis', JSON.stringify(newRecent))
    emojiCategories.recent = newRecent
  }

  const handleEmojiSelect = (emoji: string) => {
    addToRecent(emoji)
    onEmojiSelect(emoji)
  }

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg border">
      <Tabs defaultValue="smileys" onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-8">
          <TabsTrigger value="smileys"><Smile className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="emotions"><Heart className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="food"><Coffee className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="travel"><Plane className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="activities"><Activity className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="nature"><Sun className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="flags"><Flag className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="recent"><Clock className="h-4 w-4" /></TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[200px] p-2">
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <TabsContent key={category} value={category} className="m-0">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </ScrollArea>
      </Tabs>
    </div>
  )
} 