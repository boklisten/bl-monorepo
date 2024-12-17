import BlFetcher from "@frontend/api/blFetcher";
import LinkableBranchInfo from "@frontend/components/LinkableBranchInfo";
import BL_CONFIG from "@frontend/utils/bl-config";
import { assertBlApiError } from "@frontend/utils/types";
import { Branch } from "@shared/branch/branch";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import moment from "moment";
import { Metadata } from "next";

interface Params {
  params: Promise<{ id: string }>;
}

export const generateStaticParams = async () => {
  try {
    return await BlFetcher.get<Branch[]>(
      `${BL_CONFIG.collection.branch}?active=true`,
    );
  } catch (error) {
    assertBlApiError(error);
  }
  return [];
};

export const dynamic = "force-dynamic";

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const branchData = await BlFetcher.get<Branch[]>(
    `${BL_CONFIG.collection.branch}/${params.id}`,
  );
  return {
    title: `${branchData?.[0]?.name ?? "Skoler og åpningstider"} | Boklisten.no`,
    description:
      "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
  };
}
interface BranchData {
  branch: Branch | null;
  openingHours: OpeningHour[];
}

async function getBranchData(branchId: string): Promise<BranchData> {
  const branchUrl = `${BL_CONFIG.collection.branch}/${branchId}`;
  const now = moment().startOf("day").format("DDMMYYYYHHmm");
  const openingHoursUrl = `${BL_CONFIG.collection.openingHour}?branch=${branchId}&from=>${now}`;
  const branchData: BranchData = { branch: null, openingHours: [] };
  try {
    const branches = await BlFetcher.get<Branch[]>(branchUrl);
    branchData.branch = branches[0] ?? null;
  } catch (error) {
    assertBlApiError(error);
  }
  try {
    const openingHoursResult =
      await BlFetcher.get<OpeningHour[]>(openingHoursUrl);
    branchData.openingHours = openingHoursResult ?? [];
  } catch (error) {
    assertBlApiError(error);
  }

  return branchData;
}

const BranchPage = async (props: Params) => {
  const params = await props.params;
  const { branch, openingHours } = await getBranchData(params.id);

  return (
    <LinkableBranchInfo
      cachedBranch={branch}
      cachedOpeningHours={openingHours ?? []}
    />
  );
};

export default BranchPage;
