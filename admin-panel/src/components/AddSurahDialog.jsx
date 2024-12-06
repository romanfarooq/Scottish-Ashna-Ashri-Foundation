import toast from "react-hot-toast";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

export function AddSurahDialog({ fetchSurahs }) {
  const [newSurah, setNewSurah] = useState({
    surahNumber: "",
    name: "",
    englishName: "",
    meaning: "",
    ayat: [],
  });

  const handleAddSurah = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/surahs`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSurah,
          surahNumber: Number(newSurah.surahNumber),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        fetchSurahs();
      } else {
        toast.error(result.message);
      }
      setNewSurah({
        surahNumber: "",
        name: "",
        englishName: "",
        meaning: "",
        ayat: [],
      });
    } catch (error) {
      toast.error("Failed to add Surah");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white shadow-sm hover:bg-gray-50"
        >
          <Plus size={16} /> Add Surah
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Add New Surah
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Fill in the details below to add a new Surah to the collection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Surah Number
            </label>
            <Input
              placeholder="Enter Surah number"
              type="number"
              value={newSurah.surahNumber}
              onChange={(e) =>
                setNewSurah({ ...newSurah, surahNumber: e.target.value })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Arabic Name
            </label>
            <Input
              placeholder="Enter Arabic name"
              value={newSurah.name}
              onChange={(e) =>
                setNewSurah({ ...newSurah, name: e.target.value })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              English Name
            </label>
            <Input
              placeholder="Enter English name"
              value={newSurah.englishName}
              onChange={(e) =>
                setNewSurah({ ...newSurah, englishName: e.target.value })
              }
              className="focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Meaning</label>
            <Input
              placeholder="Enter meaning"
              value={newSurah.meaning}
              onChange={(e) =>
                setNewSurah({ ...newSurah, meaning: e.target.value })
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
            onClick={handleAddSurah}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Surah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
