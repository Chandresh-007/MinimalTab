import { Github, Mail, MessageSquare, Music, Cloud, HardDrive, Sparkles, Linkedin, FileText, Youtube, Twitter } from "lucide-react";
const ICONS = {
  github: Github,
  mail: Mail,
  chat: MessageSquare,
  music: Music,
  cloud: Cloud,
  drive: HardDrive,
  ai: Sparkles,
  linkedin: Linkedin,
  note: FileText,
  youtube: Youtube,
  twitter: Twitter
};
const DEFAULT_LINKS = [
  { id: "gh", name: "GitHub", url: "https://github.com", icon: "github" },
  { id: "notion", name: "Notion", url: "https://notion.so", icon: "note" },
  { id: "gmail", name: "Gmail", url: "https://mail.google.com", icon: "mail" },
  { id: "aws", name: "AWS Console", url: "https://console.aws.amazon.com", icon: "cloud" },
  { id: "gpt", name: "ChatGPT", url: "https://chat.openai.com", icon: "ai" },
  { id: "spotify", name: "Spotify", url: "https://open.spotify.com", icon: "music" },
  { id: "discord", name: "Discord", url: "https://discord.com/app", icon: "chat" },
  { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
  { id: "drive", name: "Google Drive", url: "https://drive.google.com", icon: "drive" },
  { id: "yt", name: "YouTube", url: "https://youtube.com", icon: "youtube" }
];
export {
  DEFAULT_LINKS,
  ICONS
};
