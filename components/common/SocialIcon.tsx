import React from 'react';
import {
  Linkedin,
  Github,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MessageCircle,
  Globe,
  Link as LinkIcon,
  Share2,
} from 'lucide-react';

interface SocialIconProps {
  platform: string;
  iconName?: string;
  className?: string;
  size?: number;
}

export function SocialIcon({ platform, iconName, className = 'w-5 h-5', size }: SocialIconProps) {
  const norm = (platform || '').toLowerCase().trim();
  const icon = (iconName || '').toLowerCase().trim();

  // Custom X (Twitter) SVG for authentic official brand if preferred, or Lucide Twitter
  if (norm === 'twitter' || norm === 'x' || icon === 'twitter' || icon === 'x') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size || 20}
        height={size || 20}
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (norm === 'linkedin' || icon === 'linkedin') {
    return <Linkedin className={className} size={size} />;
  }
  if (norm === 'github' || icon === 'github') {
    return <Github className={className} size={size} />;
  }
  if (norm === 'email' || norm === 'mail' || icon === 'mail') {
    return <Mail className={className} size={size} />;
  }
  if (norm === 'instagram' || icon === 'instagram') {
    return <Instagram className={className} size={size} />;
  }
  if (norm === 'facebook' || icon === 'facebook') {
    return <Facebook className={className} size={size} />;
  }
  if (norm === 'youtube' || icon === 'youtube') {
    return <Youtube className={className} size={size} />;
  }
  if (norm === 'whatsapp' || icon === 'messagecircle' || icon === 'whatsapp') {
    return <MessageCircle className={className} size={size} />;
  }
  if (norm === 'website' || norm === 'globe' || icon === 'globe') {
    return <Globe className={className} size={size} />;
  }

  return <LinkIcon className={className} size={size} />;
}

export function getPlatformBadgeStyle(platform: string): { bg: string; text: string; border: string; glow: string } {
  const norm = (platform || '').toLowerCase().trim();
  switch (norm) {
    case 'linkedin':
      return {
        bg: 'bg-blue-500/10 text-blue-400',
        text: 'text-blue-400',
        border: 'border-blue-500/30 hover:border-blue-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]',
      };
    case 'github':
      return {
        bg: 'bg-zinc-700/20 text-zinc-200',
        text: 'text-zinc-200',
        border: 'border-zinc-700/50 hover:border-zinc-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]',
      };
    case 'email':
      return {
        bg: 'bg-rose-500/10 text-rose-400',
        text: 'text-rose-400',
        border: 'border-rose-500/30 hover:border-rose-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.35)]',
      };
    case 'instagram':
      return {
        bg: 'bg-pink-500/10 text-pink-400',
        text: 'text-pink-400',
        border: 'border-pink-500/30 hover:border-pink-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(236,72,153,0.35)]',
      };
    case 'whatsapp':
      return {
        bg: 'bg-emerald-500/10 text-emerald-400',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30 hover:border-emerald-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]',
      };
    case 'youtube':
      return {
        bg: 'bg-red-500/10 text-red-400',
        text: 'text-red-400',
        border: 'border-red-500/30 hover:border-red-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]',
      };
    case 'facebook':
      return {
        bg: 'bg-sky-500/10 text-sky-400',
        text: 'text-sky-400',
        border: 'border-sky-500/30 hover:border-sky-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(14,165,233,0.35)]',
      };
    case 'twitter':
    case 'x':
      return {
        bg: 'bg-zinc-800/40 text-zinc-100',
        text: 'text-zinc-100',
        border: 'border-zinc-700/60 hover:border-zinc-300',
        glow: 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]',
      };
    case 'website':
      return {
        bg: 'bg-teal-500/10 text-teal-400',
        text: 'text-teal-400',
        border: 'border-teal-500/30 hover:border-teal-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(20,184,166,0.35)]',
      };
    default:
      return {
        bg: 'bg-purple-500/10 text-purple-400',
        text: 'text-purple-400',
        border: 'border-purple-500/30 hover:border-purple-400',
        glow: 'group-hover:shadow-[0_0_15px_rgba(168,85,247,0.35)]',
      };
  }
}
