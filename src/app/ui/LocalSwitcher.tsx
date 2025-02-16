"use client";

import {
  Locale,
  localeFlags,
  localeNames,
  locales,
} from "@/app/config/locales";
import { Button } from "@/app/ui/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/app/ui/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui/shadcn/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useCallback, useTransition } from "react";

const LocaleSwitcher: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const activeLocale = useLocale() as Locale;
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("LocaleSwitcher");

  const onSelectChange = useCallback(
    (nextLocale: Locale) => {
      startTransition(() => {
        router.replace(`/${nextLocale}`);
        setOpen(false);
      });
    },
    [router]
  );

  if (!Array.isArray(locales)) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={isPending}
        >
          {localeFlags[activeLocale]} {localeNames[activeLocale]}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandEmpty>{t("noLanguageFound")}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {locales.map((locale) => (
                <CommandItem
                  key={locale}
                  value={locale}
                  onSelect={() => onSelectChange(locale)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      locale === activeLocale ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {localeFlags[locale]} {localeNames[locale]}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(LocaleSwitcher);
