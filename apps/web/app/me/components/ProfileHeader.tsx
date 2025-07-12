"use client";

import { User } from "@/types/user";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils";
import { motion } from "framer-motion";
import {
  Verified,
  Mail,
  Calendar,
  Shield,
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";
import { useUploadAvatar, useDeleteAvatar } from "app/query/useUserQueries";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const userInitials = getInitials(user.username || "");
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle upload success
  const handleUploadSuccess = () => {
    toast.success("Avatar uploaded successfully!");
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    toast.success("Avatar deleted successfully!");
    setShowDeleteModal(false);
  };

  // Handle delete with loading toast
  const handleDeleteWithLoading = () => {
    // Show loading toast with spinner
    const loadingToast = toast(
      <div className="flex items-center gap-1.5">
        <Loader2 className="animate-spin h-4 w-4 text-red-500" />
        <span className="text-sm">Deleting avatar...</span>
      </div>,
      {
        duration: Infinity,
      }
    );

    deleteAvatar.mutate(undefined, {
      onSuccess: () => {
        toast.dismiss(loadingToast);
        handleDeleteSuccess();
      },
      onError: () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to delete avatar. Please try again.");
      },
    });
  };

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden border-b-4 border-gray-800 shadow-2xl">
      {/* Hybrid Dark Background */}
      {user.avatar ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={user.avatar}
            alt="Background"
            fill
            className="object-cover w-full h-full blur-xl brightness-40 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gray-900/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 h-full flex items-end gap-6">
        <div className="w-40 h-40 sm:w-52 sm:h-52 shadow-2xl rounded-full overflow-hidden border-4 border-gray-800 relative group cursor-pointer bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              width={208}
              height={208}
              className="object-cover w-full h-full group-hover:blur-[2px] transition-all duration-200"
            />
          ) : (
            <Avatar className="w-full h-full">
              <AvatarFallback className="text-6xl font-bold text-white group-hover:blur-[2px] transition-all duration-200 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 border-2 border-gray-800">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Hover Overlay with Upload/Delete Options */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-3">
              {/* Upload Option */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger file input click
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.onchange = (event) => {
                    const target = event.target as HTMLInputElement;
                    const file = target.files?.[0];
                    if (file) {
                      // Convert file to base64 and upload
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const base64Data = e.target?.result as string;

                        // Show loading toast with spinner
                        const loadingToast = toast(
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
                            <span className="text-sm">Uploading avatar...</span>
                          </div>,
                          {
                            duration: Infinity,
                          }
                        );

                        uploadAvatar.mutate(base64Data, {
                          onSuccess: () => {
                            toast.dismiss(loadingToast);
                            handleUploadSuccess();
                          },
                          onError: () => {
                            toast.dismiss(loadingToast);
                            toast.error(
                              "Failed to upload avatar. Please try again."
                            );
                          },
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  fileInput.click();
                }}
                disabled={uploadAvatar.isPending || deleteAvatar.isPending}
                className={`bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transition-colors duration-200 ${
                  uploadAvatar.isPending || deleteAvatar.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-white"
                }`}
              >
                <Camera size={24} className="text-gray-700" />
              </motion.button>

              {/* Delete Option - Only show if user has an avatar */}
              {user.avatar && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  disabled={uploadAvatar.isPending || deleteAvatar.isPending}
                  className={`bg-red-500/90 backdrop-blur-sm rounded-full p-3 shadow-lg transition-colors duration-200 ${
                    uploadAvatar.isPending || deleteAvatar.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-600"
                  }`}
                >
                  <Trash2 size={24} className="text-white" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="text-white space-y-2">
          <p className="uppercase text-xs tracking-widest text-gray-300">
            Profile
          </p>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
              {user.username}
            </h1>
            {user.isVerified && (
              <Verified size={32} className="text-blue-400" />
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Mail size={16} />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Shield size={16} />
            <span className="capitalize">
              {user.role?.toLowerCase() || "User"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar size={16} />
            <span>{user.isOurUser ? "Internal User" : "External User"}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-2 text-lg font-medium shadow-lg"
            >
              Edit Profile
            </motion.button>
          </div>
        </div>
      </div>

      {/* Delete Avatar Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              Delete Avatar
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your avatar? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteAvatar.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWithLoading}
              disabled={deleteAvatar.isPending}
            >
              {deleteAvatar.isPending ? "Deleting..." : "Delete Avatar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
