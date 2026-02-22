import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "../contracts/openapi.json" with { type: "json" };

const ajv = new Ajv({
  strict: false,
  allErrors: true,
  validateFormats: true,
});

addFormats(ajv);

export const schemaValidator = {
  validate(schemaKey: string, data: unknown) {
    const definition = (schema as any).components.schemas[schemaKey];

    const validate = ajv.compile(definition);
    const valid = validate(data);

    if (!valid) {
      throw new Error(JSON.stringify(validate.errors, null, 2));
    }
  },
};
