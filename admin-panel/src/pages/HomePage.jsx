import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL;

export function HomePage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/logout`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        navigate("/login");
      } else {
        toast.error(result.message || "Logout failed");
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome to the Admin Panel
      </h1>
      <p className="text-lg text-gray-600">You are logged in!</p>
      <Button
        onClick={handleLogout}
        className="rounded-lg bg-red-500 px-6 py-2 text-white transition hover:bg-red-600"
      >
        Logout
      </Button>
    </div>
  );
}
