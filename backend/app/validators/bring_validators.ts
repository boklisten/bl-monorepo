import vine from "@vinejs/vine";

export const bringPostalCodeResponseValidator = vine.compile(
  vine.object({
    postal_codes: vine.array(
      vine.object({
        city: vine.string(),
        county: vine.string(),
        latitude: vine.string(),
        longitude: vine.string(),
        municipality: vine.string(),
        municipalityId: vine.string(),
        po_box: vine.boolean(),
        postal_code: vine.string(),
        postal_code_type: vine.string(),
      }),
    ),
  }),
);
