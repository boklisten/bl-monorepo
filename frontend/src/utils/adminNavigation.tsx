import {
  AccountCircle,
  Business,
  Checklist,
  ConnectWithoutContact,
  DocumentScanner,
  EditDocument,
  Email,
  Equalizer,
  HourglassBottom,
  LibraryBooks,
  Notifications,
  Public,
  QrCode,
  Receipt,
  RequestQuote,
  Search,
  ShoppingCart,
  Storage,
  Storefront,
} from "@mui/icons-material";
import { Navigation } from "@toolpad/core";

const EMPLOYEE_LINKS: Navigation = [
  { title: "BL-ID-søk", icon: <Search />, segment: "admin/blid", kind: "page" },
  {
    title: "Handlekurv",
    icon: <ShoppingCart />,
    segment: "admin/handlekurv",
    kind: "page",
  },
  {
    title: "Bulk-innsamling", // fixme: rename to "Hurtiginnsamling"
    icon: <QrCode />,
    segment: "admin/hurtiginnsamling",
    kind: "page",
  },
  {
    title: "Hurtigutdeling",
    icon: <Checklist />,
    segment: "admin/hurtigutdeling",
    kind: "page",
  },
  {
    title: "Ordreoversikt",
    icon: <Receipt />,
    segment: "admin/ordreoversikt",
    kind: "page",
  },
  {
    title: "Venteliste",
    icon: <HourglassBottom />,
    segment: "admin/venteliste",
    kind: "page",
  },
  {
    title: "Scanner",
    icon: <DocumentScanner />,
    segment: "admin/scanner",
    kind: "page",
  },
];

export const COMMUNICATION_SUB_PAGES: Navigation = [
  {
    title: "Påminnelser",
    icon: <Notifications />,
    segment: "paminnelser",
    kind: "page",
  },
  {
    title: "Overleveringer",
    icon: <ConnectWithoutContact />,
    segment: "overleveringer",
    kind: "page",
  },
];

const ADMIN_LINKS: Navigation = [
  {
    title: "Faktura",
    icon: <RequestQuote />,
    segment: "admin/faktura",
    kind: "page",
  },
  {
    title: "Kommunikasjon",
    icon: <Email />,
    segment: "admin/kommunikasjon",
    kind: "page",
    children: COMMUNICATION_SUB_PAGES,
  },
  {
    title: "Databaseverktøy",
    icon: <Storage />,
    segment: "admin/database",
    kind: "page",
    children: [
      {
        title: "Rapporter",
        icon: <Equalizer />,
        segment: "rapporter",
      },
      {
        title: "Bøker",
        icon: <LibraryBooks />,
        segment: "boker",
      },
      {
        title: "Filialer",
        icon: <Storefront />,
        segment: "filialer",
      },
      {
        title: "Selskap",
        icon: <Business />,
        segment: "selskap",
      },
      {
        title: "Dynamisk innhold",
        icon: <EditDocument />,
        segment: "dynamisk_innhold",
      },
    ],
  },
];

const USER_LINKS: Navigation = [
  {
    title: "Profil",
    icon: <AccountCircle />,
    segment: "admin/profil",
    kind: "page",
  },
  {
    title: "Gå til Boklisten.no",
    icon: <Public />,
    segment: "offentlig",
    kind: "page",
  },
];

export function getAdminPagesNavigationLinks(isAdmin: boolean) {
  return isAdmin
    ? [...EMPLOYEE_LINKS, ...ADMIN_LINKS, ...USER_LINKS]
    : [...EMPLOYEE_LINKS, ...USER_LINKS];
}
