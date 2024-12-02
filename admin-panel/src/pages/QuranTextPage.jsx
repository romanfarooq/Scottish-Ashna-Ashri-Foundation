import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranTextPage() {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahToDelete, setSurahToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Surahs on component mount
  useEffect(() => {
    fetchSurahs();
  }, []);

  // Fetch Surahs from backend
  const fetchSurahs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/surahs`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
      }
      setSurahs(data.surahs);
    } catch (error) {
      toast.error("Failed to load Surahs");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        <p className="ml-4 text-lg font-semibold">Loading Surahs...</p>
      </div>
    );
  }

  // Navigation to Ayat Page
  const navigateToAyat = (surah) => {
    navigate(`/surah-text/${surah.surahNumber}`);
  };

  // Add Surah Dialog Component
  const AddSurahDialog = () => {
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
          fetchSurahs(); // Refresh the list
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
          <Button variant="outline" className="flex items-center gap-2">
            <Plus size={16} /> Add Surah
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add New Surah</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Surah Number"
              type="number"
              value={newSurah.surahNumber}
              onChange={(e) =>
                setNewSurah({ ...newSurah, surahNumber: e.target.value })
              }
            />
            <Input
              placeholder="Arabic Name"
              value={newSurah.name}
              onChange={(e) =>
                setNewSurah({ ...newSurah, name: e.target.value })
              }
            />
            <Input
              placeholder="English Name"
              value={newSurah.englishName}
              onChange={(e) =>
                setNewSurah({ ...newSurah, englishName: e.target.value })
              }
            />
            <Input
              placeholder="Meaning"
              value={newSurah.meaning}
              onChange={(e) =>
                setNewSurah({ ...newSurah, meaning: e.target.value })
              }
            />
            <Button onClick={handleAddSurah}>Save Surah</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Deletion Confirmation Dialog
  const DeleteConfirmationDialog = () => {
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
            fetchSurahs(); // Refresh the list
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
      <Dialog
        open={!!surahToDelete}
        onOpenChange={() => setSurahToDelete(null)}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the Surah "
              {surahToDelete?.englishName}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Edit Surah Dialog Component
  const EditSurahDialog = ({ surah }) => {
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
      <Dialog
        open={!!selectedSurah}
        onOpenChange={() => setSelectedSurah(null)}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Surah</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Surah Number"
              type="number"
              value={editedSurah.surahNumber}
              onChange={(e) =>
                setEditedSurah({
                  ...editedSurah,
                  surahNumber: Number(e.target.value),
                })
              }
            />
            <Input
              placeholder="Arabic Name"
              value={editedSurah.name}
              onChange={(e) =>
                setEditedSurah({ ...editedSurah, name: e.target.value })
              }
            />
            <Input
              placeholder="English Name"
              value={editedSurah.englishName}
              onChange={(e) =>
                setEditedSurah({ ...editedSurah, englishName: e.target.value })
              }
            />
            <Input
              placeholder="Meaning"
              value={editedSurah.meaning}
              onChange={(e) =>
                setEditedSurah({ ...editedSurah, meaning: e.target.value })
              }
            />
            <Button onClick={handleEditSurah}>Update Surah</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-4">
      {/* Add Toaster for notifications */}
      <Toaster position="top-right" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Surah Management</h2>
        <AddSurahDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Arabic Name</TableHead>
            <TableHead>English Name</TableHead>
            <TableHead>Meaning</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surahs.map((surah) => (
            <TableRow key={surah.surahNumber}>
              <TableCell>{surah.surahNumber}</TableCell>
              <TableCell>{surah.name || "N/A"}</TableCell>
              <TableCell>{surah.englishName || "N/A"}</TableCell>
              <TableCell>{surah.meaning || "N/A"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateToAyat(surah)}
                    title="View Ayat"
                  >
                    <BookOpen size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedSurah(surah)}
                    title="Edit Surah"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setSurahToDelete(surah)}
                    title="Delete Surah"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialogs */}
      {selectedSurah && <EditSurahDialog surah={selectedSurah} />}
      <DeleteConfirmationDialog />
    </div>
  );
}
