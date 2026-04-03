import { useState } from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Link } from "@yext/pages-components";

type ArticleItem = {
  title: string;
  description: string;
  linkLabel: string;
  link: string;
};

export type Hs1LagunaFeaturedArticlesSectionProps = {
  title: string;
  caption: string;
  articles: ArticleItem[];
};

const Hs1LagunaFeaturedArticlesSectionFields: Fields<Hs1LagunaFeaturedArticlesSectionProps> =
  {
    title: { label: "Title", type: "text" },
    caption: { label: "Caption", type: "text" },
    articles: {
      label: "Articles",
      type: "array",
      arrayFields: {
        title: { label: "Title", type: "text" },
        description: { label: "Description", type: "text" },
        linkLabel: { label: "Link Label", type: "text" },
        link: { label: "Link", type: "text" },
      },
      defaultItemProps: {
        title: "Article",
        description: "Description",
        linkLabel: "Read More",
        link: "#",
      },
      getItemSummary: (item: ArticleItem) => item.title,
    },
  };

export const Hs1LagunaFeaturedArticlesSectionComponent: PuckComponent<
  Hs1LagunaFeaturedArticlesSectionProps
> = ({ title, caption, articles }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeArticle = articles[activeIndex] ?? articles[0];

  if (!activeArticle) {
    return <></>;
  }

  return (
    <section className="bg-white px-[14px] py-0 md:px-0">
      <div className="mx-auto max-w-[1140px]">
        <div className="rounded-none bg-white px-[23px] py-[22px] shadow-[0_5px_33px_13px_rgba(0,0,0,0.08)] md:px-10 md:py-[24px]">
          <div className="pb-[12px] text-center">
            <h2 className="m-0 font-['Roboto',Arial,Helvetica,sans-serif] text-[23px] font-bold leading-[1.13] text-[#4f4f4f] md:text-[26px]">
              {title}
            </h2>
            <h3 className="m-0 mt-0.5 font-['Roboto',Arial,Helvetica,sans-serif] text-[18px] italic font-medium leading-[1.222] text-[#8a8a8a]">
              {caption}
            </h3>
          </div>

          <div className="mx-auto max-w-[976px]">
            <article className="bg-white px-[15px] py-[15px] md:px-10 md:py-6">
              <div className="w-full">
                <h4 className="m-0 text-[17px] font-bold leading-[1.176] text-[#4f4f4f] md:text-[20px]">
                  {activeArticle.title}
                </h4>
                <p className="m-0 mt-3 text-[14px] leading-[1.6] text-[#4f4f4f] md:text-[16px]">
                  {activeArticle.description}
                </p>
                <div className="mt-4">
                  <Link
                    cta={{ link: activeArticle.link, linkType: "URL" }}
                    className="inline-flex min-w-[120px] items-center justify-center border border-[#755b53] bg-[#755b53] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#8f4638]"
                  >
                    {activeArticle.linkLabel}
                  </Link>
                </div>
              </div>
            </article>

            {articles.length > 1 ? (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      activeIndex === 0 ? articles.length - 1 : activeIndex - 1,
                    )
                  }
                  className="h-10 w-10 rounded-full border border-[#755b53] text-[#755b53]"
                >
                  ‹
                </button>
                <div className="flex items-center gap-2">
                  {articles.map((article, index) => (
                    <button
                      key={`${article.title}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 w-2.5 rounded-full ${
                        index === activeIndex ? "bg-[#755b53]" : "bg-[#d5b8ae]"
                      }`}
                      aria-label={`Show article ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      activeIndex === articles.length - 1 ? 0 : activeIndex + 1,
                    )
                  }
                  className="h-10 w-10 rounded-full border border-[#755b53] text-[#755b53]"
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Hs1LagunaFeaturedArticlesSection: ComponentConfig<Hs1LagunaFeaturedArticlesSectionProps> =
  {
    label: "Featured Articles",
    fields: Hs1LagunaFeaturedArticlesSectionFields,
    defaultProps: {
      title: "Featured Articles",
      caption: "Read about helpful topics",
      articles: [
        {
          title: "Broken Teeth",
          description:
            "Even though enamel is the hardest substance in the body, teeth aren’t indestructible, and chipped, cracked, and broken teeth are among the most common dental injuries. Tooth fractures might result from accidents, trauma, tooth grinding, chewing hard objects and foods, or extensive decay.",
          linkLabel: "Read More",
          link: "https://www.ofc-laguna.com/articles/premium_education/915096-broken-teeth",
        },
        {
          title: "Apicoectomy",
          description:
            "Root canal therapy is often enough to treat infection in the inner tooth successfully. If pain or inflammation return, however, these symptoms can indicate a new or recurring infection. In such cases, an apicoectomy is a common surgical procedure used to save the tooth and restore the health of the surrounding area.",
          linkLabel: "Read More",
          link: "https://www.ofc-laguna.com/articles/premium_education/915095-apicoectomy",
        },
        {
          title: "Mouthguards",
          description:
            "While you’re living your active life, be sure to protect your smile. A mouthguard is essential safety gear whenever you participate in any sport or activity that could lead to dental trauma. Oral and dental injuries are very common for athletes, and often these injuries can be prevented or reduced with the right protection.",
          linkLabel: "Read More",
          link: "https://www.ofc-laguna.com/articles/premium_education/915085-mouthguards",
        },
      ],
    },
    render: Hs1LagunaFeaturedArticlesSectionComponent,
  };
