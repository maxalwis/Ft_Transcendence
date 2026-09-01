import '../../map/Map.module.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FriendAction } from './Friends';

type FriendsButtonProps = {
  setAction: React.Dispatch<React.SetStateAction<FriendAction>>;
};

export default function FriendsButton({ setAction }: FriendsButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? t('friendsButton.ariaClose') : t('friendsButton.ariaOpen')}
        className="glass-panel flex p-0! shrink-0 items-center justify-center rounded-2xl text-gray-600 hover:text-white cursor-pointer duration-150 active:scale-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-4 h-4 stroke-current"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            /* Minus Icon */
            <path d="M5 12h14" />
          ) : (
            /* Plus Icon */
            <path d="M12 5v14M5 12h14" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="flex flex-col glass-panel p-2 gap-2 text-sm">
          <button
            type="button"
            className="border-2 rounded-xl hover:text-white cursor-pointer duration-150"
            onClick={() => setAction('default')}
          >
            {t('friendsButton.search')}
          </button>
          <button
            type="button"
            className="border-orange-600 px-3 border-2 rounded-xl hover:bg-orange-600 hover:text-white cursor-pointer duration-150"
            onClick={() => setAction('request')}
          >
            {t('friendsButton.pendingRequest')}
          </button>
          <button
            type="button"
            className="border-green-600 border-2 rounded-xl hover:bg-green-600 hover:text-white cursor-pointer duration-150"
            onClick={() => setAction('add')}
          >
            {t('friendsButton.addFriend')}
          </button>
          <button
            type="button"
            className="border-red-600 border-2 rounded-xl hover:bg-red-600 hover:text-white cursor-pointer duration-150"
            onClick={() => setAction('remove')}
          >
            {t('friendsButton.removeFriend')}
          </button>
        </div>
      )}
    </>
  );
}