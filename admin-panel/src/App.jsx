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
import { QuranImagesPage } from "./pages/QuranImagesPage";
import { QuranImagesTajweedPage } from "./pages/QuranImagesTajweedPage";
import { DuaPage } from "./pages/DuaPage";
import { DuaDetailPage } from "./pages/DuaDetailPage";
import { ZiarahPage } from "./pages/ZiarahPage";
import { ZiarahDetailPage } from "./pages/ZiarahDetailPage";
import { TaqibaatPage } from "./pages/TaqibaatPage";
import { TaqibaatDetailPage } from "./pages/TaqibaatDetailsPage";
import { SahifaPage } from "./pages/SahifaPage";
import { SahifaDetailPage } from "./pages/SahifaDetailsPage";

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
          {
            path: "quran-images",
            element: <QuranImagesPage />,
          },
          {
            path: "quran-tajweed-images",
            element: <QuranImagesTajweedPage />,
          },
          {
            path: "dua",
            element: <DuaPage />,
          },
          {
            path: "dua-details/:duaId",
            element: <DuaDetailPage />,
          },
          {
            path: "ziarah",
            element: <ZiarahPage />,
          },
          {
            path: "ziarah-details/:ziarahId",
            element: <ZiarahDetailPage />,
          },
          {
            path: "taqibaat",
            element: <TaqibaatPage />,
          },
          {
            path: "taqibaat-details/:taqibaatId",
            element: <TaqibaatDetailPage />,
          },
          {
            path: "sahifa",
            element: <SahifaPage />,
          },
          {
            path: "sahifa-details/:sahifaId",
            element: <SahifaDetailPage />,
          }
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
