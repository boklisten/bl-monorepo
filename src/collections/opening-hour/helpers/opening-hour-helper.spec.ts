import "mocha";
import { Branch, OpeningHour, BlError } from "@boklisten/bl-model";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { BlCollectionName } from "@/collections/bl-collection";
import { OpeningHourHelper } from "@/collections/opening-hour/helpers/opening-hour-helper";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

chai.use(chaiAsPromised);
chai.use(sinonChai);

const openingHourStorage = new BlDocumentStorage<OpeningHour>(
  BlCollectionName.OpeningHours,
);
const openingHourHelper = new OpeningHourHelper(openingHourStorage);
const openingHourStorageGetMany = sinon.stub(openingHourStorage, "getMany");

describe("getNextAvailableOpeningHour()", () => {
  it("should reject if no opening hour is found in Branch", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const branch = {
      openingHours: [],
    } as Branch;

    return openingHourHelper
      .getNextAvailableOpeningHour(branch)
      .should.eventually.be.rejectedWith(
        BlError,
        /no opening hours found at branch/,
      );
  });

  it("should reject if all opening hours are expired", () => {
    const branch = {
      openingHours: ["openingHour1", "openingHour2"],
    } as Branch;

    openingHourStorageGetMany
      .withArgs(["openingHour1", "openingHour2"])
      .resolves([
        {
          from: moment("2012-01-01").toDate(),
          to: moment("2012-01-02").toDate(),
          branch: "branch1",
        },
        {
          from: moment("2012-01-03").toDate(),
          to: moment("2012-01-03").toDate(),
          branch: "branch1",
        },
      ] as OpeningHour[]);

    return openingHourHelper
      .getNextAvailableOpeningHour(branch)
      .should.eventually.be.rejectedWith(
        BlError,
        /no opening hours are found to be valid/,
      );
  });

  it("should resolve with the first available opening hour", () => {
    const branch = {
      openingHours: ["openingHour3", "openingHour4"],
    } as Branch;

    const openingHours = [
      {
        from: moment("2012-01-01").toDate(),
        to: moment("2012-01-02").toDate(),
        branch: "branch1",
      },
      {
        from: moment().add(1, "day").toDate(),
        to: moment().add(1, "day").toDate(),
        branch: "branch1",
      },
    ] as OpeningHour[];

    openingHourStorageGetMany
      .withArgs(["openingHour3", "openingHour4"])
      .resolves(openingHours);

    return openingHourHelper
      .getNextAvailableOpeningHour(branch)
      .should.eventually.deep.equal(openingHours[1]);
  });

  it("should resolve with the first available opening hour", () => {
    const branch = {
      openingHours: ["openingHour3", "openingHour4"],
    } as Branch;

    const openingHours = [
      {
        from: moment().add(4, "day").toDate(),
        to: moment().add(4, "day").toDate(),
        branch: "branch1",
      },
      {
        from: moment().add(1, "day").toDate(),
        to: moment().add(1, "day").toDate(),
        branch: "branch1",
      },
      {
        from: moment().add(2, "day").toDate(),
        to: moment().add(2, "day").toDate(),
        branch: "branch1",
      },
    ] as OpeningHour[];

    openingHourStorageGetMany
      .withArgs(["openingHour3", "openingHour4"])
      .resolves(openingHours);

    return openingHourHelper
      .getNextAvailableOpeningHour(branch)
      .should.eventually.deep.equal(openingHours[1]);
  });

  describe('when "after"-date is provided', () => {
    it("should resolve with the first available opening hour #1", () => {
      const branch = {
        openingHours: ["openingHour3", "openingHour4"],
      } as Branch;

      const openingHours = [
        {
          from: moment().add(4, "day").toDate(),
          to: moment().add(4, "day").toDate(),
          branch: "branch1",
        },
        {
          from: moment().add(1, "day").toDate(),
          to: moment().add(1, "day").toDate(),
          branch: "branch1",
        },
        {
          from: moment().add(2, "day").toDate(),
          to: moment().add(2, "day").toDate(),
          branch: "branch1",
        },
      ] as OpeningHour[];

      openingHourStorageGetMany
        .withArgs(["openingHour3", "openingHour4"])
        .resolves(openingHours);

      return openingHourHelper
        .getNextAvailableOpeningHour(
          branch,
          moment().add(2, "day").add(1, "hour").toDate(),
        )
        .should.eventually.deep.equal(openingHours[0]);
    });

    it("should resolve with the first available opening hour #2", () => {
      const branch = {
        openingHours: ["openingHour3", "openingHour4"],
      } as Branch;

      const openingHours = [
        {
          from: moment().add(4, "day").toDate(),
          to: moment().add(4, "day").toDate(),
          branch: "branch1",
        },
        {
          from: moment().add(1, "day").toDate(),
          to: moment().add(1, "day").toDate(),
          branch: "branch1",
        },
        {
          from: moment().add(2, "day").toDate(),
          to: moment().add(2, "day").toDate(),
          branch: "branch1",
        },
      ] as OpeningHour[];

      openingHourStorageGetMany
        .withArgs(["openingHour3", "openingHour4"])
        .resolves(openingHours);

      return openingHourHelper
        .getNextAvailableOpeningHour(branch, moment().add(1, "day").toDate())
        .should.eventually.deep.equal(openingHours[2]);
    });

    it('should reject if no opening hours are found to be valid after the "after"-date', () => {
      const branch = {
        openingHours: ["openingHour3", "openingHour4"],
      } as Branch;

      const openingHours = [
        {
          from: moment().add(4, "day").toDate(),
          to: moment().add(4, "day").toDate(),
          branch: "branch1",
        },
        {
          from: moment().add(1, "day").toDate(),
          to: moment().add(1, "day").toDate(),
          branch: "branch1",
        },
        {
          from: moment().add(2, "day").toDate(),
          to: moment().add(2, "day").toDate(),
          branch: "branch1",
        },
      ] as OpeningHour[];

      openingHourStorageGetMany
        .withArgs(["openingHour3", "openingHour4"])
        .resolves(openingHours);

      return openingHourHelper
        .getNextAvailableOpeningHour(branch, moment().add(5, "day").toDate())
        .should.eventually.be.rejectedWith(
          BlError,
          /no opening hours are found to be valid/,
        );
    });
  });
});
