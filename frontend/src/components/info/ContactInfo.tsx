import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { Typography, Box } from "@mui/material";

import DynamicLink from "@/components/DynamicLink";
import { CONTACT_INFO } from "@/utils/constants";

const ContactInfo = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
        <PhoneIphoneIcon />
        <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
          <Typography variant="body1">Ring oss</Typography>
          <DynamicLink href={`tel:${CONTACT_INFO.phone}`}>
            {CONTACT_INFO.phone}
          </DynamicLink>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
        <EmailIcon />
        <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
          <Typography variant="body1">Send oss en e-post</Typography>
          <DynamicLink href={`mailto:${CONTACT_INFO.email}`}>
            {CONTACT_INFO.email}
          </DynamicLink>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
        <LocationOnIcon />
        <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
          <Typography variant="body1">Vår adresse</Typography>
          {CONTACT_INFO.address}
        </Box>
      </Box>
    </Box>
  );
};

export default ContactInfo;
