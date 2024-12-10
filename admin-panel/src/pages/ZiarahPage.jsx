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

export function ZiarahPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ziarahs, setZiarahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredZiarahs, setFilteredZiarahs] = useState([]);
  const [selectedZiarah, setSelectedZiarah] = useState(null);
  const [ziarahToDelete, setZiarahToDelete] = useState(null);
  const [newZiarah, setNewZiarah] = useState({
    title: "",
    subTitle: "",
    arabicTitle: "",
    text: "",
    translations: [],
  });

  const fetchZiarahs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/ziarahs`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
      }
      setZiarahs(data.ziarahs);
      setFilteredZiarahs(data.ziarahs);
    } catch (error) {
      toast.error("Failed to load ziarahs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZiarahs();
  }, [fetchZiarahs]);

  useEffect(() => {
    const filtered = ziarahs.filter((ziarah) => {
      return (
        ziarah.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ziarah.subTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredZiarahs(filtered);
  }, [searchTerm, ziarahs]);

  const handleAddZiarah = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/ziarahs`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newZiarah),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        fetchZiarahs();
      } else {
        toast.error(result.message);
      }
      setNewZiarah({
        title: "",
        arabicTitle: "",
        subTitle: "",
        text: "",
        translations: [],
      });
    } catch (error) {
      toast.error("Failed to add Ziarah");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (ziarahToDelete) {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/admin/ziarahs/${ziarahToDelete._id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const result = await response.json();
        if (response.ok) {
          toast.success(result.message);
          fetchZiarahs();
        } else {
          toast.error(result.message);
        }
        setZiarahToDelete(null);
      } catch (error) {
        toast.error("Failed to delete Ziarah");
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

  const navigateToZiarahDetails = (ziarah) => {
    navigate(`/ziarah-details/${ziarah._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Ziarah Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search ziarahs..."
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
                    <Plus size={16} /> Add Ziarah
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Add New Ziarah
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Fill in the details below to add a new Ziarah to the
                      collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        placeholder="Enter Ziarah Title"
                        value={newZiarah.title}
                        onChange={(e) =>
                          setNewZiarah({ ...newZiarah, title: e.target.value })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Arabic Title
                      </label>
                      <Input
                        placeholder="Enter Ziarah Arabic Title"
                        value={newZiarah.arabicTitle}
                        onChange={(e) =>
                          setNewZiarah({
                            ...newZiarah,
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
                        placeholder="Enter Ziarah Sub Title (optional)"
                        value={newZiarah.subTitle}
                        onChange={(e) =>
                          setNewZiarah({
                            ...newZiarah,
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
                      onClick={handleAddZiarah}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Ziarah
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
              {filteredZiarahs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No ziarahs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredZiarahs.map((ziarah, index) => (
                  <TableRow
                    key={ziarah._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {ziarah.title || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {ziarah.arabicTitle || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {ziarah.subTitle || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => navigateToZiarahDetails(ziarah)}
                            >
                              <BookOpen size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            View Ziarah Details
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => setSelectedZiarah(ziarah)}
                              title="Edit ziarah"
                            >
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Edit ziarah
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="hover:bg-red-600"
                              onClick={() => setZiarahToDelete(ziarah)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Delete ziarah
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

      {selectedZiarah && (
        <EditZiarahDialog
          ziarah={selectedZiarah}
          selectedZiarah={selectedZiarah}
          setSelectedZiarah={setSelectedZiarah}
          fetchZiarahs={fetchZiarahs}
        />
      )}
      <Dialog
        open={!!ziarahToDelete}
        onOpenChange={() => setZiarahToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you sure you want to delete the Ziarah "
              {ziarahToDelete?.title}"? This action cannot be undone.
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
              Delete Ziarah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditZiarahDialog({
  ziarah,
  selectedZiarah,
  setSelectedZiarah,
  fetchZiarahs,
}) {
  const [editedZiarah, setEditedZiarah] = useState(ziarah);

  const handleEditZiarah = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/ziarahs/${ziarah._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedZiarah),
        },
      );

      const result = await response.json();
      if (response.ok) {
        fetchZiarahs();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setSelectedZiarah(null);
    } catch (error) {
      toast.error("Failed to update ziarah");
    }
  };

  return (
    <Dialog
      open={!!selectedZiarah}
      onOpenChange={() => setSelectedZiarah(null)}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Ziarah
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to the ziarah information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ziarah Title
          </label>
          <Input
            value={editedZiarah.title}
            onChange={(e) =>
              setEditedZiarah({ ...editedZiarah, title: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ziarah Arabic Title
          </label>
          <Input
            value={editedZiarah.arabicTitle}
            onChange={(e) =>
              setEditedZiarah({ ...editedZiarah, arabicTitle: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ziarah Sub Title
          </label>
          <Input
            value={editedZiarah.subTitle}
            onChange={(e) =>
              setEditedZiarah({
                ...editedZiarah,
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
            onClick={handleEditZiarah}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Ziarah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
