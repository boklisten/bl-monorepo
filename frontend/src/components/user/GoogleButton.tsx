import SocialLoginButton from "@frontend/components/user/SocialLoginButton";
import GoogleIcon from "@mui/icons-material/Google";

const GoogleButton = ({ label }: { label: string }) => (
  <SocialLoginButton
    label={label}
    brandName={"google"}
    brandIcon={<GoogleIcon />}
    brandColor={"#ea4335"}
  />
);

export default GoogleButton;
