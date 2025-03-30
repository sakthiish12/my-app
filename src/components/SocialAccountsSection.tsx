'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SocialAccount {
  platform: string;
  username: string;
  accountId?: string;
  followers?: number;
  followersData?: any;
  lastUpdated?: Date;
}

interface Props {
  accounts: SocialAccount[];
}

export default function SocialAccountsSection({ accounts }: Props) {
  const [isRemoving, setIsRemoving] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleRemoveAccount = async (platform: string, username: string) => {
    try {
      setIsRemoving(`${platform}-${username}`);
      setError('');

      const response = await fetch('/api/social/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove account');
      }

      // Refresh the page to show updated list
      window.location.reload();

    } catch (err: any) {
      setError(err.message || 'Failed to remove account');
    } finally {
      setIsRemoving('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Social Media Accounts</h2>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {accounts && accounts.length > 0 ? (
        <ul className="space-y-2">
          {accounts.map((account, index) => (
            <li key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <span className="font-medium text-gray-900 capitalize">{account.platform}</span>
                <span className="text-gray-700 ml-2">@{account.username}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {account.followers?.toLocaleString()} followers
                </span>
                <button
                  onClick={() => handleRemoveAccount(account.platform, account.username)}
                  disabled={isRemoving === `${account.platform}-${account.username}`}
                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove account"
                >
                  {isRemoving === `${account.platform}-${account.username}` ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-800">No social accounts connected yet.</p>
      )}
      <div className="mt-4 space-y-2">
        <Link
          href="/dashboard/linkedin"
          className="text-purple-700 hover:text-purple-900 text-sm font-medium block"
        >
          + Add LinkedIn Account
        </Link>
        <Link
          href="/dashboard/instagram"
          className="text-purple-700 hover:text-purple-900 text-sm font-medium block"
        >
          + Add Instagram Account
        </Link>
        <Link
          href="/dashboard/tiktok"
          className="text-purple-700 hover:text-purple-900 text-sm font-medium block"
        >
          + Add TikTok Account
        </Link>
      </div>
    </div>
  );
} 