import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Background } from "../components/atoms/background.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { defaultThemeData } from "./defaultThemeData.ts";

afterEach(cleanup);

test("backgrounds select action appearance from live theme values and explicit overlay classes", () => {
  const theme = structuredClone(defaultThemeData);
  theme.colors[0].background = "#000000";
  render(
    <TemplatePropsContext.Provider
      value={{ document: { __: { theme: JSON.stringify(theme) } } }}
    >
      <Background backgroundId={theme.colors[0].id} data-testid="live">
        <Background backgroundId="main-primary-light" data-testid="nested" />
        <Background
          backgroundId="main-primary-light"
          className="ve-theme-on-dark"
          data-testid="overlay"
        />
        <Background
          background={{ colorId: "main-black", channel: "foreground" }}
          data-testid="foreground"
        />
      </Background>
    </TemplatePropsContext.Provider>
  );
  expect(
    screen.getByTestId("live").classList.contains("ve-theme-on-dark")
  ).toBe(true);
  expect(
    screen.getByTestId("nested").classList.contains("ve-theme-on-light")
  ).toBe(true);
  expect(
    screen.getByTestId("overlay").classList.contains("ve-theme-on-dark")
  ).toBe(true);
  expect(
    screen.getByTestId("overlay").classList.contains("ve-theme-on-light")
  ).toBe(false);
  expect(
    screen.getByTestId("foreground").classList.contains("ve-theme-on-light")
  ).toBe(true);
});
