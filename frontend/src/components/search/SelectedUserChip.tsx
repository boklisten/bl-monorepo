import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Person } from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import { useDialogs } from "@toolpad/core";

import UserDetailEditorDialog from "@/components/admin/UserDetailEditorDialog";

export default function SelectedUserChip({
  userDetail,
  unSelect,
}: {
  userDetail: UserDetail;
  unSelect: () => void;
}) {
  const dialogs = useDialogs();
  return (
    <Chip
      clickable
      onClick={() =>
        dialogs.open(UserDetailEditorDialog, { initialUserDetails: userDetail })
      }
      avatar={<Person />}
      label={userDetail.name}
      onDelete={unSelect}
    />
  );
}
