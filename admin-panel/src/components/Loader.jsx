import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="flex items-center min-h-screen justify-center bg-white">
      <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
    </div>
  );
}
