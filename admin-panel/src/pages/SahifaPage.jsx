import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Pencil,
  Trash2,
  BookOpen,
  Plus,
  Loader2,
  SearchIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
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

export function SahifaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sahifas, setSahifas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSahifas, setFilteredSahifas] = useState([]);
  const [selectedSahifa, setSelectedSahifa] = useState(null);
  const [sahifaToDelete, setSahifaToDelete] = useState(null);
  const [newSahifa, setNewSahifa] = useState({
    title: "",
    subTitle: "",
    arabicTitle: "",
    text: "",
    translations: [],
  });

  const fetchSahifas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/sahifas`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
      }
      setSahifas(data.sahifas);
      setFilteredSahifas(data.sahifas);
    } catch (error) {
      toast.error("Failed to load sahifas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSahifas();
  }, [fetchSahifas]);

  useEffect(() => {
    const filtered = sahifas.filter((sahifa) => {
      return (
        sahifa.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sahifa.subTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredSahifas(filtered);
  }, [searchTerm, sahifas]);

  const handleAddSahifa = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/sahifas`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSahifa),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        fetchSahifas();
      } else {
        toast.error(result.message);
      }
      setNewSahifa({
        title: "",
        arabicTitle: "",
        subTitle: "",
        text: "",
        translations: [],
      });
    } catch (error) {
      toast.error("Failed to add Sahifa");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (sahifaToDelete) {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/admin/sahifas/${sahifaToDelete._id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const result = await response.json();
        if (response.ok) {
          toast.success(result.message);
          fetchSahifas();
        } else {
          toast.error(result.message);
        }
        setSahifaToDelete(null);
      } catch (error) {
        toast.error("Failed to delete Sahifa");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="mt-4 text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const navigateToSahifaDetails = (sahifa) => {
    navigate(`/sahifa-details/${sahifa._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Sahifa Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search sahifas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-300 bg-white pl-10"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white shadow-sm hover:bg-gray-50"
                  >
                    <Plus size={16} /> Add Sahifa
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Add New Sahifa
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Fill in the details below to add a new Sahifa to the
                      collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        placeholder="Enter Sahifa Title"
                        value={newSahifa.title}
                        onChange={(e) =>
                          setNewSahifa({ ...newSahifa, title: e.target.value })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Arabic Title
                      </label>
                      <Input
                        placeholder="Enter Sahifa Arabic Title"
                        value={newSahifa.arabicTitle}
                        onChange={(e) =>
                          setNewSahifa({
                            ...newSahifa,
                            arabicTitle: e.target.value,
                          })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Sub Title
                      </label>
                      <Input
                        placeholder="Enter Sahifa Sub Title (optional)"
                        value={newSahifa.subTitle}
                        onChange={(e) =>
                          setNewSahifa({
                            ...newSahifa,
                            subTitle: e.target.value,
                          })
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
                      onClick={handleAddSahifa}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Sahifa
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  Title
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Arabic Title
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Sub Title
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {filteredSahifas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No sahifas found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSahifas.map((sahifa, index) => (
                  <TableRow
                    key={sahifa._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {sahifa.title || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {sahifa.arabicTitle || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {sahifa.subTitle || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => navigateToSahifaDetails(sahifa)}
                            >
                              <BookOpen size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            View Sahifa Details
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => setSelectedSahifa(sahifa)}
                              title="Edit sahifa"
                            >
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Edit sahifa
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="hover:bg-red-600"
                              onClick={() => setSahifaToDelete(sahifa)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Delete sahifa
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedSahifa && (
        <EditSahifaDialog
          sahifa={selectedSahifa}
          selectedSahifa={selectedSahifa}
          setSelectedSahifa={setSelectedSahifa}
          fetchSahifas={fetchSahifas}
        />
      )}
      <Dialog
        open={!!sahifaToDelete}
        onOpenChange={() => setSahifaToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you sure you want to delete the Sahifa "
              {sahifaToDelete?.title}"? This action cannot be undone.
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
              Delete Sahifa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditSahifaDialog({
  sahifa,
  selectedSahifa,
  setSelectedSahifa,
  fetchSahifas,
}) {
  const [editedSahifa, setEditedSahifa] = useState(sahifa);

  const handleEditSahifa = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/sahifas/${sahifa._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedSahifa),
        },
      );

      const result = await response.json();
      if (response.ok) {
        fetchSahifas();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setSelectedSahifa(null);
    } catch (error) {
      toast.error("Failed to update sahifa");
    }
  };

  return (
    <Dialog
      open={!!selectedSahifa}
      onOpenChange={() => setSelectedSahifa(null)}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Sahifa
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to the sahifa information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Sahifa Title
          </label>
          <Input
            value={editedSahifa.title}
            onChange={(e) =>
              setEditedSahifa({ ...editedSahifa, title: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Sahifa Arabic Title
          </label>
          <Input
            value={editedSahifa.arabicTitle}
            onChange={(e) =>
              setEditedSahifa({ ...editedSahifa, arabicTitle: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Sahifa Sub Title
          </label>
          <Input
            value={editedSahifa.subTitle}
            onChange={(e) =>
              setEditedSahifa({
                ...editedSahifa,
                subTitle: e.target.value,
              })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="hover:bg-gray-50">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleEditSahifa}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Sahifa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
