import { useState, useEffect, useRef } from "react";
import { useDocument } from "../../../hooks/useDocument.tsx";

interface TypeEffectProps {
  env: "PRODUCTION" | "SANDBOX";
}

export const useTypingEffect = ({ env }: TypeEffectProps) => {
  const [queryPrompts, setQueryPrompts] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState("");
  const document = useDocument();
  const indexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      const base = env === "PRODUCTION" ? "cdn" : "sbx-cdn";

      const url = `https://${base}.yextapis.com/v2/accounts/me/search/autocomplete?v=20250101&api_key=${document?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY}&sessionTrackingEnabled=false&experienceKey=${document?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY}&input=`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setQueryPrompts(data.response.results.map((i: any) => i.value));
      } catch (err) {
        console.error("TypingEffect fetch failed:", err);
      }
    };

    fetchPrompts();
  }, [env]);

  useEffect(() => {
    if (queryPrompts.length === 0) return;

    const interval = setInterval(() => {
      const currentWord = queryPrompts[indexRef.current];
      if (!currentWord) return;

      if (!isDeletingRef.current) {
        charIndexRef.current++;
        setPlaceholder(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current === currentWord.length) {
          isDeletingRef.current = true;
        }
      } else {
        charIndexRef.current--;
        setPlaceholder(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current === 0) {
          isDeletingRef.current = false;
          indexRef.current = (indexRef.current + 1) % queryPrompts.length;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [queryPrompts]);

  return { placeholder };
};
