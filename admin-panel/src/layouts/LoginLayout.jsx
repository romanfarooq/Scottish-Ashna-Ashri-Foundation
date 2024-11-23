import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/ui/grid-pattern";

export function LoginLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden bg-gray-100 p-8">
        <img
          src="/src/assets/images/logo.png"
          alt="Scottish Ashna Ashri Foundation Logo"
          className="z-10 mb-4 h-52 w-auto"
        />
        <h1 className="z-10 mb-4 text-center text-4xl font-bold text-gray-800">
          Scottish Ashna Ashri Foundation
        </h1>
        <p className="z-10 mb-8 text-center text-lg text-gray-600">
          Admin Panel for Scottish Ashna Ashri Foundation
        </p>
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [15, 10],
            [10, 15],
            [15, 10],
          ]}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
          )}
        />
      </div>
      <div className="flex flex-1 items-center justify-center bg-white">
        <Outlet />
      </div>
    </div>
  );
}
