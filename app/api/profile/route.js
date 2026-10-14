import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/data.js';

export const revalidate = 60;

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({
    profile: {
      name: profile.name,
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      location: profile.location,
      status: profile.status,
      avatarUrl: profile.avatarUrl,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      twitterUrl: profile.twitterUrl,
      websiteUrl: profile.websiteUrl,
    },
  });
}
