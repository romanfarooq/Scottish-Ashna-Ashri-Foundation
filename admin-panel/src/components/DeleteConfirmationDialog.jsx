import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

export function DeleteConfirmationDialog({
  fetchSurahs,
  surahToDelete,
  setSurahToDelete,
}) {
  const handleDeleteConfirmed = async () => {
    if (surahToDelete) {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/admin/surahs/${surahToDelete.surahNumber}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const result = await response.json();
        if (response.ok) {
          toast.success(result.message);
          fetchSurahs();
        } else {
          toast.error(result.message);
        }
        setSurahToDelete(null);
      } catch (error) {
        toast.error("Failed to delete Surah");
      }
    }
  };

  return (
    <Dialog open={!!surahToDelete} onOpenChange={() => setSurahToDelete(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-500">
            Are you sure you want to delete the Surah "
            {surahToDelete?.englishName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="hover:bg-gray-50">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirmed}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Surah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
