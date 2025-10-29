import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { GetDirections } from "./GetDirections";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
    i18n: { language: "en" },
  }),
}));

vi.mock("@yext/visual-editor", () => ({
  useDocument: vi.fn(() => ({})),
  CTA: ({ label, link, linkType, variant, eventName, className, target }: any) => (
    <a
      href={link}
      data-link-type={linkType}
      data-variant={variant}
      data-event={eventName}
      className={className}
      target={target}
    >
      {label}
    </a>
  ),
  msg: (key: string, defaultValue: string) => defaultValue,
  YextField: (label: string, config: any) => config,
  resolveComponentData: vi.fn((field, language, document) => {
    if (field.field === "yextDisplayCoordinate" && document.yextDisplayCoordinate) {
      return document.yextDisplayCoordinate;
    }
    return field.constantValue;
  }),
}));

vi.mock("@yext/pages-components", () => ({
  getDirections: vi.fn((address, listings, searchQuery, options, coordinate) => {
    if (listings) return "https://maps.google.com/?listings=listing-123";
    if (coordinate) return "https://maps.google.com/?coord=40,-74";
    return null;
  }),
}));

describe("GetDirections Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with ref_listings", () => {
    it("uses ref_listings when available", async () => {
      const { useDocument } = await import("@yext/visual-editor");
      const { getDirections } = await import("@yext/pages-components");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      expect(getDirections).toHaveBeenCalledWith(
        undefined,
        "listing-123",
        undefined,
        { provider: "google" },
        undefined
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://maps.google.com/?listings=listing-123");
      expect(link).toHaveTextContent("Get Directions");
    });

    it("passes listings to getDirections over coordinate", async () => {
      const { useDocument } = await import("@yext/visual-editor");
      const { getDirections } = await import("@yext/pages-components");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-456",
        yextDisplayCoordinate: { latitude: 40.7128, longitude: -74.0060 },
      });

      const props = {
        variant: "secondary" as const,
      };

      render(<GetDirections.render {...props} />);

      // Should use listings and NOT pass coordinate
      expect(getDirections).toHaveBeenCalledWith(
        undefined,
        "listing-456",
        undefined,
        { provider: "google" },
        undefined
      );
    });
  });

  describe("with coordinates", () => {
    it("uses yextDisplayCoordinate when ref_listings is not available", async () => {
      const { useDocument } = await import("@yext/visual-editor");
      const { getDirections } = await import("@yext/pages-components");

      vi.mocked(useDocument).mockReturnValue({
        yextDisplayCoordinate: { latitude: 40.7128, longitude: -74.0060 },
      });

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      expect(getDirections).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        { provider: "google" },
        { latitude: 40.7128, longitude: -74.0060 }
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://maps.google.com/?coord=40,-74");
    });

    it("falls back to # when neither listings nor coordinates are available", async () => {
      const { useDocument } = await import("@yext/visual-editor");
      const { getDirections } = await import("@yext/pages-components");

      vi.mocked(useDocument).mockReturnValue({});

      vi.mocked(getDirections).mockReturnValue(null);

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "#");
    });
  });

  describe("component configuration", () => {
    it("has correct default props", () => {
      expect(GetDirections.defaultProps).toEqual({
        variant: "primary",
      });
    });

    it("has correct label", () => {
      expect(GetDirections.label).toBe("Get Directions");
    });

    it("includes variant field", () => {
      expect(GetDirections.fields).toHaveProperty("variant");
    });

    it("renders with all variant options", () => {
      const variants = ["primary", "secondary", "link"] as const;

      variants.forEach((variant) => {
        const { useDocument } = require("@yext/visual-editor");
        vi.mocked(useDocument).mockReturnValue({
          ref_listings: "listing-123",
        });

        const props = { variant };
        const { unmount } = render(<GetDirections.render {...props} />);

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("data-variant", variant);

        unmount();
      });
    });
  });

  describe("CTA props", () => {
    it("passes correct props to CTA component", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props = {
        variant: "secondary" as const,
      };

      render(<GetDirections.render {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveClass("font-bold");
      expect(link).toHaveAttribute("data-event", "getDirections");
      expect(link).toHaveAttribute("data-link-type", "DRIVING_DIRECTIONS");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("data-variant", "secondary");
    });

    it("sets DRIVING_DIRECTIONS linkType", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("data-link-type", "DRIVING_DIRECTIONS");
    });

    it("opens in new tab", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
      });

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("edge cases", () => {
    it("handles empty document gracefully", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({});

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("handles null coordinate gracefully", async () => {
      const { useDocument } = await import("@yext/visual-editor");

      vi.mocked(useDocument).mockReturnValue({
        yextDisplayCoordinate: null,
      });

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("prioritizes listings over coordinate when both present", async () => {
      const { useDocument } = await import("@yext/visual-editor");
      const { getDirections } = await import("@yext/pages-components");

      vi.mocked(useDocument).mockReturnValue({
        ref_listings: "listing-123",
        yextDisplayCoordinate: { latitude: 40.7128, longitude: -74.0060 },
      });

      const props = {
        variant: "primary" as const,
      };

      render(<GetDirections.render {...props} />);

      // Verify coordinate is NOT passed when listings exist
      expect(getDirections).toHaveBeenCalledWith(
        undefined,
        "listing-123",
        undefined,
        { provider: "google" },
        undefined
      );
    });
  });
});