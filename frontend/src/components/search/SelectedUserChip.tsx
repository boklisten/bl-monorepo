import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Person } from "@mui/icons-material";
import Chip from "@mui/material/Chip";

export default function SelectedUserChip({
  userDetail,
  unSelect,
}: {
  userDetail: UserDetail;
  unSelect: () => void;
}) {
  return (
    <Chip
      clickable
      avatar={<Person />}
      label={userDetail.name}
      onDelete={unSelect}
    />
  );
}
