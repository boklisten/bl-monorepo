import { Button } from "@mui/material";

const FixedSuccessButton = ({
  label,
  loading = false,
  onClick,
}: {
  label: string;
  loading?: boolean;
  onClick: () => unknown;
}) => (
  <Button
    color="success"
    variant="contained"
    sx={{ position: "fixed", bottom: 1, zIndex: 10 }}
    loading={loading}
    onClick={onClick}
  >
    {label}
  </Button>
);

export default FixedSuccessButton;
