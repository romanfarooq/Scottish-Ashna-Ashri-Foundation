import toast from "react-hot-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
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

export function EditSurahDialog({
  surah,
  fetchSurahs,
  selectedSurah,
  setSelectedSurah,
}) {
  const [editedSurah, setEditedSurah] = useState(surah);

  const handleEditSurah = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surah.surahNumber}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedSurah),
        },
      );

      const result = await response.json();
      if (response.ok) {
        fetchSurahs(); // Refresh the list
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setSelectedSurah(null);
    } catch (error) {
      toast.error("Failed to update Surah");
    }
  };

  return (
    <Dialog open={!!selectedSurah} onOpenChange={() => setSelectedSurah(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Surah
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to the Surah information below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Surah Number
            </label>
            <Input
              type="number"
              value={editedSurah.surahNumber}
              onChange={(e) =>
                setEditedSurah({
                  ...editedSurah,
                  surahNumber: Number(e.target.value),
                })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Arabic Name
            </label>
            <Input
              value={editedSurah.name}
              onChange={(e) =>
                setEditedSurah({ ...editedSurah, name: e.target.value })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              English Name
            </label>
            <Input
              value={editedSurah.englishName}
              onChange={(e) =>
                setEditedSurah({
                  ...editedSurah,
                  englishName: e.target.value,
                })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Meaning</label>
            <Input
              value={editedSurah.meaning}
              onChange={(e) =>
                setEditedSurah({ ...editedSurah, meaning: e.target.value })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Juzz Number</label>
            <Input
              value={editedSurah.juzzNumber}
              onChange={(e) =>
                setEditedSurah({ ...editedSurah, juzzNumber: e.target.value })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="hover:bg-gray-50">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleEditSurah}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Surah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
