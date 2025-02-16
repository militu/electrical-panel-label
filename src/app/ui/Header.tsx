import Nav from "@/app/ui/Nav";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("Header");

  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-3 md:p-6 space-y-4 md:space-y-0">
      <div className="title text-2xl md:text-4xl font-black bg-gradient bg-clip-text text-transparent bg-cover bg-center transition-all leading-none uppercase tracking-tighter">
        {t("title")}
      </div>
      <div className="flex items-center gap-4">
        <Nav />
      </div>
    </header>
  );
}
