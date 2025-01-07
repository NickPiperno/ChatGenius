'use client'

import { useState, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current username from our database
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(`/api/user/username?userId=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username || user?.username || '');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername(user?.username || '');
      }
    };

    if (user?.id) {
      fetchUsername();
    }
  }, [user?.id, user?.username]);

  const handleSave = async () => {
    if (!username.trim()) return;
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          username: username,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setIsEditing(false);
      toast.success('Username updated successfully');
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update username');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-8">
      <div className="container max-w-3xl mx-auto space-y-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
          
          <div className="space-y-6">
            {/* Username Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Username</h3>
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="max-w-sm"
                    />
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving || !username.trim()}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setUsername(user?.username || '');
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">{username || 'No username set'}</span>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Clerk Account Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage your email, password, and other account settings.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).Clerk) {
                    (window as any).Clerk.openUserProfile();
                  }
                }}
              >
                Open Account Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 