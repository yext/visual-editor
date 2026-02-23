import { useState, useEffect, useRef } from "react";
import { Environment } from "@yext/search-headless-react";

interface TypingEffectConfig {
  apiKey?: string;
  experienceKey?: string;
  environment: Environment;
}

export const useTypingEffect = ({
  apiKey,
  experienceKey,
  environment,
}: TypingEffectConfig) => {
  const [queryPrompts, setQueryPrompts] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState("");

  const indexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!apiKey || !experienceKey) return;

    const base = environment === Environment.PROD ? "cdn" : "sbx-cdn";

    const url = `https://${base}.yextapis.com/v2/accounts/me/search/autocomplete?v=20190101&api_key=${apiKey}&sessionTrackingEnabled=false&experienceKey=${experienceKey}&input=`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const prompts =
          data?.response?.results?.map((item: any) => item.value) ?? [];
        setQueryPrompts(prompts);
      })
      .catch((err) => console.error("TypingEffect fetch failed:", err));
  }, [apiKey, experienceKey, environment]);

  useEffect(() => {
    if (queryPrompts.length === 0) return;

    const runTyping = () => {
      const currentWord = queryPrompts[indexRef.current];
      if (!currentWord) return;

      if (!isDeletingRef.current) {
        charIndexRef.current++;
        setPlaceholder(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current === currentWord.length) {
          isDeletingRef.current = true;
          timerRef.current = window.setTimeout(runTyping, 1500);
          return;
        }
      } else {
        charIndexRef.current--;
        setPlaceholder(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current === 0) {
          isDeletingRef.current = false;
          indexRef.current = (indexRef.current + 1) % queryPrompts.length;
        }
      }

      timerRef.current = window.setTimeout(
        runTyping,
        isDeletingRef.current ? 50 : 100
      );
    };

    runTyping();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [queryPrompts]);

  return { placeholder };
};
