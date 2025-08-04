import { test } from "@japa/runner";
import { use as chaiUse, should } from "chai";
import chaiAsPromised from "chai-as-promised";
import moment from "moment-timezone";
import sinon, { createSandbox } from "sinon";
import sinonChai from "sinon-chai";

import { OpeningHourHelper } from "#services/legacy/collections/opening-hour/helpers/opening-hour-helper";
import { BlStorage } from "#services/storage/bl-storage";
import { BlError } from "#shared/bl-error";
import { Branch } from "#shared/branch";
import { OpeningHour } from "#shared/opening-hour";

chaiUse(chaiAsPromised);
should();
chaiUse(sinonChai);

const openingHourHelper = new OpeningHourHelper();

test.group("getNextAvailableOpeningHour()", (group) => {
  let openingHourStorageGetMany: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  group.each.setup(() => {
    sandbox = createSandbox();
    openingHourStorageGetMany = sandbox.stub(BlStorage.OpeningHours, "getMany");
  });
  group.each.teardown(() => {
    sandbox.restore();
  });
  test("should reject if no opening hour is found in Branch", async () => {
    // @ts-expect-error fixme: auto ignored
    const branch = {
      openingHours: [],
    } as Branch;

    openingHourHelper
      .getNextAvailableOpeningHour(branch)
      // @ts-expect-error fixme: auto ignored bad test enums
      .should.eventually.be.rejectedWith(
        BlError,
        /no opening hours found at branch/,
      );
  });

  test("should reject if all opening hours are expired", async () => {
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

    openingHourHelper
      .getNextAvailableOpeningHour(branch)
      // @ts-expect-error fixme: auto ignored bad test enums
      .should.eventually.be.rejectedWith(
        BlError,
        /no opening hours are found to be valid/,
      );
  });

  test("should resolve with the first available opening hour", async () => {
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

    openingHourHelper
      .getNextAvailableOpeningHour(branch)
      // @ts-expect-error fixme: auto ignored bad test enums
      .should.eventually.deep.equal(openingHours[1]);
  });

  test("should resolve with the first available opening hour", async () => {
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

    openingHourHelper
      .getNextAvailableOpeningHour(branch)
      // @ts-expect-error fixme: auto ignored bad test enums
      .should.eventually.deep.equal(openingHours[1]);
  });

  test("should resolve with the first available opening hour #1", async () => {
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

    openingHourHelper
      .getNextAvailableOpeningHour(
        branch,
        moment().add(2, "day").add(1, "hour").toDate(),
      )
      // @ts-expect-error fixme: auto ignored bad test enums
      .should.eventually.deep.equal(openingHours[0]);
  });

  test("should resolve with the first available opening hour #2", async () => {
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

    openingHourHelper
      .getNextAvailableOpeningHour(branch, moment().add(1, "day").toDate())
      // @ts-expect-error fixme: auto ignored bad test enums
      .should.eventually.deep.equal(openingHours[2]);
  });

  test('should reject if no opening hours are found to be valid after the "after"-date', async () => {
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

    openingHourHelper
      .getNextAvailableOpeningHour(branch, moment().add(5, "day").toDate())
      // @ts-expect-error fixme: auto ignored bad test enums
      .should.eventually.be.rejectedWith(
        BlError,
        /no opening hours are found to be valid/,
      );
  });
});
