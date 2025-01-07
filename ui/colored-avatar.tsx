import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { stringToColor, getInitials } from '@/lib/utils'

interface ColoredAvatarProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg'
}

export function ColoredAvatar({ name, imageUrl, size = 'md' }: ColoredAvatarProps) {
  const backgroundColor = stringToColor(name)
  
  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={imageUrl} />
      <AvatarFallback 
        style={{ 
          backgroundColor,
          color: 'white',
          fontWeight: 500
        }}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
} 