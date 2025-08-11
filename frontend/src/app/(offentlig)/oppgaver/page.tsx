import { Container, Stack, Typography } from "@mui/material";

import AuthGuard from "@/components/common/AuthGuard";
import UserTasks from "@/components/UserTasks";

export default function TasksPage() {
  return (
    <AuthGuard>
      <Container>
        <Stack alignItems={"center"} gap={1}>
          <Typography variant="h1">Dine oppgaver</Typography>
          <UserTasks />
        </Stack>
      </Container>
    </AuthGuard>
  );
}
