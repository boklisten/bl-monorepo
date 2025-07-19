import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";

import SocialLoginButton from "@/components/user/SocialLoginButton";

const FacebookButton = ({ label }: { label: string }) => (
  <SocialLoginButton
    label={label}
    provider={"facebook"}
    brandIcon={<FacebookRoundedIcon />}
    brandColor={"#1877F2"}
  />
);

export default FacebookButton;
