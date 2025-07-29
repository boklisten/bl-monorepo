import { UserDetail } from "@boklisten/backend/shared/user-detail";
import { Email, Person, Phone } from "@mui/icons-material";
import { ListItemButton, Stack, Typography } from "@mui/material";

export default function UserDetailSearchResult({
  userDetail,
  onClick,
}: {
  userDetail: UserDetail;
  onClick: () => void;
}) {
  return (
    <ListItemButton onClick={onClick}>
      <Stack
        sx={{
          gap: 0.5,
        }}
      >
        <Stack
          direction={"row"}
          sx={{
            gap: 0.5,
            alignItems: "center",
          }}
        >
          <Person />
          <Typography>{userDetail.name}</Typography>
        </Stack>
        <Stack
          direction={"row"}
          sx={{
            gap: 0.5,
            alignItems: "center",
          }}
        >
          <Email />
          <Typography>{userDetail.email}</Typography>
        </Stack>
        <Stack
          direction={"row"}
          sx={{
            gap: 0.5,
            alignItems: "center",
          }}
        >
          <Phone />
          <Typography>{userDetail.phone}</Typography>
        </Stack>
      </Stack>
    </ListItemButton>
  );
}
