import { Alert, AlertTitle, ListItem } from "@mui/material";
import List from "@mui/material/List";
import { useFormContext } from "react-hook-form";

import { UserEditorFields } from "@/components/user/user-detail-editor/UserDetailsEditor";

export default function ErrorSummary() {
  const {
    formState: { errors },
  } = useFormContext<UserEditorFields>();

  return (
    <>
      {Object.values(errors).length > 0 && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            backgroundColor: "transparent",
            border: "3px solid #c30000",
          }}
        >
          <AlertTitle>
            Du må rette opp følgende før du kan gå videre:
          </AlertTitle>
          <List sx={{ listStyleType: "disc", pl: 2 }}>
            {Object.values(errors).map((error) => (
              <ListItem
                disablePadding
                sx={{ display: "list-item", py: 0.2 }}
                key={error.message}
              >
                {error.message}
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </>
  );
}
