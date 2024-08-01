// routes.jsx
import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  BellIcon,
  ClockIcon,
  KeyIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications, Usuarios, Roles, Compras, Proveedores, Insumos, CategoriaInsumos, FichasTecnicas, ProductoTerminado, Ventas, Clientes, Pedidos } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { ArchiveBoxIcon, ClipboardDocumentIcon, ClipboardDocumentListIcon, CubeIcon, DocumentCurrencyDollarIcon, FingerPrintIcon, HomeModernIcon, InboxStackIcon, PhoneIcon, PhoneXMarkIcon, ShoppingCartIcon, TruckIcon, UserGroupIcon, UsersIcon, WalletIcon } from "@heroicons/react/24/outline";

const icon = {
  className: "w-5 h-5 text-inherit",
};

const allRoutes = [
  
  {
    title: "autoriza",
    layout: "auth",
    visible: false, // Propiedad para indicar que esta ruta no debe ser visible
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
  
  {
    title: "",
    layout: "dashboard",

    pages: [
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Inicio",
        path: "/home",
        element: <Home />,
      },
    ],
  },
  
  {
    title: "Configuración",
    layout: "dashboard",
    visible: true,
    pages: [
      {
        icon: <FingerPrintIcon {...icon} />,
        name: "Roles",
        path: "/roles",
        element: <Roles />,
      },
      
    ],
  },

  {
    title: "Usuarios",
    layout: "dashboard",
    visible: true,
    pages: [
     
      {
        icon: <UserGroupIcon {...icon} />,
        name: "Usuarios",
        path: "/usuarios",
        element: <Usuarios />,
      },
    ],
  },
  
  {
    title: "Compras",
    layout: "dashboard",
    visible: true,
    pages: [
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Gestión de Compras",
        path: "/compras",
        element: <Compras />,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Proveedores",
        path: "/proveedores",
        element: <Proveedores />,
      },
      {
        icon: <WalletIcon {...icon} />,
        name: "Categoría de Insumos",
        path: "/categoriainsumos",
        element: <CategoriaInsumos />,
      },
      {
        icon: <CubeIcon {...icon} />,
        name: "Insumos",
        path: "/insumos",
        element: <Insumos />,
      },

      {
        icon: <ClipboardDocumentListIcon {...icon} />,
        name: "Ficha técnica",
        path: "/fichatecnica",
        element: <FichasTecnicas />,
      },
      {
        icon: <InboxStackIcon {...icon} />,
        name: "Productos",
        path: "/productoterminado",
        element: <ProductoTerminado />,
      },
    ],
  },
  {
    title: "Ventas",
    layout: "dashboard",
    visible: true,
    pages: [
      {
        icon: <DocumentCurrencyDollarIcon {...icon} />,
        name: "Gestión de Ventas",
        path: "/ventas",
        element: <Ventas />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Clientes",
        path: "/clientes",
        element: <Clientes />,
      },
      {
        icon: <PhoneIcon {...icon} />,
        name: "Pedidos",
        path: "/pedidos",
        element: <Pedidos />,
      },
    ],
  },
];

export function filterRoutes(routes, permissions) {
  return routes.map(route => ({
    ...route,
    pages: route.pages.filter(page => permissions.includes(page.name))
  })).filter(route => route.pages.length > 0);
}

export { allRoutes as default };