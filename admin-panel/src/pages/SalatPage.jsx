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

export function SalatPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salats, setSalats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSalats, setfilteredSalats] = useState([]);
  const [selectedSalat, setSelectedSalat] = useState(null);
  const [salatToDelete, setSalatToDelete] = useState(null);
  const [newSalat, setNewSalat] = useState({
    title: "",
    subTitle: "",
    content: "",
  });

  const fetchSalat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/salats`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
      }
      setSalats(data.salats);
      setfilteredSalats(data.salats);
    } catch (error) {
      toast.error("Failed to load salats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalat();
  }, [fetchSalat]);

  useEffect(() => {
    const filtered = salats.filter((salat) => {
      return (
        salat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salat.subTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setfilteredSalats(filtered);
  }, [searchTerm, salats]);

  const handleAddSalat = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/salats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSalat),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        fetchSalat();
      } else {
        toast.error(result.message);
      }
      setNewSalat({
        title: "",
        subTitle: "",
        content: "",
      });
    } catch (error) {
      toast.error("Failed to add Salat");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (salatToDelete) {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/admin/salats/${salatToDelete._id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const result = await response.json();
        if (response.ok) {
          toast.success(result.message);
          fetchSalat();
        } else {
          toast.error(result.message);
        }
        setSalatToDelete(null);
      } catch (error) {
        toast.error("Failed to delete Salat");
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

  const navigateToSalatDetails = (salat) => {
    navigate(`/salat-details/${salat._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Salat's Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search salats..."
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
                    <Plus size={16} /> Add Salat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Add New Salat
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Fill in the details below to add a new Salat to the
                      collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        placeholder="Enter Salat Title"
                        value={newSalat.title}
                        onChange={(e) =>
                          setNewSalat({ ...newSalat, title: e.target.value })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Sub Title
                      </label>
                      <Input
                        placeholder="Enter Salat Sub Title (optional)"
                        value={newSalat.subTitle}
                        onChange={(e) =>
                          setNewSalat({ ...newSalat, subTitle: e.target.value })
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
                      onClick={handleAddSalat}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Salat
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
              {filteredSalats.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No salats found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSalats.map((salat, index) => (
                  <TableRow
                    key={salat._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {salat.title || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {salat.subTitle || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => navigateToSalatDetails(salat)}
                            >
                              <BookOpen size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            View Details
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => setSelectedSalat(salat)}
                            >
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Edit Salat
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="hover:bg-red-600"
                              onClick={() => setSalatToDelete(salat)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Delete Salat
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

      {selectedSalat && (
        <EditSalatDialog
          salat={selectedSalat}
          selectedSalat={selectedSalat}
          setSelectedSalat={setSelectedSalat}
          fetchSalat={fetchSalat}
        />
      )}
      <Dialog
        open={!!salatToDelete}
        onOpenChange={() => setSalatToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you sure you want to delete the Salat "{salatToDelete?.title}
              "? This action cannot be undone.
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
              Delete Salat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditSalatDialog({
  salat,
  selectedSalat,
  setSelectedSalat,
  fetchSalat,
}) {
  const [editedSalat, setEditedSalat] = useState(salat);

  const handleEditSalat = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/salats/${salat._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedSalat),
        },
      );

      const result = await response.json();
      if (response.ok) {
        fetchSalat();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setSelectedSalat(null);
    } catch (error) {
      toast.error("Failed to update handleEditSalat");
    }
  };

  return (
    <Dialog open={!!selectedSalat} onOpenChange={() => setSelectedSalat(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Salat
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to the handle Edit Salat below and click the "Update
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Specific Salat Title
          </label>
          <Input
            value={editedSalat.title}
            onChange={(e) =>
              setEditedSalat({ ...editedSalat, title: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Specific Salat Sub Title
          </label>
          <Input
            value={editedSalat.subTitle}
            onChange={(e) =>
              setEditedSalat({
                ...editedSalat,
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
            onClick={handleEditSalat}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Salat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
