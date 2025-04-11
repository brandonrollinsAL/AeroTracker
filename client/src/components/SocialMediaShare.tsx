import React from 'react';
import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Linkedin, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaShareProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  showText?: boolean;
}

export function SocialMediaShare({ 
  url = window.location.href,
  title = 'AeroTracker - Advanced Flight Tracking Platform',
  description = 'Real-time flight tracking with advanced analytics and route optimization.',
  className = '',
  showText = false
}: SocialMediaShareProps) {
  const { toast } = useToast();
  
  const shareData = {
    url,
    title,
    text: description
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'Link Copied',
        description: 'The link has been copied to your clipboard.'
      });
    }).catch(err => {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy the link to clipboard.',
        variant: 'destructive'
      });
      console.error('Could not copy text: ', err);
    });
  };
  
  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          console.log('Successfully shared');
        })
        .catch((error) => {
          console.error('Error sharing:', error);
        });
    } else {
      handleCopyLink();
    }
  };
  
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };
  
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };
  
  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank');
  };
  
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-twitter hover:text-twitter/90 hover:bg-twitter/10"
        onClick={handleTwitterShare}
      >
        <Twitter size={16} />
        {showText && <span>Tweet</span>}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-facebook hover:text-facebook/90 hover:bg-facebook/10"
        onClick={handleFacebookShare}
      >
        <Facebook size={16} />
        {showText && <span>Share</span>}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-linkedin hover:text-linkedin/90 hover:bg-linkedin/10"
        onClick={handleLinkedInShare}
      >
        <Linkedin size={16} />
        {showText && <span>Post</span>}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleNativeShare}
      >
        <Share2 size={16} />
        {showText && <span>Share</span>}
      </Button>
    </div>
  );
}

export default SocialMediaShare;