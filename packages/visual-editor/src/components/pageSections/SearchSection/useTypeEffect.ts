import { useState, useEffect, useRef } from "react";

interface TypeEffectProps {
  env: "PRODUCTION" | "SANDBOX";
}

export const useTypingEffect = ({ env }: TypeEffectProps) => {
  const [queryPrompts, setQueryPrompts] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState("");

  const indexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // Fetch prompts
  const fetchPrompts = async () => {
    const base = env === "PRODUCTION" ? "cdn" : "sbx-cdn";

    const url = `https://${base}.yextapis.com/v2/accounts/me/search/autocomplete?v=20190101&api_key=fb73f1bf6a262bc3255bcb938088204f&sessionTrackingEnabled=false&experienceKey=ukg-fins-rk-test-dont-touch&input=`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const prompts = data.response.results.map((item: any) => item.value);

      setQueryPrompts(prompts);
    } catch (err) {
      console.error("TypingEffect fetch failed:", err);
    }
  };

  // Typing loop
  const runTyping = () => {
    const currentWord = queryPrompts[indexRef.current];

    if (!currentWord) return;

    if (!isDeletingRef.current) {
      // typing forward
      charIndexRef.current++;
      setPlaceholder(currentWord.slice(0, charIndexRef.current));

      if (charIndexRef.current === currentWord.length) {
        isDeletingRef.current = true;
        timerRef.current = window.setTimeout(runTyping, 1500);
        return;
      }
    } else {
      // deleting backward
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

  // Fetch once
  useEffect(() => {
    fetchPrompts();
  }, [env]);

  // Start typing when prompts loaded
  useEffect(() => {
    if (queryPrompts.length > 0) {
      runTyping();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [queryPrompts]);

  return {
    placeholder,
    queryPrompts,
  };
};
