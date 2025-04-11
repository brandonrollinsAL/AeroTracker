import React from 'react';
import { Button } from './ui/button';
import { FaTwitter, FaFacebook, FaLinkedin, FaPinterest, FaReddit, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

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
  description = 'Real-time flight tracking with advanced analytics and route optimization',
  className = '',
  showText = true
}: SocialMediaShareProps) {
  // Define social media share URLs
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // Social media share links
  const socialLinks = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <FaTwitter className="h-4 w-4" />,
      color: 'bg-twitter hover:bg-twitter/90'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FaFacebook className="h-4 w-4" />,
      color: 'bg-facebook hover:bg-facebook/90'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <FaLinkedin className="h-4 w-4" />,
      color: 'bg-linkedin hover:bg-linkedin/90'
    },
    {
      name: 'Pinterest',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
      icon: <FaPinterest className="h-4 w-4" />,
      color: 'bg-pinterest hover:bg-pinterest/90'
    },
    {
      name: 'Reddit',
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: <FaReddit className="h-4 w-4" />,
      color: 'bg-[#FF4500] hover:bg-[#FF4500]/90'
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <FaWhatsapp className="h-4 w-4" />,
      color: 'bg-[#25D366] hover:bg-[#25D366]/90'
    },
    {
      name: 'Email',
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      icon: <FaEnvelope className="h-4 w-4" />,
      color: 'bg-gray-600 hover:bg-gray-600/90'
    }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {socialLinks.map((social) => (
        <Button
          key={social.name}
          variant="default"
          size="sm"
          className={`${social.color} flex items-center gap-2`}
          onClick={() => window.open(social.url, '_blank')}
          aria-label={`Share on ${social.name}`}
        >
          {social.icon}
          {showText && <span>{social.name}</span>}
        </Button>
      ))}
    </div>
  );
}

export default SocialMediaShare;