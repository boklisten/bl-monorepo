import SocialLoginButton from "@frontend/components/user/SocialLoginButton";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";

const FacebookButton = ({ label }: { label: string }) => (
  <SocialLoginButton
    label={label}
    brandName={"facebook"}
    brandIcon={<FacebookRoundedIcon />}
    brandColor={"#1877F2"}
  />
);

export default FacebookButton;
