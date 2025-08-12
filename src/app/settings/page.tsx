
'use client';

import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useState } from 'react';
import { Sun, Moon, Laptop, Palette, Type } from 'lucide-react';

const colorPalettes = [
  { name: 'Green', value: 'theme-green', color: 'bg-green-500' },
  { name: 'Brownish', value: 'theme-brown', color: 'bg-yellow-700' },
  { name: 'Blue', value: 'theme-blue', color: 'bg-blue-500' },
  { name: 'Lavender', value: 'theme-lavender', color: 'bg-purple-500' },
];

export default function SettingsPage() {
  const { theme: mode, setTheme: setMode } = useTheme();
  const { 
    language, setLanguage, 
    t, 
    colorTheme, setColorTheme, 
    bengaliFont, setBengaliFont 
  } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">{t('settingsTitle')}</CardTitle>
          <CardDescription>{t('appName')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t('colorPalette')}
            </h3>
            <RadioGroup
              value={colorTheme}
              onValueChange={(value) => setColorTheme(value as any)}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {colorPalettes.map((palette) => (
                 <Label
                    key={palette.value}
                    htmlFor={palette.value}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                    <RadioGroupItem value={palette.value} id={palette.value} className="sr-only" />
                    <div className={`h-6 w-6 rounded-full ${palette.color} mb-2 border`}></div>
                    {t(palette.name.toLowerCase() as any)}
                 </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline flex items-center gap-2">
                <Sun className="h-5 w-5" /> / <Moon className="h-5 w-5" />
                {t('theme')}
            </h3>
            <RadioGroup
              value={mode}
              onValueChange={setMode}
              className="grid grid-cols-3 gap-4"
            >
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="h-6 w-6 mb-2" />
                {t('lightMode')}
              </Label>
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="h-6 w-6 mb-2" />
                {t('darkMode')}
              </Label>
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <Laptop className="h-6 w-6 mb-2" />
                {t('systemTheme')}
              </Label>
            </RadioGroup>
          </div>
          
           <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline flex items-center gap-2">
                <Type className="h-5 w-5" />
                {t('bengaliFont')}
            </h3>
            <RadioGroup
              value={bengaliFont}
              onValueChange={(value) => setBengaliFont(value as any)}
              className="rounded-lg border p-4 grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="font-hind-siliguri"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
              >
                <RadioGroupItem value="font-hind-siliguri" id="font-hind-siliguri" />
                <span>{t('hindSiliguri')}</span>
              </Label>
               <Label
                htmlFor="font-solaimanlipi"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
              >
                <RadioGroupItem value="font-solaimanlipi" id="font-solaimanlipi" />
                <span>{t('solaimanLipi')}</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold font-headline">{t('language')}</h3>
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as 'en' | 'bn')}
              className="rounded-lg border p-4 grid grid-cols-2 gap-4"
            >
              <Label
                htmlFor="bn"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
              >
                <RadioGroupItem value="bn" id="bn" />
                <Label htmlFor="bn" className="text-base">{t('bengali')}</Label>
              </Label>
              <Label
                htmlFor="en"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
              >
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="text-base">{t('english')}</Label>
              </Label>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
