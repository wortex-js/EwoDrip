import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="relative"
      title={language === 'en' ? 'Switch to Turkish' : 'İngilizce\'ye geç'}
    >
      <Globe className="h-5 w-5" />
      <span className="absolute bottom-0 right-0 text-[10px] font-bold">
        {language.toUpperCase()}
      </span>
    </Button>
  );
}
