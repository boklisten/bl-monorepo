import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Box, Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconUserEdit } from "@tabler/icons-react";

import UserDetailEditorDialog from "@/components/admin/UserDetailEditorDialog";

export default function UserProfileButton({
  userDetail,
}: {
  userDetail: UserDetail;
}) {
  return (
    <Box>
      <Button
        leftSection={<IconUserEdit />}
        onClick={() =>
          modals.open({
            title: "Rediger brukerdetaljer",
            children: (
              <UserDetailEditorDialog initialUserDetails={userDetail} />
            ),
          })
        }
      >
        Rediger brukerdetaljer
      </Button>
    </Box>
  );
}
