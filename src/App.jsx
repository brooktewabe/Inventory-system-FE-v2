import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Layout from "./Components/Layout";
import NotFoundPage from "./Pages/NotFoundPage";
import Spinner from "./Components/Spinner";

const HomePage = lazy(() => import("./Pages/HomePage"));
const ValidatedLoginForm = lazy(() => import("./Pages/Login"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const EditProduct = lazy(() => import("./Pages/EditProduct"));
const Inventory = lazy(() => import("./Pages/Inventory"));
const AddProduct = lazy(() => import("./Pages/AddProduct"));
const StockMovement = lazy(() => import("./Pages/StockMovement"));
const ViewMovementDetail = lazy(() => import("./Pages/ViewMovementDetail"));
const Sales = lazy(() => import("./Pages/Sales"));
const RecordSale = lazy(() => import("./Pages/RecordSale"));
const SalesHistory = lazy(() => import("./Pages/SalesHistory"));
const ViewSaleDetail = lazy(() => import("./Pages/ViewSaleDetail"));
const Notification = lazy(() => import("./Pages/Notification"));
const Report = lazy(() => import("./Pages/Report"));
const UserAdmin = lazy(() => import("./Pages/UserAdmin"));
const Settings = lazy(() => import("./Pages/Settings"));
const BatchSale = lazy(() => import("./Pages/BatchSale"));
const Credits = lazy(() => import("./Pages/Credits"));
const AddRawMaterial = lazy(() => import("./Pages/AddRawMaterial"));
const SalesRaw = lazy(() => import("./Pages/SalesRaw"));
const BatchUsage = lazy(() => import("./Pages/BatchUsage"));
const InventoryRaw = lazy(() => import("./Pages/InventoryRaw"));
const FinishedInventory = lazy(() => import("./Pages/FinishedInventory"));
const InventoryLayout = lazy(() => import("./Pages/InventoryLayout"));
const RecordingLayout = lazy(() => import("./Pages/RecordingLayout"));
const AddProducedProduct = lazy(() => import("./Pages/AddProducedProduct"));
const AddRawMaterialKomche = lazy(() => import("./Pages/AddRawMaterialKomche"));
const ReturnProduct = lazy(() => import("./Pages/ReturnProduct"));
const RecordUsage = lazy(() => import("./Pages/RecordUsage"));
// Preload High-Priority Pages (Dashboard, Inventory, Sales)
const PreloadImportantPages = () => {
  useEffect(() => {
    import("./Pages/Dashboard");
    import("./Pages/Inventory");
    import("./Pages/Sales");
  }, []);

  return null;
};

// Loading Component
const Loading = () => <Spinner />;

const App = () => {
  return (
    <>
      {/* <PreloadImportantPages /> Preload important pages */}
      <RouterProvider
        router={createBrowserRouter(
          createRoutesFromElements(
            <Route path="/" element={<Layout />}>
              <Route index element={<Suspense fallback={<Loading />}><HomePage /></Suspense>} />
              <Route path="/inventory" element={<Suspense fallback={<Loading />}><Inventory /></Suspense>} />
              <Route path="/sales" element={<Suspense fallback={<Loading />}><Sales /></Suspense>} />
              <Route path="/report" element={<Suspense fallback={<Loading />}><Report /></Suspense>} />
              <Route path="/sales-history" element={<Suspense fallback={<Loading />}><SalesHistory /></Suspense>} />
              <Route path="/stock-movement" element={<Suspense fallback={<Loading />}><StockMovement /></Suspense>} />
              <Route path="/notification" element={<Suspense fallback={<Loading />}><Notification /></Suspense>} />
              <Route path="/movement-detail/:id" element={<Suspense fallback={<Loading />}><ViewMovementDetail /></Suspense>} />
              <Route path="/sales-detail/:id" element={<Suspense fallback={<Loading />}><ViewSaleDetail /></Suspense>} />
              <Route path="/add-product" element={<Suspense fallback={<Loading />}><AddProduct /></Suspense>} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/edit-product/:id" element={<Suspense fallback={<Loading />}><EditProduct /></Suspense>} />
              <Route path="/record-sale" element={<Suspense fallback={<Loading />}><RecordSale /></Suspense>} />
              <Route path="/dashboard" element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
              <Route path="/user-admin" element={<Suspense fallback={<Loading />}><UserAdmin /></Suspense>} />
              <Route path="/userlogin" element={<Suspense fallback={<Loading />}><ValidatedLoginForm /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<Loading />}><Settings /></Suspense>} />
              <Route path="/batch-sale" element={<Suspense fallback={<Loading />}><BatchSale /></Suspense>} />
              <Route path="/credits" element={<Suspense fallback={<Loading />}><Credits /></Suspense>} />
              <Route path="/add-raw-material" element={<Suspense fallback={<Loading />}><AddRawMaterial /></Suspense>} />
              <Route path="/sales-raw" element={<Suspense fallback={<Loading />}><SalesRaw /></Suspense>} />
              <Route path="/batch-usage" element={<Suspense fallback={<Loading />}><BatchUsage /></Suspense>} />
              <Route path="/inventory-raw" element={<Suspense fallback={<Loading />}><InventoryRaw /></Suspense>} />
              <Route path="/finished-inventory" element={<Suspense fallback={<Loading />}><FinishedInventory /></Suspense>} />
              <Route path="/inventory-layout" element={<Suspense fallback={<Loading />}><InventoryLayout /></Suspense>} />
              <Route path="/record-layout" element={<Suspense fallback={<Loading />}><RecordingLayout /></Suspense>} />
              <Route path="/add-produced-product" element={<Suspense fallback={<Loading />}><AddProducedProduct /></Suspense>} />
              <Route path="/add-raw-material-komche" element={<Suspense fallback={<Loading />}><AddRawMaterialKomche /></Suspense>} />
              <Route path="/return-product" element={<Suspense fallback={<Loading />}><ReturnProduct /></Suspense>} />
              <Route path="/record-usage" element={<Suspense fallback={<Loading />}><RecordUsage /></Suspense>} />
            </Route>
          )
        )}
      />
    </>
  );
};

export default App;
