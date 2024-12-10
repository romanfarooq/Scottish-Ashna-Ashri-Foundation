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

export function SermonPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sermons, setSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [sermonToDelete, setSermonToDelete] = useState(null);
  const [newSermon, setNewSermon] = useState({
    title: "",
    subTitle: "",
    arabicTitle: "",
    text: "",
    translations: [],
  });

  const fetchSermons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/sermons`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
      }
      setSermons(data.sermons);
      setFilteredSermons(data.sermons);
    } catch (error) {
      toast.error("Failed to load sermons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSermons();
  }, [fetchSermons]);

  useEffect(() => {
    const filtered = sermons.filter((sermon) => {
      return (
        sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.subTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredSermons(filtered);
  }, [searchTerm, sermons]);

  const handleAddSermon = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/sermons`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSermon),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        fetchSermons();
      } else {
        toast.error(result.message);
      }
      setNewSermon({
        title: "",
        arabicTitle: "",
        subTitle: "",
        text: "",
        translations: [],
      });
    } catch (error) {
      toast.error("Failed to add sermon");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (sermonToDelete) {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/admin/sermons/${sermonToDelete._id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const result = await response.json();
        if (response.ok) {
          toast.success(result.message);
          fetchSermons();
        } else {
          toast.error(result.message);
        }
        setSermonToDelete(null);
      } catch (error) {
        toast.error("Failed to delete sermon");
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

  const navigateToSermonDetails = (sermon) => {
    navigate(`/sermon-details/${sermon._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Sermon Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search sermons..."
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
                    <Plus size={16} /> Add Sermon
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Add New Sermon
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Fill in the details below to add a new sermon to the
                      collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        placeholder="Enter Sermon Title"
                        value={newSermon.title}
                        onChange={(e) =>
                          setNewSermon({ ...newSermon, title: e.target.value })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Arabic Title
                      </label>
                      <Input
                        placeholder="Enter Sermon Arabic Title"
                        value={newSermon.arabicTitle}
                        onChange={(e) =>
                          setNewSermon({
                            ...newSermon,
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
                        placeholder="Enter Sermon Sub Title (optional)"
                        value={newSermon.subTitle}
                        onChange={(e) =>
                          setNewSermon({
                            ...newSermon,
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
                      onClick={handleAddSermon}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Sermon
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
              {filteredSermons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No sermons found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSermons.map((sermon, index) => (
                  <TableRow
                    key={sermon._id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="text-sm text-gray-800">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-sm text-gray-800">
                      {sermon.title}
                    </TableCell>
                    <TableCell className="text-sm text-gray-800">
                      {sermon.arabicTitle}
                    </TableCell>
                    <TableCell className="text-sm text-gray-800">
                      {sermon.subTitle}
                    </TableCell>
                    <TableCell className="space-x-2 text-center">
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigateToSermonDetails(sermon)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <BookOpen />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Details</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            className="text-gray-500 hover:text-gray-700"
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedSermon(sermon)}
                          >
                            <Pencil />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            className="text-red-500 hover:text-red-700"
                            variant="outline"
                            size="icon"
                            onClick={() => setSermonToDelete(sermon)}
                          >
                            <Trash2 />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedSermon && (
        <EditSermonDialog
          Sermon={selectedSermon}
          selectedSermon={selectedSermon}
          setSelectedSermon={setSelectedSermon}
          fetchSermons={fetchSermons}
        />
      )}
      <Dialog
        open={!!sermonToDelete}
        onOpenChange={() => setSermonToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you sure you want to delete the Semon "{sermonToDelete?.title}
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
              Delete Sermon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditSermonDialog({
  sermon,
  selectedSermon,
  setSelectedSermon,
  fetchSermons,
}) {
  const [editedSermon, setEditedSermon] = useState(sermon);

  const handleEditSermon = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/sermons/${sermon._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedSermon),
        },
      );

      const result = await response.json();
      if (response.ok) {
        fetchSermons();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setSelectedSermon(null);
    } catch (error) {
      toast.error("Failed to update Sermon");
    }
  };

  return (
    <Dialog
      open={!!selectedSermon}
      onOpenChange={() => setSelectedSermon(null)}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Sermon
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to the sermon information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Sermon Title
          </label>
          <Input
            value={editedSermon.title}
            onChange={(e) =>
              setEditedSermon({ ...editedSermon, title: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Sermon Arabic Title
          </label>
          <Input
            value={editedSermon.arabicTitle}
            onChange={(e) =>
              setEditedSermon({ ...editedSermon, arabicTitle: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Sermon Sub Title
          </label>
          <Input
            value={editedSermon.subTitle}
            onChange={(e) =>
              setEditedSermon({
                ...editedSermon,
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
            onClick={handleEditSermon}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Sermon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
