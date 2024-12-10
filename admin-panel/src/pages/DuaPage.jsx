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

export function DuaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [duas, setDuas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDuas, setfilteredDuas] = useState([]);
  const [selectedDua, setSelectedDua] = useState(null);
  const [duaToDelete, setDuaToDelete] = useState(null);
  const [newDua, setNewDua] = useState({
    title: "",
    subTitle: "",
    text: "",
    translations: [],
  });

  const fetchDuas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/duas`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
      }
      setDuas(data.duas);
      setfilteredDuas(data.duas);
    } catch (error) {
      toast.error("Failed to load duas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDuas();
  }, [fetchDuas]);

  useEffect(() => {
    const filtered = duas.filter((dua) => {
      return (
        dua.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dua.subTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setfilteredDuas(filtered);
  }, [searchTerm, duas]);

  const handleAddDua = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/duas`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDua),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        fetchDuas();
      } else {
        toast.error(result.message);
      }
      setNewDua({
        title: "",
        subTitle: "",
        text: "",
        translations: [],
      });
    } catch (error) {
      toast.error("Failed to add Dua");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (duaToDelete) {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/admin/duas/${duaToDelete._id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const result = await response.json();
        if (response.ok) {
          toast.success(result.message);
          fetchDuas();
        } else {
          toast.error(result.message);
        }
        setDuaToDelete(null);
      } catch (error) {
        toast.error("Failed to delete Dua");
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

  const navigateToDuaDetails = (dua) => {
    navigate(`/dua-details/${dua._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Dua's Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search duas..."
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
                    <Plus size={16} /> Add Dua
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Add New Dua
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Fill in the details below to add a new Dua to the
                      collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        placeholder="Enter Dua Title"
                        value={newDua.title}
                        onChange={(e) =>
                          setNewDua({ ...newDua, title: e.target.value })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Sub Title
                      </label>
                      <Input
                        placeholder="Enter Dua Sub Title (optional)"
                        value={newDua.subTitle}
                        onChange={(e) =>
                          setNewDua({ ...newDua, subTitle: e.target.value })
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
                      onClick={handleAddDua}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Dua
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
                  Sub Title
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {filteredDuas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No duas found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDuas.map((dua, index) => (
                  <TableRow
                    key={dua._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {dua.title || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {dua.subTitle || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => navigateToDuaDetails(dua)}
                            >
                              <BookOpen size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            View Dua Details
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => setSelectedDua(dua)}
                              title="Edit dua"
                            >
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Edit dua
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="hover:bg-red-600"
                              onClick={() => setDuaToDelete(dua)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Delete dua
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

      {selectedDua && (
        <EditduaDialog
          dua={selectedDua}
          selectedDua={selectedDua}
          setSelectedDua={setSelectedDua}
          fetchDuas={fetchDuas}
        />
      )}
      <Dialog open={!!duaToDelete} onOpenChange={() => setDuaToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you sure you want to delete the Dua "{duaToDelete?.title}"?
              This action cannot be undone.
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
              Delete Dua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditduaDialog({ dua, selectedDua, setSelectedDua, fetchDuas }) {
  const [editedDua, setEditedDua] = useState(dua);

  const handleEditDua = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/duas/${dua._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedDua),
      });

      const result = await response.json();
      if (response.ok) {
        fetchDuas();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setSelectedDua(null);
    } catch (error) {
      toast.error("Failed to update handleEditDua");
    }
  };

  return (
    <Dialog open={!!selectedDua} onOpenChange={() => setSelectedDua(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Dua
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to the handleEditDua information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Dua Title</label>
          <Input
            value={editedDua.title}
            onChange={(e) =>
              setEditedDua({ ...editedDua, title: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Dua Sub Title
          </label>
          <Input
            value={editedDua.subTitle}
            onChange={(e) =>
              setEditedDua({
                ...editedDua,
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
            onClick={handleEditDua}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Dua
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
