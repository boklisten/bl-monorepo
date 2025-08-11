import { Infer } from "@vinejs/vine/types";

import { BranchService } from "#services/branch_service";
import DispatchService from "#services/dispatch_service";
import { StorageService } from "#services/storage_service";
import { UserDetailService } from "#services/user_detail_service";
import { userProvisioningValidator } from "#validators/user_provisioning";

async function createUser(
  candidateUser: Infer<
    typeof userProvisioningValidator
  >["userCandidates"][number],
) {
  const existingUser =
    (await UserDetailService.getByPhoneNumber(candidateUser.phone)) ??
    (await UserDetailService.getByEmail(candidateUser.email));
  if (existingUser) {
    const branch = await BranchService.getByName(candidateUser.branchName);
    return await StorageService.UserDetails.update(existingUser.id, {
      name: candidateUser.name ?? existingUser.name,
      address: candidateUser.address ?? existingUser.address,
      postCode: candidateUser.postalCode ?? existingUser.postCode,
      postCity: candidateUser.postalCity ?? existingUser.postCity,
      dob: candidateUser.dob ?? existingUser.dob,
      branchMembership: branch?.id,
      tasks: {
        confirmDetails: true,
        signAgreement: true,
      },
    });
  }
  const userDetail =
    await UserDetailService.createProvisionedUserDetail(candidateUser);
  await StorageService.Users.add({
    userDetail: userDetail.id,
    permission: "customer",
    login: {},
  });
  return userDetail;
}

export const UserProvisioningService = {
  async createUsers(
    userCandidates: Infer<typeof userProvisioningValidator>["userCandidates"],
  ) {
    await Promise.all(
      userCandidates.map(async (candidateUser) => {
        const userDetail = await createUser(candidateUser);
        await DispatchService.sendOnboardingMessage({
          userDetail,
          branchName: candidateUser.branchName,
        });
      }),
    );
  },
};
