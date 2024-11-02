import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import Layout from "./Components/Layout";
import NotFoundPage from "./Pages/NotFoundPage";
import ValidatedLoginForm from "./Pages/Login";
import Dashboard from "./Pages/Dashboard"
import EditProduct from './Pages/EditProduct'
import Inventory from "./Pages/Inventory";
import AddProduct from "./Pages/AddProduct";
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

const App = () => {
  
  const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path='/inventory' element={<Inventory/>}/>
        <Route path='/sales' element={<Sales/>}/>
        <Route path='/report' element={<Report/>}/>
        <Route path='/batch-sale' element={<BatchSale/>}/>
        <Route path='/sales-history' element={<SalesHistory/>}/>
        <Route path='/stock-movement' element={<StockMovement/>}/>
        <Route path='/notification' element={<Notification/>}/>
        <Route path='/movement-detail/:id' element={<ViewMovementDetail/>}/>
        <Route path='/sales-detail/:id' element={<ViewSaleDetail/>}/>
        <Route path='/add-product' element={<AddProduct/>}/>
        <Route path='/return-product/:id' element={<ReturnProduct/>}/>
        <Route path='*' element={<NotFoundPage />} />
        <Route path='/edit-product/:id' element={<EditProduct />} />
        <Route path='/record-sale/:id' element={<RecordSale />} />
        {/* <Route path='/record-sale' element={<RecordSale />} />use as props */}
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/user-admin' element={<UserAdmin />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/userlogin' element={<ValidatedLoginForm />} />
        {/* <Route path='/account/:id' element={<Account  />} loader={userLoader} />
        <Route path='/changepassword/:id' element={<ChangePassword />} /> */}
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;
