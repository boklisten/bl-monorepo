import vine from "@vinejs/vine";

export const bringShippingInfoResponseValidator = vine.create({
  consignments: vine.array(
    vine.object({
      products: vine.array(
        vine.object({
          guiInformation: vine.object({
            deliveryType: vine.string(),
            displayName: vine.string(),
            descriptionText: vine.string(),
          }),
          price: vine.object({
            listPrice: vine.object({
              priceWithAdditionalServices: vine.object({
                amountWithVAT: vine.string(),
              }),
              currencyCode: vine.string(),
            }),
          }),
          expectedDelivery: vine.object({
            formattedExpectedDeliveryDate: vine.string(),
          }),
        }),
      ),
    }),
  ),
});

export const bringPostalCodeResponseValidator = vine.create(
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
