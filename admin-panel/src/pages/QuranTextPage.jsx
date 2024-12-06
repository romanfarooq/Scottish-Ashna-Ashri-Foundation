import { useState, useEffect, useCallback } from "react";
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
import {
  Pencil,
  Trash2,
  Plus,
  BookOpen,
  Loader2,
  SearchIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranTextPage() {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahToDelete, setSurahToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch and Filter Surahs
  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    const filtered = surahs.filter((surah) => {
      return (
        (surah.name &&
          surah.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (surah.englishName &&
          surah.englishName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (surah.surahNumber && surah.surahNumber.toString().includes(searchTerm))
      );
    });
    setFilteredSurahs(filtered);
  }, [searchTerm, surahs]);

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
      setFilteredSurahs(data.surahs);
    } catch (error) {
      toast.error("Failed to load Surahs");
    } finally {
      setLoading(false);
    }
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="mt-4 text-xl text-gray-600">Loading Surahs...</p>
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
              <label className="text-sm font-medium text-gray-700">
                Meaning
              </label>
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
  };

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Edit Surah
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Make changes to the Surah information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
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
              <label className="text-sm font-medium text-gray-700">
                Meaning
              </label>
              <Input
                value={editedSurah.meaning}
                onChange={(e) =>
                  setEditedSurah({ ...editedSurah, meaning: e.target.value })
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Surah Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search Surahs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-300 bg-white pl-10"
                />
              </div>
              <AddSurahDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="text-center text-gray-600">
                  Number
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Arabic Name
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  English Name
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Meaning
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {filteredSurahs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No Surahs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSurahs.map((surah) => (
                  <TableRow
                    key={surah.surahNumber}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {surah.surahNumber}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {surah.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {surah.englishName || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {surah.meaning || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          onClick={() => navigateToAyat(surah)}
                          title="View Ayat"
                        >
                          <BookOpen size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={() => setSelectedSurah(surah)}
                          title="Edit Surah"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="hover:bg-red-600"
                          onClick={() => setSurahToDelete(surah)}
                          title="Delete Surah"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs remain the same */}
      {selectedSurah && <EditSurahDialog surah={selectedSurah} />}
      <DeleteConfirmationDialog />
    </div>
  );
}
