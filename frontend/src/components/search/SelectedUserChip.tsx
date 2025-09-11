import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { modals } from "@mantine/modals";
import { Person } from "@mui/icons-material";
import Chip from "@mui/material/Chip";

import UserDetailEditorDialog from "@/components/admin/UserDetailEditorDialog";

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
      onClick={() =>
        modals.open({
          title: "Rediger brukerdetaljer",
          children: <UserDetailEditorDialog initialUserDetails={userDetail} />,
        })
      }
      avatar={<Person />}
      label={userDetail.name}
      onDelete={unSelect}
    />
  );
}
