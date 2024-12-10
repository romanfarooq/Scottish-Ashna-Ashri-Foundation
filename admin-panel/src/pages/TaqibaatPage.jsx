import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Pencil, Trash2, BookOpen, Plus, Loader2, SearchIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

const API_URL = import.meta.env.VITE_API_URL

export function TaqibaatPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [taqibaats, setTaqibaats] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTaqibaats, setFilteredTaqibaats] = useState([])
  const [selectedTaqibaat, setSelectedTaqibaat] = useState(null)
  const [taqibaatToDelete, setTaqibaatToDelete] = useState(null)
  const [newTaqibaat, setNewTaqibaat] = useState({
    title: "",
    subTitle: "",
    arabicTitle: "",
    text: "",
    translations: [],
  })

  const fetchTaqibaats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/v1/admin/taqibaats`, {
        credentials: "include",
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message)
      }
      setTaqibaats(data.taqibaats)
      setFilteredTaqibaats(data.taqibaats)
    } catch (error) {
      toast.error("Failed to load taqibaats")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTaqibaats()
  }, [fetchTaqibaats])

  useEffect(() => {
    const filtered = taqibaats.filter((taqibaat) => {
      return (
        taqibaat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taqibaat.subTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    setFilteredTaqibaats(filtered)
  }, [searchTerm, taqibaats])

  const handleAddTaqibaat = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/taqibaats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTaqibaat),
      })

      const result = await response.json()
      if (response.ok) {
        toast.success(result.message)
        fetchTaqibaats()
      } else {
        toast.error(result.message)
      }
      setNewTaqibaat({
        title: "",
        arabicTitle: "",
        subTitle: "",
        text: "",
        translations: [],
      })
    } catch (error) {
      toast.error("Failed to add Taqibaat")
    }
  }

  const handleDeleteConfirmed = async () => {
    if (taqibaatToDelete) {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/admin/taqibaats/${taqibaatToDelete._id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        )

        const result = await response.json()
        if (response.ok) {
          toast.success(result.message)
          fetchTaqibaats()
        } else {
          toast.error(result.message)
        }
        setTaqibaatToDelete(null)
      } catch (error) {
        toast.error("Failed to delete Taqibaat")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="mt-4 text-xl text-gray-600">Loading...</p>
      </div>
    )
  }

  const navigateToTaqibaatDetails = (taqibaat) => {
    navigate(`/taqibaat-details/${taqibaat._id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Taqibaat Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search taqibaats..."
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
                    <Plus size={16} /> Add Taqibaat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                      Add New Taqibaat
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Fill in the details below to add a new Taqibaat to the
                      collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        placeholder="Enter Taqibaat Title"
                        value={newTaqibaat.title}
                        onChange={(e) =>
                          setNewTaqibaat({ ...newTaqibaat, title: e.target.value })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Arabic Title
                      </label>
                      <Input
                        placeholder="Enter Taqibaat Arabic Title"
                        value={newTaqibaat.arabicTitle}
                        onChange={(e) =>
                          setNewTaqibaat({ ...newTaqibaat, arabicTitle: e.target.value })
                        }
                        className="focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Sub Title
                      </label>
                      <Input
                        placeholder="Enter Taqibaat Sub Title (optional)"
                        value={newTaqibaat.subTitle}
                        onChange={(e) =>
                          setNewTaqibaat({ ...newTaqibaat, subTitle: e.target.value })
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
                      onClick={handleAddTaqibaat}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Taqibaat
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
              {filteredTaqibaats.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No taqibaats found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTaqibaats.map((taqibaat, index) => (
                  <TableRow
                    key={taqibaat._id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {taqibaat.title || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {taqibaat.arabicTitle || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {taqibaat.subTitle || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => navigateToTaqibaatDetails(taqibaat)}
                            >
                              <BookOpen size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            View Taqibaat Details
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => setSelectedTaqibaat(taqibaat)}
                              title="Edit taqibaat"
                            >
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Edit taqibaat
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="hover:bg-red-600"
                              onClick={() => setTaqibaatToDelete(taqibaat)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Delete taqibaat
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

      {selectedTaqibaat && (
        <EditTaqibaatDialog
          taqibaat={selectedTaqibaat}
          selectedTaqibaat={selectedTaqibaat}
          setSelectedTaqibaat={setSelectedTaqibaat}
          fetchTaqibaats={fetchTaqibaats}
        />
      )}
      <Dialog open={!!taqibaatToDelete} onOpenChange={() => setTaqibaatToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Are you sure you want to delete the Taqibaat "{taqibaatToDelete?.title}"?
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
              Delete Taqibaat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditTaqibaatDialog({ taqibaat, selectedTaqibaat, setSelectedTaqibaat, fetchTaqibaats }) {
  const [editedTaqibaat, setEditedTaqibaat] = useState(taqibaat)

  const handleEditTaqibaat = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/taqibaats/${taqibaat._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTaqibaat),
      })

      const result = await response.json()
      if (response.ok) {
        fetchTaqibaats()
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }

      setSelectedTaqibaat(null)
    } catch (error) {
      toast.error("Failed to update taqibaat")
    }
  }

  return (
    <Dialog open={!!selectedTaqibaat} onOpenChange={() => setSelectedTaqibaat(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Taqibaat
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Make changes to the taqibaat information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Taqibaat Title</label>
          <Input
            value={editedTaqibaat.title}
            onChange={(e) =>
              setEditedTaqibaat({ ...editedTaqibaat, title: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Taqibaat Arabic Title</label>
          <Input
            value={editedTaqibaat.arabicTitle}
            onChange={(e) =>
              setEditedTaqibaat({ ...editedTaqibaat, arabicTitle: e.target.value })
            }
            className="focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Taqibaat Sub Title
          </label>
          <Input
            value={editedTaqibaat.subTitle}
            onChange={(e) =>
              setEditedTaqibaat({
                ...editedTaqibaat,
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
            onClick={handleEditTaqibaat}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Update Taqibaat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}