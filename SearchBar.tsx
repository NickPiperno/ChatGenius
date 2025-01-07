'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchResult {
  id: string
  content: string
  sender: {
    name: string
    imageUrl: string
  }
  channel: string
  timestamp: Date
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Mock search results
  const results: SearchResult[] = [
    {
      id: '1',
      content: 'This is a sample message containing the search term',
      sender: { name: 'Elon Musk', imageUrl: '' },
      channel: 'General',
      timestamp: new Date(),
    },
  ]

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Add keyboard shortcut (Ctrl/Cmd + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setShowResults(false)
      }
    }

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Add to recent searches
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))

    // Handle search internally
    console.log('Searching for:', searchQuery)
    setShowResults(false)
  }

  return (
    <div className="flex-shrink-0 border-b bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white" ref={searchRef}>
      <div className="container mx-auto px-4 py-3 flex justify-center">
        <div className="w-full max-w-2xl relative">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                ref={inputRef}
                type="search"
                placeholder='Search messages... (Ctrl + K)'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                className="pl-9 w-full bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-white text-purple-700 hover:bg-white/90">
              Search
            </Button>
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <div 
              ref={resultsRef}
              className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-[70vh] overflow-hidden"
              onMouseLeave={() => setShowResults(false)}
            >
              <div className="p-2 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Recent Searches</span>
                  {recentSearches.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRecentSearches([])
                        localStorage.removeItem('recentSearches')
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {recentSearches.length > 0 ? (
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setSearchQuery(search)
                          setShowResults(false)
                        }}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {search}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent searches</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 