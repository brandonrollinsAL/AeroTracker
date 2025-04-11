import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { supportedLanguages } from '@/i18n';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Convert supported languages object to array for easier filtering
  const languageArray = Object.entries(supportedLanguages).map(([code, details]) => ({
    code,
    name: details.name,
    flag: details.flag,
    dir: details.dir,
  }));
  
  const currentLanguage = languageArray.find(lang => lang.code === i18n.language) || languageArray[0];
  
  // Filter languages based on search query
  const filteredLanguages = searchQuery 
    ? languageArray.filter(lang => 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : languageArray;
  
  // Separate common languages and other languages for better UX
  const commonLanguages = ['en', 'fr', 'es', 'zh', 'ar'];
  const priorityLanguages = filteredLanguages.filter(lang => commonLanguages.includes(lang.code));
  const otherLanguages = filteredLanguages.filter(lang => !commonLanguages.includes(lang.code));
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Save the language preference to both localStorage and cookie for better persistence
    localStorage.setItem('i18nextLng', languageCode);
    document.cookie = `i18next=${languageCode}; path=/; max-age=${60*60*24*365}; SameSite=Lax`;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 rounded-full relative hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={t('common.selectLanguage')}
        >
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="absolute -bottom-1 -right-1 text-[10px]">
            {currentLanguage.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center space-x-2 p-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('common.searchLanguage', 'Search language...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-auto py-1">
          {/* Commonly used languages first */}
          {priorityLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className={`flex items-center space-x-2 cursor-pointer ${
                currentLanguage.code === language.code 
                  ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' 
                  : ''
              }`}
              onClick={() => changeLanguage(language.code)}
              dir={language.dir}
            >
              <span className="text-base mr-2">{language.flag}</span>
              <span>{language.name}</span>
              {language.dir === 'rtl' && (
                <span className="text-xs text-muted-foreground ml-auto">(RTL)</span>
              )}
            </DropdownMenuItem>
          ))}
          
          {/* Separator between common and other languages */}
          {otherLanguages.length > 0 && priorityLanguages.length > 0 && (
            <DropdownMenuSeparator />
          )}
          
          {/* Other languages */}
          {otherLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className={`flex items-center space-x-2 cursor-pointer ${
                currentLanguage.code === language.code 
                  ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' 
                  : ''
              }`}
              onClick={() => changeLanguage(language.code)}
              dir={language.dir}
            >
              <span className="text-base mr-2">{language.flag}</span>
              <span>{language.name}</span>
              {language.dir === 'rtl' && (
                <span className="text-xs text-muted-foreground ml-auto">(RTL)</span>
              )}
            </DropdownMenuItem>
          ))}
          
          {/* No results message */}
          {filteredLanguages.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {t('common.noLanguagesFound', 'No languages found')}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}