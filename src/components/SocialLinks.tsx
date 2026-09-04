"use client";

import React from "react";
import { profileConfig, PortLink } from "@/config/profile";

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GitHubIcon,
  telegram: TelegramIcon,
  facebook: FacebookIcon,
  mail: MailIcon,
};

export function SocialLinks() {
  const { portLinks } = profileConfig;

  return (
    <div className="w-full mb-6">
      {/* Section Machine Label */}
      <div className="flex items-center justify-between border-b border-chassis-border pb-2 mb-2 text-[10px] font-mono text-industrial-zinc">
        <span className="font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-chassis-border inline-block" />
          COMMUNICATION INTERCONNECTS // PATCHBAY
        </span>
        <span>4 ACTIVE PORTS</span>
      </div>

      {/* Port Rows */}
      <div className="space-y-1.5">
        {portLinks.map((port: PortLink) => {
          const Icon = iconMap[port.icon] || MailIcon;

          return (
            <a
              key={port.id}
              href={port.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile group flex items-center justify-between p-3 rounded bg-chassis-module border border-chassis-border hover:border-chassis-highlight text-left transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Port Number indicator */}
                <span className="font-mono text-xs font-bold text-industrial-zinc group-hover:text-industrial-orange transition-colors">
                  [{port.portNumber}]
                </span>

                <div className="p-1.5 rounded bg-chassis-inset border border-chassis-border/80 text-industrial-paper group-hover:text-industrial-orange transition-colors">
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-industrial-paper group-hover:text-white transition-colors">
                    {port.label}
                  </div>
                  <div className="text-[10px] font-mono text-industrial-zinc">
                    {port.targetHandle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[9px] font-mono text-industrial-zinc px-1.5 py-0.5 rounded bg-chassis-inset border border-chassis-border/60">
                  {port.protocol}
                </span>
                <span className="text-xs font-mono text-chassis-border group-hover:text-industrial-orange transition-colors">
                  →
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
