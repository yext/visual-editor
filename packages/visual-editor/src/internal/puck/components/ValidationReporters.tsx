import React from "react";
import { MetaTitleValidationReporter } from "./meta-title/MetaTitleValidationReporter.tsx";

const validationReporters = [MetaTitleValidationReporter];

export const ValidationReporters = () => {
  return (
    <>
      {validationReporters.map((Reporter, index) => (
        <Reporter key={index} />
      ))}
    </>
  );
};
