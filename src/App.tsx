// import { Route,Routes } from "react-router-dom";

// import VendorRegistration from "./VendorRegistration";
// import CitizenRegistration from "./Citizen";
// import EventServicesPage from "./EventServices";
// import Favrs from "./Favrs";
// import CitizenDashboard from "./CitizenDash";
// import Navbar from "./Navbar";
// import Signup from "./Signup";
// import Login from "./Login";
// import VendorDashboard from "./VendorDash";

// import Index from "./Index";

// function App(){
//   return(
//     <>
//     {/* <VendorRegistration></VendorRegistration> */}
//     {/* <CitizenRegistration></CitizenRegistration>*/}
//      {/* <EventServicesPage></EventServicesPage>  */}
//     {/* <Favrs></Favrs> */}

//     <Routes>
//       <Route path="/" element={<Navbar></Navbar>}> </Route>
//       <Route path="/signup" element={<Signup></Signup>}></Route>
//       <Route path="/login" element={<Login></Login>}> </Route>
//       <Route path="/citizendash" element={<CitizenDashboard />} />
//       <Route path="/vendordash" element={<VendorDashboard />} />
//     </Routes> 

//     {/* <CitizenDashboard></CitizenDashboard> */}
//     {/* <VendorDashboard></VendorDashboard> */}
    

//       <Index></Index>
    

//     </>

    
//   )
// }
// export default App;


import { Route, Routes } from "react-router-dom";

import Navbar from "./Navbar";

import Signup from "./Signup";
import Login from "./Login";
import Index from "./Index";

import CitizenDashboard from "./CitizenDash";
import VendorDashboard from "./VendorDash";
import AdminDash from "./AdminDash";

function App() {

  return (
    <>
  
      <Routes>
        <Route path="/admin" element={<AdminDash></AdminDash>}></Route>

        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Navbar currentPage="home" />
              <Index />
            </>
          }
        />

        {/* Signup Page */}
        <Route
          path="/signup"
          element={
            <>
              <Navbar currentPage="signup" />
              <Signup />
            </>
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <>
              <Navbar currentPage="login" />
              <Login />
            </>
          }
        />

        {/* Citizen Dashboard */}
        <Route
          path="/citizendash"
          element={
            <>
              <Navbar currentPage="dashboard" />
              <CitizenDashboard />
            </>
          }
        />

        {/* Vendor Dashboard */}
        <Route
          path="/vendordash"
          element={
            <>
              <Navbar currentPage="dashboard" />
              <VendorDashboard />
            </>
          }
        />

      </Routes>

    </>
  );
}

export default App;
