import toast from "react-hot-toast";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Loader2,
  Upload,
  Trash2,
  Play,
  CircleX,
  Plus,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

export function DuaDetailPage() {
  const { duaId } = useParams();
  const [dua, setDua] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] =
    useState(null);
  const [activeAudio, setActiveAudio] = useState(false);

  // Consolidated state objects
  const [editDua, setEditDua] = useState({
    title: "",
    arabicTitle: "",
    subTitle: "",
    text: "",
  });

  const [newTranslation, setNewTranslation] = useState({
    language: "",
    title: "",
    text: "",
    description: "",
  });

  const [editTranslation, setEditTranslation] = useState({
    language: "",
    title: "",
    text: "",
    description: "",
  });

  const fetchDua = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/duas/${duaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setDua(data.dua);
        setEditDua({
          title: data.dua.title,
          arabicTitle: data.dua.arabicTitle,
          subTitle: data.dua.subTitle,
          text: data.dua.text,
        });

        if (data.dua.translations?.length > 0) {
          setSelectedTranslationLanguage(data.dua.translations[0].language);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to fetch Dua.");
    } finally {
      setLoading(false);
    }
  }, [duaId]);

  useEffect(() => {
    fetchDua();
  }, [fetchDua]);

  const handleEditDua = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/duas/${duaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editDua),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Dua updated successfully");
        fetchDua();
      } else {
        toast.error(data.message || "Failed to update Dua");
      }
    } catch (error) {
      toast.error("Failed to update Dua");
    }
  };

  const handleEditTranslation = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/duas/${duaId}/translations/${selectedTranslationLanguage}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editTranslation),
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Translation updated successfully");
        fetchDua();
      } else {
        toast.error(data.message || "Failed to update translation");
      }
    } catch (error) {
      toast.error("Failed to update translation");
    }
  };

  const handleAddTranslation = async (e) => {
    e.preventDefault();

    if (!newTranslation.language || !newTranslation.text) {
      toast.error("Language and Translation are required");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/duas/${duaId}/translations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newTranslation),
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Translation added successfully");
        fetchDua();
        setNewTranslation({
          language: "",
          title: "",
          text: "",
          description: "",
        });
      } else {
        toast.error(data.message || "Failed to add translation");
      }
    } catch (error) {
      toast.error("Failed to add translation");
    }
  };

  const handleDeleteTranslation = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/duas/${duaId}/translations/${selectedTranslationLanguage}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Translation deleted successfully");
        fetchDua();
      } else {
        toast.error(data.message || "Failed to delete translation");
      }
    } catch (error) {
      toast.error("Failed to delete translation");
    }
  };

  const handleAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/duas/${duaId}/audio`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Audio uploaded successfully!");
        fetchDua();
      } else {
        toast.error(data.message || "Failed to upload audio.");
      }
    } catch (error) {
      toast.error("Audio upload failed.");
    }
  };

  const handleAudioDelete = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/duas/${duaId}/audio`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Audio removed successfully!");
        fetchDua();
        setActiveAudio(false);
      } else {
        toast.error(data.message || "Failed to remove audio.");
      }
    } catch (error) {
      toast.error("Audio removal failed.");
    }
  };

  const selectedTranslation = useMemo(() => {
    return dua?.translations?.find(
      (t) => t.language === selectedTranslationLanguage,
    );
  }, [dua, selectedTranslationLanguage]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-600" />
          <p className="text-xl font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Card>
        <CardHeader className="bg-gray-50/50 pb-4">
          <div className="flex flex-col items-center justify-between space-y-6">
            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">
                {dua.title} ({dua.arabicTitle})
                {dua.subTitle && (
                  <span className="mt-2 block text-xl text-gray-600">
                    {dua.subTitle}
                  </span>
                )}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <Separator className="my-2 bg-gray-200" />
        <CardContent className="space-y-4 bg-white p-6">
          <div className="flex w-full justify-end gap-5">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Dua</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Dua</DialogTitle>
                  <DialogDescription>
                    Make changes to the Dua details. Click save when you're
                    done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditDua} className="space-y-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="editTitle"
                      className="text-sm font-medium text-gray-600"
                    >
                      Title
                    </label>
                    <Input
                      id="editTitle"
                      value={editDua.title}
                      onChange={(e) =>
                        setEditDua({ ...editDua, title: e.target.value })
                      }
                      placeholder="Enter Dua title"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="editArabicTitle"
                      className="text-sm font-medium text-gray-600"
                    >
                      Arabic Title
                    </label>
                    <Input
                      id="editArabicTitle"
                      value={editDua.arabicTitle}
                      onChange={(e) =>
                        setEditDua({ ...editDua, arabicTitle: e.target.value })
                      }
                      placeholder="Enter Dua arabic title"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="editSubTitle"
                      className="text-sm font-medium text-gray-600"
                    >
                      Sub Title (Optional)
                    </label>
                    <Input
                      id="editSubTitle"
                      value={editDua.subTitle}
                      onChange={(e) =>
                        setEditDua({ ...editDua, subTitle: e.target.value })
                      }
                      placeholder="Enter Dua sub title"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="editText"
                      className="text-sm font-medium text-gray-600"
                    >
                      Dua Text
                    </label>
                    <Textarea
                      id="editText"
                      value={editDua.text}
                      onChange={(e) =>
                        setEditDua({ ...editDua, text: e.target.value })
                      }
                      placeholder="Enter Dua text"
                      className="w-full"
                      rows={6}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {selectedTranslationLanguage && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    onClick={() => {
                      setEditTranslation({
                        language: selectedTranslationLanguage,
                        title: selectedTranslation?.title || "",
                        text: selectedTranslation?.text || "",
                        description: selectedTranslation?.description || "",
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Translation</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Edit {selectedTranslationLanguage} Translation
                    </DialogTitle>
                    <DialogDescription>
                      Update the translation details. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditTranslation} className="space-y-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="editTranslationLanguage"
                        className="text-sm font-medium text-gray-600"
                      >
                        Language
                      </label>
                      <Input
                        id="editTranslationLanguage"
                        value={editTranslation.language}
                        onChange={(e) =>
                          setEditTranslation({
                            ...editTranslation,
                            language: e.target.value,
                          })
                        }
                        placeholder="Enter translation title"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="editTranslationTitle"
                        className="text-sm font-medium text-gray-600"
                      >
                        Title
                      </label>
                      <Input
                        id="editTranslationTitle"
                        value={editTranslation.title}
                        onChange={(e) =>
                          setEditTranslation({
                            ...editTranslation,
                            title: e.target.value,
                          })
                        }
                        placeholder="Enter translation title"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="editTranslationText"
                        className="text-sm font-medium text-gray-600"
                      >
                        Translation Text
                      </label>
                      <Textarea
                        id="editTranslationText"
                        value={editTranslation.text}
                        onChange={(e) =>
                          setEditTranslation({
                            ...editTranslation,
                            text: e.target.value,
                          })
                        }
                        placeholder="Enter translation text"
                        className="w-full"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="editTranslationDescription"
                        className="text-sm font-medium text-gray-600"
                      >
                        Description (Optional)
                      </label>
                      <Textarea
                        id="editTranslationDescription"
                        value={editTranslation.description}
                        onChange={(e) =>
                          setEditTranslation({
                            ...editTranslation,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter translation description"
                        className="w-full"
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Translation</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Translation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTranslation} className="space-y-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="translationLanguage"
                      className="text-sm font-medium text-gray-600"
                    >
                      Language
                    </label>
                    <Input
                      id="translationLanguage"
                      value={newTranslation.language}
                      onChange={(e) =>
                        setNewTranslation({
                          ...newTranslation,
                          language: e.target.value,
                        })
                      }
                      placeholder="Enter language"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="translationTitle"
                      className="text-sm font-medium text-gray-600"
                    >
                      Title
                    </label>
                    <Input
                      id="translationTitle"
                      value={newTranslation.title}
                      onChange={(e) =>
                        setNewTranslation({
                          ...newTranslation,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter title"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="translationText"
                      className="text-sm font-medium text-gray-600"
                    >
                      Translation
                    </label>
                    <Textarea
                      id="translationText"
                      value={newTranslation.text}
                      onChange={(e) =>
                        setNewTranslation({
                          ...newTranslation,
                          text: e.target.value,
                        })
                      }
                      placeholder="Enter translation"
                      className="w-full"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="translationDescription"
                      className="text-sm font-medium text-gray-600"
                    >
                      Description (Optional)
                    </label>
                    <Textarea
                      id="translationDescription"
                      value={newTranslation.description}
                      onChange={(e) =>
                        setNewTranslation({
                          ...newTranslation,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                      className="w-full"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Translation
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 shadow-sm">
            <div className="font-arabic text-right text-2xl leading-relaxed rtl:text-right">
              {dua.text}
            </div>
          </div>

          <div className="space-y-2">
            {dua.translations && dua.translations.length > 0 && (
              <div className="mb-4 flex items-center space-x-4 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
                <div className="flex w-full items-center space-x-3">
                  <div className="shrink-0 text-sm font-medium text-gray-600">
                    Translation:
                  </div>
                  <Select
                    value={selectedTranslationLanguage || ""}
                    onValueChange={setSelectedTranslationLanguage}
                  >
                    <SelectTrigger className="min-w-[180px] flex-grow border-gray-300 transition-all focus:ring-2 focus:ring-blue-200">
                      <SelectValue
                        placeholder="Choose Language"
                        className="text-gray-700"
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg bg-white shadow-md">
                      {dua.translations.map((translation) => (
                        <SelectItem
                          key={translation.language}
                          value={translation.language}
                          className="group cursor-pointer rounded-md px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <span className="transition-colors group-hover:text-blue-600">
                            {translation.language}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTranslationLanguage && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9 scale-90 bg-red-50 text-red-500 opacity-80 transition-all hover:scale-100 hover:bg-red-100 hover:text-red-600 hover:opacity-100"
                          onClick={handleDeleteTranslation}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                      >
                        Remove {selectedTranslationLanguage} Translation
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}

            {selectedTranslationLanguage && (
              <div className="rounded-lg bg-gray-50 p-4 shadow-sm">
                <h3 className="text-center text-lg font-bold text-gray-600">
                  {selectedTranslation?.title || (
                    <span className="italic text-gray-400">
                      No translation available
                    </span>
                  )}
                </h3>
                <div className="mt-2 text-base text-gray-600">
                  {selectedTranslation?.text || (
                    <span className="italic text-gray-400">
                      No translation available
                    </span>
                  )}
                </div>
                <div className="mt-2 border-t border-gray-200 pt-2 text-sm italic text-gray-500">
                  {selectedTranslation?.description || (
                    <span className="italic text-gray-400">
                      No description available
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Audio Recitation
              </span>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  id="audio-upload"
                  onChange={handleAudioUpload}
                />
                {dua.audioFileId ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-9 w-9 scale-90 opacity-80 transition-all hover:scale-100 hover:opacity-100"
                          onClick={() => setActiveAudio(!activeAudio)}
                        >
                          {activeAudio ? (
                            <CircleX className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {activeAudio ? "Stop Audio" : "Play Audio"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9 scale-90 bg-red-50 text-red-500 opacity-80 transition-all hover:scale-100 hover:bg-red-100 hover:text-red-600 hover:opacity-100"
                          onClick={handleAudioDelete}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                      >
                        Remove Audio
                      </TooltipContent>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 w-9 scale-90 opacity-80 transition-all hover:scale-100 hover:opacity-100"
                        onClick={() =>
                          document.getElementById("audio-upload").click()
                        }
                      >
                        <Upload className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                    >
                      Upload Audio
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            {activeAudio && (
              <div className="bg-gray-50 p-4">
                <audio
                  src={`${API_URL}/api/v1/admin/duas/${duaId}/audio`}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
