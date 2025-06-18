"use client";

import { revalidateTag } from "@/helpers/revalidate";
import {
  useDeleteRoomImageMutation,
  useUploadRoomImagesMutation,
} from "@/redux/api/roomApi";
import { useRouter } from "next/navigation";
import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Input,
  Button,
  Link,
  Skeleton,
  Spinner,
} from "@heroui/react";
import { IImage, IRoom } from "@/types/room";

interface Props {
  data: {
    room: IRoom;
  };
}

const   UploadRoomImages = ({ data }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<IImage[]>([]);

  useEffect(() => {
    if (data) {
      setUploadedImages(data?.room?.images);
    }
  }, [data]);

  const router = useRouter();

  const [uploadRoomImages, { error, isLoading, isSuccess }] =
    useUploadRoomImagesMutation();

  const [
    deleteRoomImage,
    {
      error: deleteError,
      isLoading: isDeleteLoading,
      isSuccess: isDeleteSuccess
    }
  ] = useDeleteRoomImageMutation()

  useEffect(() => {

    if (error && "data" in error) {
      const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
  }


    if (isSuccess) {
      revalidateTag("RoomDetails");
      setImagesPreview([]);
      router.refresh();
      toast.success("Images Uploaded");
    }
  }, [error, isSuccess, router]);

  useEffect(() => {

    if (deleteError && "data" in deleteError) {
      const errorMessage = (error as any)?.deleteError?.errMessage || "An error occurred";
      toast.error(errorMessage);
  }


    if (isDeleteSuccess) {
      revalidateTag("RoomDetails");
      router.refresh();
      toast.success("Image Deleted");
    }
  }, [deleteError, isDeleteSuccess, router, error]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);

    setImages([]);
    setImagesPreview([]);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setImages((oldArray) => [...oldArray, reader.result as string]);
          setImagesPreview((oldArray) => [
            ...oldArray,
            reader.result as string,
          ]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const submitHandler = () => {

    if (images.length === 0) {
      toast.error("No Image uploaded");
      return;
    }
    uploadRoomImages({ id: data?.room?.id, body: { images } });
  };

  const removeImagePreview = (imgUrl: string) => {
    const filteredImagesPreview = imagesPreview.filter((img) => img != imgUrl);

    setImagesPreview(filteredImagesPreview);
    setImages(filteredImagesPreview);
  };

  const handleImageDelete = (imgId: string) => {
    deleteRoomImage({ id: data?.room?.id, body: { imgId } });
  };

  const handleResetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <form>
        <Card className="max-w-[500px] mt-24">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Urban Deca Tower</p>
              <p className="text-small text-default-500">Choose image</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 px-5">
            {isLoading ? (
              <>
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300"></div>
                </Skeleton>
              </>
            ) : (
              <>
                <Input
                  ref={fileInputRef}
                  type="file"
                  label="Upload Image"
                  name="product_images"
                  onChange={onChange}
                  multiple
                  onClick={handleResetFileInput}
                  required
                />

                {imagesPreview?.length > 0 && (
                  <div>
                    <p>New Images</p>
                    <div>
                      {images?.map((img, index) => (
                        <div key={index}>
                          <Card>
                            <CardBody>
                              <div className="flex flex-row justify-between">
                                <Image
                                  isZoomed
                                  width={300}
                                  alt="Img Preview"
                                  src={img}
                                />
                                <Button
                                  onClick={() => removeImagePreview(img)}
                                  color="danger"
                                  className="mt-3"
                                >
                                  <i className="fa fa-times"></i>
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {uploadedImages?.length > 0 && (
              <div>
                <p>Room Uploaded Images</p>
                <div>
                  {uploadedImages?.map((img) => (
                    <Card key={img.public_id}>
                      <CardBody>
                        <div className="flex flex-row justify-between">
                          <Image
                            isZoomed
                            width={300}
                            alt={img?.url}
                            src={img?.url}
                          />
                          <Button
                            onClick={() => handleImageDelete(img.public_id)}
                            color="danger"
                            className="mt-3"
                            disabled={isDeleteLoading || isLoading}
                          >
                            <i className="fa fa-trash"></i>
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
          <Divider />
          <CardFooter className="w-full flex justify-end gap-3 px-5">
            <Link href="/">
              <Button color="danger" variant="flat">
                Close
              </Button>
            </Link>
            <Button
              variant="faded"
              color="secondary"
              type="submit"
              isDisabled={isLoading || isDeleteLoading}
              onClick={submitHandler}
            >
              {isLoading ? <Spinner color="secondary" /> : "Upload"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default UploadRoomImages;
