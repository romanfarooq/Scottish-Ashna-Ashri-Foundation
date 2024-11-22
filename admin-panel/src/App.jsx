import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginLayout } from "./layouts/LoginLayout";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { OTPInputPage } from "./pages/OTPInputPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/otp-input", element: <OTPInputPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "*", element: <LoginPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
