import moment from "moment";

import { BringDelivery } from "#services/collections/delivery/helpers/deliveryBring/bringDelivery";
import { APP_CONFIG } from "#services/config/application-config";
import { isNullish } from "#services/helper/typescript-helpers";
import HttpHandler from "#services/http/http.handler";
import { BlError } from "#shared/bl-error/bl-error";
import { DeliveryInfoBring } from "#shared/delivery/delivery-info/delivery-info-bring";
import { Item } from "#shared/item/item";
import env from "#start/env";

export interface ShipmentAddress {
  name: string;
  postalCode: string;
  postalCity: string;
  address: string;
}

export interface FacilityAddress {
  address: string;
  postalCode: string;
  postalCity: string;
}

export class BringDeliveryService {
  private bringShipmentUrl = APP_CONFIG.url.bring.shipmentInfo;
  private clientUrl = APP_CONFIG.url.blWeb.base;

  public async getDeliveryInfoBring(
    facilityAddress: FacilityAddress,
    shipmentAddress: ShipmentAddress,
    items: Item[],
    freeDelivery: boolean,
  ): Promise<DeliveryInfoBring> {
    if (isNullish(facilityAddress) || isNullish(shipmentAddress)) {
      throw new BlError(
        "required fields facilityAddress or shipmentAddress are null or undefined",
      );
    }
    if (!items || items.length <= 0) {
      throw new BlError("items is empty or undefined");
    }

    if (!facilityAddress.postalCode || facilityAddress.postalCode.length <= 0) {
      throw new BlError("fromPostalCode is empty or undefined");
    }

    if (!shipmentAddress.postalCode || shipmentAddress.postalCode.length <= 0) {
      throw new BlError("toPostalCode is empty or undefined");
    }

    const bringAuthHeaders = {
      "X-MyBring-API-Key": env.get("BRING_API_KEY"),
      "X-MyBring-API-Uid": env.get("BRING_API_ID"),
    };

    const postalInfoUrl = `https://api.bring.com/pickuppoint/api/postalCode/NO/getCityAndType/${shipmentAddress.postalCode}.json`;
    try {
      const postalInfo = await HttpHandler.getWithQuery(
        postalInfoUrl,
        "",
        bringAuthHeaders,
      );

      // @ts-expect-error fixme: auto ignored
      shipmentAddress.postalCity = postalInfo["postalCode"]["city"];
    } catch {
      return Promise.reject(new BlError("fromPostalCode is not valid"));
    }
    const product = this.decideProduct(items);
    if (freeDelivery) {
      return {
        amount: 0,
        taxAmount: 0,
        estimatedDelivery: moment()
          .add(APP_CONFIG.delivery.deliveryDays, "days")
          .toDate(),
        facilityAddress,
        shipmentAddress,
        from: facilityAddress.postalCode,
        to: shipmentAddress.postalCode,
        product,
      };
    }
    return new Promise((resolve, reject) => {
      const bringDelivery = this.createBringDelivery(
        facilityAddress,
        shipmentAddress,
        items,
        product,
      );
      const queryString = HttpHandler.createQueryString(bringDelivery);

      HttpHandler.getWithQuery(
        this.bringShipmentUrl,
        queryString,
        bringAuthHeaders,
      )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((responseData: any) => {
          let deliveryInfoBring: DeliveryInfoBring;
          try {
            deliveryInfoBring = this.getDeliveryInfoBringFromBringResponse(
              facilityAddress,
              shipmentAddress,
              responseData,
              product,
            );
          } catch (error) {
            if (error instanceof BlError) {
              return reject(error);
            }

            return reject(
              new BlError(
                "unkown error, could not parse the data from bring api",
              ).store("error", error),
            );
          }

          resolve(deliveryInfoBring);
        })
        .catch((blError: BlError) => {
          return reject(blError);
        });
    });
  }

  private calculateTotalWeight(items: Item[]) {
    let totalWeightInGrams = items.reduce((total, nextItem) => {
      const defaultWeight = 1;
      const weightField = Number(nextItem.info.weight);
      const weight = isNaN(weightField) ? defaultWeight : weightField;
      return total + weight * 1000;
    }, 0);

    if (totalWeightInGrams === 0) {
      totalWeightInGrams = APP_CONFIG.delivery.maxWeightLetter + 1;
    }
    return Math.ceil(totalWeightInGrams);
  }

  private decideProduct(items: Item[]) {
    return items.length > 3 ||
      this.calculateTotalWeight(items) > APP_CONFIG.delivery.maxWeightLetter
      ? "SERVICEPAKKE"
      : "3584";
  }

  private createBringDelivery(
    facilityAddress: FacilityAddress,
    shipmentAddress: ShipmentAddress,
    items: Item[],
    // @ts-expect-error fixme: auto ignored
    product,
  ): BringDelivery {
    const totalWeightInGrams = this.calculateTotalWeight(items);

    return {
      clientUrl: this.clientUrl,
      weight: totalWeightInGrams,
      frompostalcode: facilityAddress.postalCode,
      topostalcode: shipmentAddress.postalCode,
      fromcountry: "NO",
      tocountry: "NO",
      product,
    };
  }

  private getDeliveryInfoBringFromBringResponse(
    facilityAddress: FacilityAddress,
    shipmentAddress: ShipmentAddress,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseData: any,
    product: string,
  ): DeliveryInfoBring {
    let deliveryInfoBring: DeliveryInfoBring = {
      amount: -1,
      estimatedDelivery: new Date(),
      taxAmount: 0,
      facilityAddress: facilityAddress,
      shipmentAddress: shipmentAddress,
      from: facilityAddress.postalCode,
      to: shipmentAddress.postalCode,
      product,
    };

    if (
      !responseData["consignments"] ||
      !Array.isArray(
        responseData["consignments"] ||
          responseData["consignments"].length === 0,
      )
    ) {
      throw new BlError("no consignments provided in response from bringApi");
    }

    if (
      !responseData["consignments"][0]["products"] ||
      !Array.isArray(
        responseData["consignments"][0]["products"] ||
          responseData["consignments"][0]["products"].length === 0,
      )
    ) {
      throw new BlError("no products provided in response from bringApi");
    }

    deliveryInfoBring = this.getBringProduct(
      deliveryInfoBring,
      responseData["consignments"][0]["products"].at(-1),
    );

    if (deliveryInfoBring.amount === -1) {
      throw new BlError("could not parse the data from the bring api").store(
        "responseData",
        responseData,
      );
    }

    return deliveryInfoBring;
  }

  private getBringProduct(
    deliveryInfoBring: DeliveryInfoBring,

    // @ts-expect-error fixme: auto ignored
    product,
  ): DeliveryInfoBring {
    const priceInfo = product["price"]["listPrice"];
    const priceWithoutAdditionalService =
      priceInfo["priceWithoutAdditionalServices"];
    if (priceWithoutAdditionalService) {
      deliveryInfoBring.amount = Number.parseInt(
        priceWithoutAdditionalService["amountWithVAT"],
      );
      deliveryInfoBring.taxAmount = Number.parseInt(
        priceWithoutAdditionalService["vat"],
      );
    }

    const expectedDelivery = product["expectedDelivery"];
    if (expectedDelivery) {
      const workingDays = expectedDelivery["workingDays"];
      if (workingDays) {
        deliveryInfoBring.estimatedDelivery = moment()
          .add(
            Number.parseInt(workingDays) + APP_CONFIG.delivery.deliveryDays,
            "days",
          )
          .toDate();
      }
    }

    return deliveryInfoBring;
  }
}
