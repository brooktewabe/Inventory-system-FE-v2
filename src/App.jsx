import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import PropTypes from "prop-types";
import HomePage from "./Pages/HomePage";
import Layout from "./Components/Layout";
import NotFoundPage from "./Pages/NotFoundPage";
import ValidatedLoginForm from "./Pages/Login";
import Dashboard from "./Pages/Dashboard"
import EditProduct from './Pages/EditProduct'
import AddProductStore from "./Pages/AddProductStore";
import AddProductWarehouse from "./Pages/AddProductWarehouse";
import ReturnProduct from "./Pages/ReturnProduct";
import StockMovement from "./Pages/StockMovement";
import ViewMovementDetail from './Pages/ViewMovementDetail'
import Sales from "./Pages/Sales";
import RecordSale from "./Pages/RecordSale";
import SalesHistory from "./Pages/SalesHistory";
import ViewSaleDetail from "./Pages/ViewSaleDetail";
import Notification from "./Pages/Notification";
import Report from "./Pages/Report";
import UserAdmin from "./Pages/UserAdmin";
import Settings from "./Pages/Settings";
import BatchSale from "./Pages/BatchSale";
import ChooseMethod from "./Pages/ChooseMethod";
import SelectMethod from "./Pages/SelectMethods";
import ImportExcel from "./Pages/ImportExcel";
import Fields from "./Pages/Fields";
import CMSList from "./Pages/CMSList";
import CMSDetails from "./Pages/CMSDetails";
import ManageOptions from "./Pages/ManageOptions";
import StockDetails from "./Pages/StockDetails";
import WarehouseDashboard from "./Pages/WarehouseDashboard";
import UnauthorizedAccess from "./Components/UnauthorizedAccess";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import PurchaseRequisition from "./Pages/PurchaseRequisition";
import AddPurchaseRequisition from "./Pages/AddPurchaseRequisition";


const App = () => {

  const router = createBrowserRouter(
    createRoutesFromElements(
      
      <Route path='/' element={<Layout />}>
        <Route path='/login' element={<ValidatedLoginForm />} />
        <Route path='/forgot-password' element={<ForgotPassword/>} /> 
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route index element={<HomePage />} />

        {/*  require 'dashboard' permission */}
        <Route 
          path='/dashboard'
          element={<ProtectedRoute element={Dashboard} requiredPermissions={['dashboard']} />}
        />

        {/*  require 'notification' permission */}
        <Route
          path='/notification' 
          element={<ProtectedRoute element={Notification} requiredPermissions={['notification']} />}
        />

        {/* require 'add' permission */}
        <Route
          path='/add-store-product'
          element={<ProtectedRoute element={AddProductStore} requiredPermissions={['add']} />}
        />
        <Route
          path='/choose-method'
          element={<ProtectedRoute element={ChooseMethod} requiredPermissions={['add']} />}
        />
        <Route
          path='/add-warehouse-product'
          element={<ProtectedRoute element={AddProductWarehouse} requiredPermissions={['add']} />}
        />
        <Route
          path='/select-method'
          element={<ProtectedRoute element={SelectMethod} requiredPermissions={['add']} />}
        />
        <Route
          path='/import'
          element={<ProtectedRoute element={ImportExcel} requiredPermissions={['add']} />}
        />
        <Route
          path='/purchase-requisition'
          element={<ProtectedRoute element={PurchaseRequisition} requiredPermissions={['add']} />}
        />
        <Route
          path='/add-purchase-requisition'
          element={<ProtectedRoute element={AddPurchaseRequisition} requiredPermissions={['add']} />}
        />

        {/* permission - store */}
        <Route 
          path='/sales' 
          element={<ProtectedRoute element={Sales} requiredPermissions={['store']} />} 
        />
        <Route 
          path='/stock-movement' 
          element={<ProtectedRoute element={StockMovement} requiredPermissions={['store','inventory']} />} 
        />
        <Route 
          path='/movement-detail/:id' 
          element={<ProtectedRoute element={ViewMovementDetail} requiredPermissions={['store','inventory']} />} 
        />
        <Route 
          path='/sales-detail/:id' 
          element={<ProtectedRoute element={ViewSaleDetail} requiredPermissions={['store']} />} 
        />
        <Route 
          path='/edit-product/:id' 
          element={<ProtectedRoute element={EditProduct} requiredPermissions={['store','inventory']} />} 
        />
        <Route 
          path='/stock-details/:id' 
          element={<ProtectedRoute element={StockDetails} requiredPermissions={['store','inventory']} />} 
        />
        <Route 
          path='/return-product/:id' 
          element={<ProtectedRoute element={ReturnProduct} requiredPermissions={['store']} />} 
        />
        <Route 
          path='/batch-sale' 
          element={<ProtectedRoute element={BatchSale} requiredPermissions={['store']} />} 
        />
        <Route 
          path='/record-sale' 
          element={<ProtectedRoute element={RecordSale} requiredPermissions={['store']} />} 
        />

        {/* permission - inventory */}
        <Route 
          path='/warehouse' 
          element={<ProtectedRoute element={WarehouseDashboard} requiredPermissions={['inventory']} />} 
        />

        {/* permission - cms */}
        <Route 
          path='/customer-details/:id' 
          element={<ProtectedRoute element={CMSDetails} requiredPermissions={['cms']} />} 
        />
        <Route 
          path='/customers-list' 
          element={<ProtectedRoute element={CMSList} requiredPermissions={['cms']} />} 
        />

        {/* report - assuming these need store permission */}
        <Route 
          path='/sales-history' 
          element={<ProtectedRoute element={SalesHistory} requiredPermissions={['store']} />} 
        />
        <Route 
          path='/report' 
          element={<ProtectedRoute element={Report} requiredPermissions={['store']} />} 
        />

        {/* permission - settings */}
        <Route
          path='/user-admin'
          element={<ProtectedRoute element={UserAdmin} requiredPermissions={['settings']} />}
        />
        <Route 
          path='/manage-options' 
          element={<ProtectedRoute element={ManageOptions} requiredPermissions={['settings']} />} 
        />
        <Route 
          path='/add-fields' 
          element={<ProtectedRoute element={Fields} requiredPermissions={['settings']} />} 
        />
        <Route 
          path='/settings' 
          element={<ProtectedRoute element={Settings} requiredPermissions={['settings']} />} 
        />

        <Route path='*' element={<NotFoundPage />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

const ProtectedRoute = ({ element: Component, requiredPermissions }) => {
  const permissions = localStorage.getItem("permissions");

  const hasAccess = requiredPermissions.some(p => permissions.includes(p));

  if (!hasAccess) {
    return <UnauthorizedAccess/>;
  }

  return <Component />;
};

ProtectedRoute.propTypes = {
  element: PropTypes.elementType.isRequired,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default App;