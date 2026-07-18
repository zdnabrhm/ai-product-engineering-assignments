import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@third-assignment/ui/components/alert";
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
} from "@third-assignment/ui/components/alert-dialog";
import { Button } from "@third-assignment/ui/components/button";
import { Spinner } from "@third-assignment/ui/components/spinner";
import { toast } from "@third-assignment/ui/components/sonner";
import { deleteRoadmapMutationOptions } from "../query";

type DeleteRoadmapDialogProps = {
  roadmapId: string;
  goal: string;
  onDeleted?: () => void | Promise<void>;
  size?: "default" | "sm";
};

export function DeleteRoadmapDialog({
  roadmapId,
  goal,
  onDeleted,
  size = "default",
}: DeleteRoadmapDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const deleteRoadmap = useMutation(deleteRoadmapMutationOptions(queryClient));

  const handleOpenChange = (nextOpen: boolean) => {
    if (deleteRoadmap.isPending) return;
    if (nextOpen) deleteRoadmap.reset();
    setOpen(nextOpen);
  };

  const handleDelete = () => {
    deleteRoadmap.mutate(roadmapId, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Roadmap deleted.");
        void onDeleted?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant="destructive" size={size} />}>
        <IconTrash data-icon="inline-start" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this roadmap?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">“{goal}”</span> will be permanently
            deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteRoadmap.isError ? (
          <Alert variant="destructive">
            <IconAlertTriangle />
            <AlertDescription>
              Could not delete this roadmap. Check the connection and try again.
            </AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteRoadmap.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={deleteRoadmap.isPending}
            onClick={handleDelete}
          >
            {deleteRoadmap.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconTrash data-icon="inline-start" />
            )}
            {deleteRoadmap.isPending ? "Deleting…" : "Delete permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
