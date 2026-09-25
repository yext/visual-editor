import { describe, expect, it } from "vitest";
import {
  type FormField,
  hasInvalidConfiguration,
  prepareSubmissionData,
} from "./formSectionUtils.ts";

describe("hasInvalidConfiguration", () => {
  it.each([
    {
      name: "all required fields and the entity exist",
      entityId: "location-1",
      fields: [
        { type: "preferredContactMethod", label: "Contact method" },
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
        { type: "email", label: "Email" },
      ] as FormField[],
      expected: false,
    },
    {
      name: "the entity is missing",
      entityId: "",
      fields: [
        { type: "preferredContactMethod", label: "Contact method" },
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
        { type: "email", label: "Email" },
      ] as FormField[],
      expected: true,
    },
    {
      name: "an offered contact method lacks its field",
      entityId: "location-1",
      fields: [
        { type: "preferredContactMethod", label: "Contact method" },
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
      ] as FormField[],
      expected: true,
    },
    {
      name: "a custom key uses the honeypot name",
      entityId: "location-1",
      fields: [
        { type: "preferredContactMethod", label: "Contact method" },
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
        { type: "email", label: "Email" },
        { type: "text", label: "Website", key: "my_wingspan_url" },
      ] as FormField[],
      expected: true,
    },
    {
      name: "a dropdown has no choices",
      entityId: "location-1",
      fields: [
        { type: "preferredContactMethod", label: "Contact method" },
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
        { type: "email", label: "Email" },
        { type: "dropdown", label: "Time", key: "time", options: [] },
      ] as FormField[],
      expected: true,
    },
  ])(
    "when $name, then the setup result is $expected",
    ({ entityId, fields, expected }) => {
      expect(
        hasInvalidConfiguration(
          {
            fields,
            showPreferredContactMethod: true,
            defaultContactMethod: "PHONE",
          },
          { id: entityId }
        )
      ).toBe(expected);
    }
  );
});

describe("prepareSubmissionData", () => {
  it("when phone is preferred, then it maps every API field", () => {
    const values = new FormData();
    values.set("first_name", " Ada ");
    values.set("last_name", " Lovelace ");
    values.set("phone", " 5555555555 ");
    values.set("email", " ada@example.com ");
    values.set("message", " Hello ");
    values.set("relate_opt_in", "on");
    values.set("yext_wingspan_url", "");
    values.set("custom_6", "  Agent  ");
    values.set("custom_7", "morning");
    values.append("custom_8", "home");
    values.append("custom_8", "savings");

    expect(
      prepareSubmissionData(
        values,
        [
          { type: "firstName", label: "First name" },
          { type: "lastName", label: "Last name" },
          { type: "phone", label: "Phone" },
          { type: "email", label: "Email" },
          { type: "message", label: "Message" },
          { type: "phoneOptIn", label: "Consent" },
          { type: "text", label: "Role", key: " role " },
          {
            type: "dropdown",
            label: "Time",
            key: "time",
            options: [{ label: "Morning", value: "morning" }],
          },
          {
            type: "checkboxGroup",
            label: "Reasons",
            key: "reasons",
            options: [
              { label: "Home", value: "home" },
              { label: "Savings", value: "savings" },
            ],
          },
        ],
        "PHONE"
      )
    ).toEqual({
      first_name: "Ada",
      last_name: "Lovelace",
      preferred_contact_method: "PHONE",
      phone: "5555555555",
      email: "ada@example.com",
      message: "Hello",
      relate_opt_in: true,
      custom_data: {
        yext_wingspan_url: "",
        role: "Agent",
        time: "morning",
        reasons: ["home", "savings"],
      },
    });
  });

  it("when email is preferred, then it omits phone consent", () => {
    const values = new FormData();
    values.set("first_name", "Ada");
    values.set("last_name", "Lovelace");
    values.set("email", "ada@example.com");
    values.set("relate_opt_in", "on");

    expect(
      prepareSubmissionData(
        values,
        [
          { type: "firstName", label: "First name" },
          { type: "lastName", label: "Last name" },
          { type: "email", label: "Email" },
          { type: "phoneOptIn", label: "Consent" },
        ],
        "EMAIL"
      )
    ).toEqual({
      first_name: "Ada",
      last_name: "Lovelace",
      preferred_contact_method: "EMAIL",
      email: "ada@example.com",
      custom_data: { yext_wingspan_url: "" },
    });
  });

  it.each([
    {
      name: "first name is blank",
      contactMethod: "PHONE" as const,
      entries: [
        ["first_name", "   "],
        ["last_name", "Lovelace"],
        ["phone", "5555555555"],
      ],
      fields: [
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
      ] as FormField[],
    },
    {
      name: "the selected email is missing",
      contactMethod: "EMAIL" as const,
      entries: [
        ["first_name", "Ada"],
        ["last_name", "Lovelace"],
      ],
      fields: [
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "email", label: "Email" },
      ] as FormField[],
    },
    {
      name: "required custom text has only spaces",
      contactMethod: "PHONE" as const,
      entries: [
        ["first_name", "Ada"],
        ["last_name", "Lovelace"],
        ["phone", "5555555555"],
        ["custom_3", "   "],
      ],
      fields: [
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
        { type: "text", label: "Reason", key: "reason", required: true },
      ] as FormField[],
    },
    {
      name: "required checkbox group is empty",
      contactMethod: "PHONE" as const,
      entries: [
        ["first_name", "Ada"],
        ["last_name", "Lovelace"],
        ["phone", "5555555555"],
      ],
      fields: [
        { type: "firstName", label: "First name" },
        { type: "lastName", label: "Last name" },
        { type: "phone", label: "Phone" },
        {
          type: "checkboxGroup",
          label: "Reason",
          key: "reason",
          required: true,
        },
      ] as FormField[],
    },
  ])(
    "when $name, then submission data is rejected",
    ({ contactMethod, entries, fields }) => {
      const values = new FormData();
      for (const [name, value] of entries) {
        values.append(name, value);
      }

      expect(prepareSubmissionData(values, fields, contactMethod)).toBeNull();
    }
  );
});
