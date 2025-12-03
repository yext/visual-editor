import { Migration } from "../../utils/migrate";

export const reviewsSectionSlots: Migration = {
  ReviewsSection: {
    action: "updated",
    propTransformation: (props) => {
      // Old structure had backgroundColor at the top level
      // Now it's nested under styles
      const backgroundColor =
        props.backgroundColor || props.styles?.backgroundColor;

      return {
        id: props.id,
        analytics: props.analytics || {
          scope: "reviewsSection",
        },
        liveVisibility: props.liveVisibility ?? true,
        styles: {
          backgroundColor,
        },
        slots: {
          SectionHeadingSlot: [
            {
              type: "HeadingTextSlot",
              props: {
                id: `${props.id}-SectionHeadingSlot`,
                data: {
                  text: {
                    field: "",
                    constantValueEnabled: true,
                    constantValue: {
                      cs: "Nedávné recenze",
                      da: "Nylige anmeldelser",
                      de: "Neuere Bewertungen",
                      en: "Recent Reviews",
                      "en-GB": "Recent Reviews",
                      es: "Revisiones recientes",
                      et: "Viimased ülevaated",
                      fi: "Viimeaikaiset arvostelut",
                      fr: "Revues récentes",
                      hr: "Nedavne recenzije",
                      hu: "Legutóbbi vélemények",
                      it: "Recensioni recenti",
                      ja: "最近のレビュー",
                      lt: "Naujausios apžvalgos",
                      lv: "Nesenie pārskati",
                      nb: "Nyere anmeldelser",
                      nl: "Recente beoordelingen",
                      pl: "Ostatnie recenzje",
                      pt: "Revisões recentes",
                      ro: "Recenzii recente",
                      sk: "Posledné recenzie",
                      sv: "Senaste recensioner",
                      tr: "Son İncelemeler",
                      zh: "最近的评论",
                      "zh-TW": "最近的評論",
                      hasLocalizedValue: "true",
                    },
                  },
                },
                styles: { level: 3, align: "center" },
              },
            },
          ],
        },
      };
    },
  },
};
