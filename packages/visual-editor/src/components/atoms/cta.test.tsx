import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTA, CTAProps } from "./cta";
import * as React from "react";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

vi.mock("@yext/visual-editor", () => ({
  themeManagerCn: (...args: any[]) => args.filter(Boolean).join(" "),
  useDocument: vi.fn(() => ({})),
}));

vi.mock("@yext/pages-components", () => ({
  Link: ({ children, cta, ...props }: any) => (
    <a href={cta.link} {...props}>
      {children}
    </a>
  ),
  getDirections: vi.fn((address, listings, searchQuery, options, coordinate) => {
    if (listings) return "https://maps.google.com/?listings=true";
    if (coordinate) return "https://maps.google.com/?coordinate=true";
    return "https://maps.google.com/?default=true";
  }),
}));

vi.mock("./button", () => ({
  Button: ({ children, className, asChild, variant }: any) => (
    <div className={className} data-variant={variant} data-as-child={asChild}>
      {children}
    </div>
  ),
}));

vi.mock("react-icons/fa", () => ({
  FaAngleRight: ({ className, style }: any) => (
    <span className={className} style={style} data-testid="caret">
      &gt;
    </span>
  ),
}));

describe("CTA Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("textAndLink ctaType", () => {
    it("renders basic text and link CTA", () => {
      const props: CTAProps = {
        label: "Learn More",
        link: "https://example.com",
        ctaType: "textAndLink",
        variant: "primary",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveTextContent("Learn More");
    });

    it("uses default URL linkType for textAndLink", () => {
      const props: CTAProps = {
        label: "Click Here",
        link: "https://example.com",
        ctaType: "textAndLink",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("shows caret for link variant when linkType is not EMAIL or PHONE", () => {
      const props: CTAProps = {
        label: "Learn More",
        link: "https://example.com",
        ctaType: "textAndLink",
        variant: "link",
        linkType: "URL",
      };

      render(<CTA {...props} />);

      const caret = screen.getByTestId("caret");
      expect(caret).toHaveStyle({ display: "inline-block" });
    });

    it("hides caret for EMAIL linkType", () => {
      const props: CTAProps = {
        label: "Email Us",
        link: "mailto:test@example.com",
        ctaType: "textAndLink",
        variant: "link",
        linkType: "EMAIL",
      };

      render(<CTA {...props} />);

      const caret = screen.getByTestId("caret");
      expect(caret).toHaveStyle({ display: "none" });
    });

    it("hides caret for PHONE linkType", () => {
      const props: CTAProps = {
        label: "Call Us",
        link: "tel:+1234567890",
        ctaType: "textAndLink",
        variant: "link",
        linkType: "PHONE",
      };

      render(<CTA {...props} />);

      const caret = screen.getByTestId("caret");
      expect(caret).toHaveStyle({ display: "none" });
    });

    it("hides caret when alwaysHideCaret is true", () => {
      const props: CTAProps = {
        label: "Learn More",
        link: "https://example.com",
        ctaType: "textAndLink",
        variant: "link",
        alwaysHideCaret: true,
      };

      render(<CTA {...props} />);

      const caret = screen.getByTestId("caret");
      expect(caret).toHaveStyle({ display: "none" });
    });

    it("applies custom className", () => {
      const props: CTAProps = {
        label: "Custom CTA",
        link: "https://example.com",
        ctaType: "textAndLink",
        className: "custom-class",
      };

      const { container } = render(<CTA {...props} />);

      const button = container.querySelector('[data-as-child="true"]');
      expect(button?.className).toContain("custom-class");
    });

    it("uses custom ariaLabel when provided", () => {
      const props: CTAProps = {
        label: "Click",
        link: "https://example.com",
        ctaType: "textAndLink",
        ariaLabel: "Custom aria label",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-label", "Custom aria label");
    });

    it("sets target attribute", () => {
      const props: CTAProps = {
        label: "External Link",
        link: "https://example.com",
        ctaType: "textAndLink",
        target: "_blank",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("getDirections ctaType", () => {
    it("uses ref_listings when available", async () => {
      const { useDocument } = await import("@yext/visual-editor");
      const { getDirections } = await import("@yext/pages-components");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props: CTAProps = {
        label: "Get Directions",
        ctaType: "getDirections",
      };

      render(<CTA {...props} />);

      expect(getDirections).toHaveBeenCalledWith(
        undefined,
        "listing-123",
        undefined,
        { provider: "google" },
        undefined
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://maps.google.com/?listings=true");
    });

    it("falls back to # when ref_listings is not available", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({});

      const props: CTAProps = {
        label: "Get Directions",
        ctaType: "getDirections",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "#");
    });

    it("uses custom link when provided", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props: CTAProps = {
        label: "Get Directions",
        ctaType: "getDirections",
        link: "https://custom-directions.com",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://custom-directions.com");
    });

    it("uses default label when not provided", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props: CTAProps = {
        label: "",
        ctaType: "getDirections",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("Get Directions");
    });

    it("sets DRIVING_DIRECTIONS linkType", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props: CTAProps = {
        label: "Get Directions",
        ctaType: "getDirections",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href");
    });

    it("uses default ariaLabel for getDirections", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props: CTAProps = {
        label: "",
        ctaType: "getDirections",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-label", "Get Directions");
    });
  });

  describe("presetImage ctaType", () => {
    it("renders preset image with app-store type", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        presetImageType: "app-store",
        link: "https://apps.apple.com",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://apps.apple.com");
    });

    it("renders preset image with google-play type", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        presetImageType: "google-play",
        link: "https://play.google.com",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://play.google.com");
    });

    it("renders preset image with uber-eats type and special styling", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        presetImageType: "uber-eats",
        link: "https://ubereats.com",
      };

      const { container } = render(<CTA {...props} />);

      const button = container.querySelector('[data-as-child="true"]');
      expect(button?.className).toContain("!w-auto");
    });

    it("returns null when presetImageType is not provided", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        link: "https://example.com",
      };

      const { container } = render(<CTA {...props} />);

      expect(container.firstChild).toBeNull();
    });

    it("uses link variant for preset images", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        presetImageType: "app-store",
        link: "https://apps.apple.com",
        variant: "primary",
      };

      const { container } = render(<CTA {...props} />);

      const button = container.querySelector('[data-variant="link"]');
      expect(button).toBeInTheDocument();
    });

    it("applies preset image className", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        presetImageType: "app-store",
        link: "https://apps.apple.com",
      };

      const { container } = render(<CTA {...props} />);

      const button = container.querySelector('[data-as-child="true"]');
      expect(button?.className).toContain("w-fit");
      expect(button?.className).toContain("h-[51px]");
    });

    it("does not render caret for preset images", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        presetImageType: "app-store",
        link: "https://apps.apple.com",
      };

      render(<CTA {...props} />);

      const caret = screen.queryByTestId("caret");
      expect(caret).not.toBeInTheDocument();
    });

    it("uses default ariaLabel with presetImageType", () => {
      const props: CTAProps = {
        label: "",
        ctaType: "presetImage",
        presetImageType: "galaxy-store",
        link: "https://galaxy.store",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-label", "Button with galaxy-store icon");
    });
  });

  describe("edge cases", () => {
    it("handles missing link gracefully with fallback to #", () => {
      const props: CTAProps = {
        label: "No Link",
        ctaType: "textAndLink",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "#");
    });

    it("handles directoryLink variant caret visibility", () => {
      const props: CTAProps = {
        label: "Directory",
        link: "/directory",
        ctaType: "textAndLink",
        variant: "directoryLink",
      };

      render(<CTA {...props} />);

      const caret = screen.getByTestId("caret");
      expect(caret).toHaveClass("block sm:hidden");
    });

    it("handles all preset image types", () => {
      const presetTypes: Array<CTAProps["presetImageType"]> = [
        "app-store",
        "google-play",
        "galaxy-store",
        "app-gallery",
        "uber-eats",
      ];

      presetTypes.forEach((type) => {
        const props: CTAProps = {
          label: "",
          ctaType: "presetImage",
          presetImageType: type,
          link: "https://example.com",
        };

        const { unmount } = render(<CTA {...props} />);
        const link = screen.getByRole("link");
        expect(link).toBeInTheDocument();
        unmount();
      });
    });

    it("respects custom eventName", () => {
      const props: CTAProps = {
        label: "Custom Event",
        link: "https://example.com",
        ctaType: "textAndLink",
        eventName: "customClickEvent",
      };

      render(<CTA {...props} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });

  describe("variant combinations", () => {
    it("renders primary variant correctly", () => {
      const props: CTAProps = {
        label: "Primary",
        link: "https://example.com",
        variant: "primary",
      };

      const { container } = render(<CTA {...props} />);

      const button = container.querySelector('[data-variant="primary"]');
      expect(button).toBeInTheDocument();
    });

    it("renders secondary variant correctly", () => {
      const props: CTAProps = {
        label: "Secondary",
        link: "https://example.com",
        variant: "secondary",
      };

      const { container } = render(<CTA {...props} />);

      const button = container.querySelector('[data-variant="secondary"]');
      expect(button).toBeInTheDocument();
    });

    it("renders link variant with caret", () => {
      const props: CTAProps = {
        label: "Link",
        link: "https://example.com",
        variant: "link",
      };

      render(<CTA {...props} />);

      const caret = screen.getByTestId("caret");
      expect(caret).toHaveStyle({ display: "inline-block" });
    });
  });
});