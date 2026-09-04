"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import { profileConfig, SocialLink } from "@/config/profile";

// Crisp official brand SVG icons
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.915z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const iconComponentMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GitHubIcon,
  telegram: TelegramIcon,
  facebook: FacebookIcon,
  mail: MailIcon,
  globe: Globe,
};

export function SocialLinks() {
  const { socialLinks } = profileConfig;

  return (
    <div className="w-full space-y-3 mb-6">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Connect & Channels
        </span>
        <span className="text-[11px] font-mono text-gray-500">
          {socialLinks.length} Links
        </span>
      </div>

      {socialLinks.map((link: SocialLink, index: number) => {
        const IconComponent = iconComponentMap[link.icon] || Globe;

        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
            className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/10 group-hover:scale-105 transition-transform"
                style={{ color: link.color || "#00F0FF" }}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950/70 border border-cyan-800/40 text-cyan-300">
                      {link.badge}
                    </span>
                  )}
                </div>
                {link.username && (
                  <p className="text-xs font-mono text-gray-400">
                    {link.username}
                  </p>
                )}
              </div>
            </div>

            <div className="p-1.5 rounded-lg text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all">
              <ExternalLink className="w-4 h-4" />
            </div>
          </motion.a>
        );
      })}
    </div>
  );
}
