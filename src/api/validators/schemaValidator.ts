/* -----------------------------------------
   AJV Schema Validator for FX API Responses
------------------------------------------*/

import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../contracts/openapi.json" with { type: "json" };

/* -----------------------------------------
   Initialize AJV
------------------------------------------*/
const ajv = new Ajv({
  strict: false, // Disable strict mode to allow partial schemas
  allErrors: true, // Collect all errors instead of stopping at first
  validateFormats: true, // Enable format validation (e.g., date, email)
});

// Add extra format validators (date, time, URI, etc.)
addFormats(ajv);

/* -----------------------------------------
   Schema Validator Utility
------------------------------------------*/
export const schemaValidator = {
  /**
   * Validate a given data object against a named schema
   * @param schemaKey - The key of the schema inside OpenAPI components
   * @param data - The actual API response data to validate
   * @throws Error if validation fails
   */
  validate(schemaKey: string, data: unknown) {
    // Extract the schema definition from OpenAPI JSON
    const definition = (schema as any).components.schemas[schemaKey];

    // Compile schema into a validation function
    const validate = ajv.compile(definition);

    // Run validation
    const valid = validate(data);

    // If validation fails, throw an error with formatted JSON of all issues
    if (!valid) {
      throw new Error(JSON.stringify(validate.errors, null, 2));
    }
  },
};
