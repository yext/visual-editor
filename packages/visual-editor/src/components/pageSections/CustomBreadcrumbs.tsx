import React from "react";
import { WithPuckProps } from "@puckeditor/core";
import { BackgroundStyle } from "../../utils/themeConfigOptions.ts";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { PageSection } from "../atoms/pageSection.tsx";
export interface BreadcrumbItem {
  id: string;
  name: string;
  slug: string[];
}

export interface CustomBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];

  onNavigate: (index: number) => void;

  styles?: {
    backgroundColor?: BackgroundStyle;
  };
}

export const CustomBreadcrumbs = ({
  breadcrumbs,
  onNavigate,
  styles,
  puck,
}: WithPuckProps<CustomBreadcrumbsProps>) => {
  const separator = "/";

  if (!breadcrumbs?.length) {
    return <PageSection />;
  }

  return (
    <PageSection
      as="nav"
      verticalPadding="sm"
      aria-label="Breadcrumb"
      background={styles?.backgroundColor}
    >
      <ol className="inline p-0 m-0 list-none">
        {breadcrumbs.map((crumb, index) => {
          const isRoot = index === 0;
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li
              key={crumb.id}
              className="contents whitespace-normal break-words"
            >
              {!isRoot && (
                <span className="mx-2" aria-hidden>
                  {separator}
                </span>
              )}

              <wbr />

              {!isLast ? (
                <span
                  onClick={(e) => {
                    if (puck?.isEditing) return;

                    e.preventDefault();

                    onNavigate(index);
                  }}
                >
                  <MaybeLink
                    href="#"
                    eventName={`breadcrumb${index}`}
                    className="inline text-body-sm-fontSize font-link-fontWeight font-link-fontFamily whitespace-normal break-words"
                    alwaysHideCaret
                    disabled={puck?.isEditing}
                  >
                    {crumb.name}
                  </MaybeLink>
                </span>
              ) : (
                <span className="inline text-body-sm-fontSize font-link-fontWeight font-link-fontFamily whitespace-normal break-words text-gray-700">
                  {crumb.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </PageSection>
  );
};
