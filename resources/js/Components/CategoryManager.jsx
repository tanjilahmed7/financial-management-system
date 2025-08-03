import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/AlertDialog";
import { Button } from "@/Components/ui/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/Dialog";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import axios from "@/lib/axios";
import { Edit, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";

export function CategoryManager({ categories, onUpdateCategories }) {
    const [open, setOpen] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [editValue, setEditValue] = useState("");

    const addCategory = async () => {
        if (!newCategory.trim()) {
            alert("Please enter a category name.");
            return;
        }

        if (categories.some((cat) => cat.name === newCategory.trim())) {
            alert("This category already exists.");
            return;
        }

        try {
            const response = await axios.post("/api/categories", {
                name: newCategory.trim(),
                color: "#3B82F6", // Default blue color
                is_default: false,
            });

            const newCategoryData = response.data.data;
            onUpdateCategories([...categories, newCategoryData]);
            setNewCategory("");
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Failed to add category. Please try again.");
        }
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setEditValue(category.name);
    };

    const saveEdit = async () => {
        if (!editValue.trim()) {
            alert("Please enter a category name.");
            return;
        }

        if (
            editValue.trim() !== editingCategory.name &&
            categories.some((cat) => cat.name === editValue.trim())
        ) {
            alert("This category already exists.");
            return;
        }

        try {
            const response = await axios.put(
                `/api/categories/${editingCategory.id}`,
                {
                    name: editValue.trim(),
                }
            );

            const updatedCategoryData = response.data.data;
            const updatedCategories = categories.map((cat) =>
                cat.id === editingCategory.id ? updatedCategoryData : cat
            );
            onUpdateCategories(updatedCategories);
            setEditingCategory(null);
            setEditValue("");
        } catch (error) {
            console.error("Error updating category:", error);
            alert("Failed to update category. Please try again.");
        }
    };

    const deleteCategory = async (category) => {
        try {
            await axios.delete(`/api/categories/${category.id}`);
            const updatedCategories = categories.filter(
                (cat) => cat.id !== category.id
            );
            onUpdateCategories(updatedCategories);
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Failed to delete category. Please try again.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Manage Categories
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                    <DialogDescription>
                        Add, edit, or delete categories to organize your
                        transactions.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Add New Category */}
                    <div className="space-y-2">
                        <Label htmlFor="newCategory">Add New Category</Label>
                        <div className="flex gap-2">
                            <Input
                                id="newCategory"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Category name"
                                onKeyDown={(e) =>
                                    e.key === "Enter" && addCategory()
                                }
                            />
                            <Button onClick={addCategory} size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Existing Categories */}
                    <div className="space-y-2">
                        <Label>Existing Categories</Label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-2 border rounded"
                                >
                                    {editingCategory?.id === category.id ? (
                                        <div className="flex gap-2 flex-1">
                                            <Input
                                                value={editValue}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        saveEdit();
                                                    if (e.key === "Escape") {
                                                        setEditingCategory(
                                                            null
                                                        );
                                                        setEditValue("");
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={saveEdit}
                                                size="sm"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setEditingCategory(null);
                                                    setEditValue("");
                                                }}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="flex-1">
                                                {category.name}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    onClick={() =>
                                                        startEdit(category)
                                                    }
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Delete Category
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you
                                                                want to delete
                                                                the "
                                                                {category.name}"
                                                                category? This
                                                                action cannot be
                                                                undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    deleteCategory(
                                                                        category
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
