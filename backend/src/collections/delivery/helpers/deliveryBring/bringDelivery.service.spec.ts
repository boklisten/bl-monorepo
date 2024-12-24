import "mocha";
import { APP_CONFIG } from "@backend/application-config";
import { BringDeliveryService } from "@backend/collections/delivery/helpers/deliveryBring/bringDelivery.service";
import { HttpHandler } from "@backend/http/http.handler";
import { BlError } from "@shared/bl-error/bl-error";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";

chaiUse(chaiAsPromised);
should();

describe("BringDeliveryService", () => {
  const httpHandler = new HttpHandler();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const bringDeliveryService = new BringDeliveryService(httpHandler);

  let testBringResponse: any;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let testItem: Item;

  beforeEach(() => {
    testItem = {
      id: "item1",
      title: "signatur 3",
      type: "book",
      info: {
        isbn: 0,
        subject: "",
        year: 0,
        price: {},
        weight: "",
        distributor: "",
        discount: 0,
        publisher: "",
      },
      buyback: false,
      categories: [],
      digital: false,
      price: 100,
      taxRate: 0,
    };

    testBringResponse = {
      "@packageId": "0",
      Product: [
        {
          ProductId: "SERVICEPAKKE",
          ProductCodeInProductionSystem: "1202",
          GuiInformation: {
            MainDisplayCategory: "Pakke",
            DisplayName: "Klimanøytral Servicepakke",
            ProductName: "Klimanøytral Servicepakke",
            DescriptionText:
              "Pakken kan spores of utleveres p[ ditt lokale hentested.",
            ProductUrl:
              "http://www.bring.no/send/pakker/private-i-norge/hentes-pa-posten",
            DeliveryType: "Hentested",
          },
          Price: {
            "@currencyIdentificationCode": "NOK",
            PackagePriceWithoutAdditionalServices: {
              AmountWithVAT: "165.00",
              VAT: "33.00",
            },
            PackagePriceWithAdditionalServices: {
              AmountWithVAT: "165.00",
              VAT: "33.00",
            },
          },
          ExpectedDelivery: {
            WorkingDays: "2",
            UserMessage: null,
            AlternativeDeliveryDates: null,
          },
        },
      ],
    };
  });

  sinon
    .stub(httpHandler, "getWithQuery") // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .callsFake((url: string, queryString: string, headers: object) => {
      return new Promise((resolve, reject) => {
        if (url === APP_CONFIG.url.bring.shipmentInfo) {
          return resolve(testBringResponse);
        }

        return reject(new BlError("could not get requested data"));
      });
    });

  describe("#createBringDelivery()", () => {
    context("when input parameters are empty or undefined", () => {
      /*
			it('should reject if items is empty or undefined', (done) => {
				bringDeliveryService.getDeliveryInfoBring("1", "2", []).catch((blError) => {
					expect(blError.getMsg())
						.to.contain('items is empty or undefined');
					done();
				});
			});
			*/
      /*
			it('should reject if fromPostalCode is empty or undefined', (done) => {
				bringDeliveryService.getDeliveryInfoBring("", "2", [testItem])
					.catch((blError) => {
						expect(blError.getMsg())
							.to.contain('fromPostalCode is empty or undefined')
						done();
					})
			});
			*/
      /*
			it('should reject if toPostalCode is empty or undefined', (done) => {
				/*
				bringDeliveryService.getDeliveryInfoBring("1", null, [testItem])
					.catch((blError) => {
						expect(blError.getMsg())
							.to.contain('toPostalCode is empty or undefined')
						done();
					});
			});
			*/
    });

    context("when bring resolves with a correct response", () => {
      /*
			it('should resolve with deliveyInfoBring.amount equal to 165.00', (done) => {
				bringDeliveryService.getDeliveryInfoBring("0560", "7070", [testItem]).then((deliveryInfoBring: DeliveryInfoBring) => {
					expect(deliveryInfoBring.amount)
						.to.eql(165.00);
					done();
				})
			});
			*/
    });
  });
});
