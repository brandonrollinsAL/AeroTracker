import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳'
  }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Save the language preference to localStorage
    localStorage.setItem('i18nextLng', languageCode);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 rounded-full relative hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="absolute -bottom-1 -right-1 text-[10px]">
            {currentLanguage.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`flex items-center space-x-2 cursor-pointer ${
              currentLanguage.code === language.code 
                ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' 
                : ''
            }`}
            onClick={() => changeLanguage(language.code)}
          >
            <span className="text-base mr-2">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}