import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { LoginLayout } from "./layouts/LoginLayout";
import { AboutPage } from "./pages/AboutPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OTPInputPage } from "./pages/OTPInputPage";
import { QuranTextPage } from "./pages/QuranTextPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SurahTextPage } from "./pages/SurahTextPage";
import { QuranAudioPage } from "./pages/QuranAudioPage";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          {
            path: "about",
            element: <AboutPage />,
          },
          {
            path: "quran-text",
            element: <QuranTextPage />,
          },
          {
            path: "surah-text/:surahNumber",
            element: <SurahTextPage />,
          },
          {
            path: "quran-audio",
            element: <QuranAudioPage />,
          },
        ],
      },
    ],
  },
  {
    element: <LoginLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "otp-input",
        element: <OTPInputPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
