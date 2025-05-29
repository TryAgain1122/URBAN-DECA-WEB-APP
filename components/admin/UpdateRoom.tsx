// "use client";

// import React, { useEffect, useState } from "react";

// import {
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   Divider,
//   Image,
//   Input,
//   Button,
//   Textarea,
//   Spinner,
// } from "@nextui-org/react";
// import { IRoom } from "@/backend/models/room";
// import { useRouter } from "next/navigation";
// import { useUpdateRoomMutation } from "@/redux/api/roomApi";
// import toast from "react-hot-toast";
// import { revalidateTag } from "@/helpers/revalidate";

// interface Props {
//   data: {
//     room: IRoom;
//   };
// }

// const selectStyles =
//   "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

// const UpdateRoom = ({ data }: Props) => {
//   const room = data?.room;

//   const [roomDetails, setRoomDetails] = useState({
//     name: room?.name,
//     price: room?.pricePerNight,
//     description: room?.description,
//     address: room?.address,
//     category: room?.category,
//     guestCapacity: room?.guestCapacity,
//     numOfBeds: room?.numOfBeds,
//     internet: room?.isInternet,
//     breakfast: room?.isBreakfast,
//     airConditioned: room?.isAirConditioned,
//     petsAllowed: room?.isPetsAllowed,
//     roomCleaning: room?.isRoomCleaning,
//   });

//   const {
//     name,
//     price,
//     description,
//     address,
//     category,
//     guestCapacity,
//     numOfBeds,
//     internet,
//     breakfast,
//     airConditioned,
//     petsAllowed,
//     roomCleaning,
//   } = roomDetails;

//   const router = useRouter();

//   const [images, setImages] = useState<string[]>([]);
//   const [updateRoom, { isLoading, error, isSuccess }] = useUpdateRoomMutation();

//   useEffect(() => {
//     if (error && "data" in error) {
//       const errorMessage =
//         (error as any)?.data?.errMessage || "An error occurred";
//       toast.error(errorMessage);
//     }
//     if (isSuccess) {
//       revalidateTag("RoomDetails");
//       router.refresh();
//       toast.success("Room Updated");
//     }
//   }, [error, isSuccess, router]);

//   const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const roomData = {
//       name,
//       pricePerNight: price,
//       description,
//       address,
//       category,
//       guestCapacity: Number(guestCapacity),
//       numOfBeds: Number(numOfBeds),
//       isInternet: internet,
//       isBreakfast: breakfast,
//       isAirConditioned: airConditioned,
//       isPetsAllowed: petsAllowed,
//       isRoomCleaning: roomCleaning,
//       images,
//     };

//     updateRoom({ id: room._id, body: roomData });
//   };

//   const onChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     setRoomDetails({
//       ...roomDetails,
//       [e.target.name]:
//         e.target.type === "checkbox"
//           ? (e.target as HTMLInputElement).checked
//           : e.target.value,
//     });
//   };

//   const onImageChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files);

//       const base64Images = await Promise.all(
//         filesArray.map((file) => {
//           return new Promise<string>((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result as string);
//             reader.onerror = (error) => reject(error);
//             reader.readAsDataURL(file);
//           })
//         })
//       )
//       setImages(base64Images);
//     }
//   };

//   const roomFeatures: { name: string; value: keyof typeof roomDetails }[] = [
//     { name: "Internet", value: "internet" },
//     { name: "Breakfast", value: "breakfast" },
//     { name: "Air Conditioned", value: "airConditioned" },
//     { name: "Pets Allowed", value: "petsAllowed" },
//     { name: "Room Cleaning", value: "roomCleaning" },
//   ];
//   return (
//     <div className="flex justify-center items-center py-10 px-4">
//       <form onSubmit={submitHandler} className="w-full max-w-4xl">
//         <Card className="w-full">
//           <CardHeader className="flex items-center gap-3">
//             <Image
//               alt="nextui logo"
//               height={40}
//               radius="sm"
//               src="/images/logo.png"
//               width={40}
//             />
//             <div className="flex flex-col">
//               <p className="text-lg font-semibold">Urban Deca Tower</p>
//               <p className="text-sm text-gray-500">Update Room Details</p>
//             </div>
//           </CardHeader>
//           <Divider />
//           <CardBody className="grid md:grid-cols-2 grid-cols-1 gap-6">
//             <div className="flex flex-col gap-4">
//               <Input
//                 type="text"
//                 label="Name"
//                 name="name"
//                 onChange={onChange}
//                 value={name}
//                 isRequired
//               />
//               <Input
//                 type="text"
//                 label="Price"
//                 name="price"
//                 onChange={onChange}
//                 value={price.toString()}
//                 isRequired
//               />
//               <Input
//                 type="text"
//                 label="Address"
//                 name="address"
//                 onChange={onChange}
//                 value={address}
//                 isRequired
//               />
//             </div>
//             <div className="flex flex-col gap-4">
//               <select
//                 className={selectStyles}
//                 id="room_type_field"
//                 name="category"
//                 value={category}
//                 onChange={onChange}
//               >
//                 {["King", "Single", "Twins"].map((value) => (
//                   <option key={value} value={value}>
//                     {value}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 className={selectStyles}
//                 name="guestCapacity"
//                 value={guestCapacity}
//                 onChange={onChange}
//               >
//                 {[1, 2, 3, 4, 5, 6].map((num) => (
//                   <option key={num} value={num}>
//                     {num}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 id="numofbeds_field"
//                 name="numOfBeds"
//                 value={numOfBeds}
//                 onChange={onChange}
//                 className={selectStyles}
//               >
//                 {[1, 2, 3].map((num) => (
//                   <option key={num} value={num}>
//                     {num}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-2">
//             {/* <Input
//                   type="file"
//                   label="Room Image"
//                   name="image"
//                   onChange={onImageChange}
//                   className="mb-4"
//                   accept="image/*"
//                   multiple // Allow multiple images
//                 /> */}
//               <Textarea
//                 label="Description"
//                 variant="bordered"
//                 placeholder="Enter your description"
//                 disableAnimation
//                 disableAutosize
//                 name="description"
//                 value={description}
//                 onChange={onChange}
//                 classNames={{
//                   base: "w-full",
//                   input: "resize-y min-h-[40px]",
//                 }}
//               />
//             </div>
//             <div className="md:col-span-2 grid grid-cols-2 gap-4">
//               {roomFeatures?.map((feature) => (
//                 <div className="flex items-center gap-2" key={feature.name}>
//                   <input
//                     className="form-check-input"
//                     type="checkbox"
//                     id={feature.name}
//                     name={feature.value}
//                     onChange={onChange}
//                     checked={!!roomDetails[feature.value]}
//                   />
//                   <label
//                     className="form-check-label text-gray-700 dark:text-gray-300"
//                     htmlFor={feature.name}
//                   >
//                     {feature.name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </CardBody>
//           <Divider />
//           <CardFooter className="flex justify-end">
//             <Button
//               color="secondary"
//               variant="faded"
//               type="submit"
//               isDisabled={isLoading}
//             >
//               {isLoading ? <Spinner color="danger" size="sm" /> : "Update"}
//             </Button>
//           </CardFooter>
//         </Card>
//       </form>
//     </div>
//   );
// };

// export default UpdateRoom;

// "use client";

// import { IImage, IRoom } from "@/backend/models/room";
// import { revalidateTag } from "@/helpers/revalidate";
// import {
//   useDeleteRoomImageMutation,
//   useUploadRoomImagesMutation,
// } from "@/redux/api/roomApi";
// import { useRouter } from "next/navigation";
// import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   Divider,
//   Image,
//   Input,
//   Button,
//   Link,
//   Skeleton,
//   Spinner,
// } from "@nextui-org/react";

// interface Props {
//   data: {
//     room: IRoom;
//   };
// }

// const UpdateRoom = ({ data }: Props) => {
//   const router = useRouter();

//   // Room detail states (initialize with data from props)
//   const [name, setName] = useState(data?.room?.name || "");
//   const [price, setPrice] = useState(data?.room?.pricePerNight || 0);
//   const [description, setDescription] = useState(data?.room?.description || "");
//   const [address, setAddress] = useState(data?.room?.address || "");
//   const [category, setCategory] = useState(data?.room?.category || "");
//   const [guestCapacity, setGuestCapacity] = useState(
//     data?.room?.guestCapacity || 1
//   );
//   const [numOfBeds, setNumOfBeds] = useState(data?.room?.numOfBeds || 1);
//   const [internet, setInternet] = useState(data?.room?.isInternet || false);
//   const [breakfast, setBreakfast] = useState(data?.room?.isBreakfast || false);
//   const [airConditioned, setAirConditioned] = useState(
//     data?.room?.isAirConditioned || false
//   );
//   const [petsAllowed, setPetsAllowed] = useState(data?.room?.isPetsAllowed || false);
//   const [roomCleaning, setRoomCleaning] = useState(
//     data?.room?.isRoomCleaning || false
//   );

//   // Images
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [images, setImages] = useState<string[]>([]); // New images base64
//   const [imagesPreview, setImagesPreview] = useState<string[]>([]);
//   const [uploadedImages, setUploadedImages] = useState<IImage[]>([]); // Existing images

//   // Load existing images on mount or data change
//   useEffect(() => {
//     if (data) {
//       setUploadedImages(data?.room?.images);
//     }
//   }, [data]);

//   // Upload and delete mutations
//   const [uploadRoomImages, { error, isLoading, isSuccess }] =
//     useUploadRoomImagesMutation();

//   const [
//     deleteRoomImage,
//     { error: deleteError, isLoading: isDeleteLoading, isSuccess: isDeleteSuccess },
//   ] = useDeleteRoomImageMutation();

//   // Handle upload success/error
//   useEffect(() => {
//     if (error && "data" in error) {
//       const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
//       toast.error(errorMessage);
//     }
//     if (isSuccess) {
//       revalidateTag("RoomDetails");
//       setImagesPreview([]);
//       setImages([]);
//       router.refresh();
//       toast.success("Room updated successfully");
//     }
//   }, [error, isSuccess, router]);

//   // Handle delete success/error
//   useEffect(() => {
//     if (deleteError && "data" in deleteError) {
//       const errorMessage = (deleteError as any)?.data?.errMessage || "An error occurred";
//       toast.error(errorMessage);
//     }
//     if (isDeleteSuccess) {
//       revalidateTag("RoomDetails");
//       router.refresh();
//       toast.success("Image Deleted");
//     }
//   }, [deleteError, isDeleteSuccess, router]);

//   // File input change handler (for new images)
//   const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
//     const files = Array.from(e.target.files || []);

//     setImages([]);
//     setImagesPreview([]);

//     files.forEach((file) => {
//       const reader = new FileReader();

//       reader.onload = () => {
//         if (reader.readyState === 2) {
//           setImages((oldArray) => [...oldArray, reader.result as string]);
//           setImagesPreview((oldArray) => [...oldArray, reader.result as string]);
//         }
//       };

//       reader.readAsDataURL(file);
//     });
//   };

//   // Remove previewed image before uploading
//   const removeImagePreview = (imgUrl: string) => {
//     const filteredImagesPreview = imagesPreview.filter((img) => img !== imgUrl);
//     setImagesPreview(filteredImagesPreview);
//     setImages(filteredImagesPreview);
//   };

//   // Delete image already uploaded on server
//   const handleImageDelete = (imgId: string) => {
//     deleteRoomImage({ id: data?.room?._id, body: { imgId } });
//   };

//   // Reset file input on click
//   const handleResetFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Submit handler - upload images + room data
//   const submitHandler = (e: React.FormEvent) => {
//     e.preventDefault();

//     const roomData = {
//       name,
//       pricePerNight: price,
//       description,
//       address,
//       category,
//       guestCapacity: Number(guestCapacity),
//       numOfBeds: Number(numOfBeds),
//       isInternet: internet,
//       isBreakfast: breakfast,
//       isAirConditioned: airConditioned,
//       isPetsAllowed: petsAllowed,
//       isRoomCleaning: roomCleaning,
//       images, // new images as base64 strings
//     };

//     // Make sure there is something to upload
//     if (images.length === 0 && uploadedImages.length === 0) {
//       toast.error("No images to upload");
//       return;
//     }

//     // Call upload mutation with roomData
//     uploadRoomImages({ id: data?.room?._id, body: roomData });
//   };

//   return (
//     <form onSubmit={submitHandler}>
//       <Card className="max-w-[600px] mt-10 mx-auto">
//         <CardHeader>
//           <h2 className="text-lg font-semibold">Update Room Details</h2>
//         </CardHeader>
//         <Divider />
//         <CardBody className="flex flex-col gap-4">
//           {/* Room info inputs */}
//           <Input
//             label="Room Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//           <Input
//             label="Price Per Night"
//             type="number"
//             value={price}
//             onChange={(e) => setPrice(Number(e.target.value))}
//             required
//           />
//           <Input
//             label="Description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//           />
//           <Input
//             label="Address"
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             required
//           />
//           <Input
//             label="Category"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             required
//           />
//           <Input
//             label="Guest Capacity"
//             type="number"
//             value={guestCapacity}
//             onChange={(e) => setGuestCapacity(Number(e.target.value))}
//             required
//           />
//           <Input
//             label="Number of Beds"
//             type="number"
//             value={numOfBeds}
//             onChange={(e) => setNumOfBeds(Number(e.target.value))}
//             required
//           />

//           {/* Checkbox toggles for booleans */}
//           <label>
//             <input
//               type="checkbox"
//               checked={internet}
//               onChange={() => setInternet(!internet)}
//             />{" "}
//             Internet
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               checked={breakfast}
//               onChange={() => setBreakfast(!breakfast)}
//             />{" "}
//             Breakfast
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               checked={airConditioned}
//               onChange={() => setAirConditioned(!airConditioned)}
//             />{" "}
//             Air Conditioned
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               checked={petsAllowed}
//               onChange={() => setPetsAllowed(!petsAllowed)}
//             />{" "}
//             Pets Allowed
//           </label>
//           <label>
//             <input
//               type="checkbox"
//               checked={roomCleaning}
//               onChange={() => setRoomCleaning(!roomCleaning)}
//             />{" "}
//             Room Cleaning
//           </label>

//           {/* File input for new images */}
//           <Input
//             ref={fileInputRef}
//             type="file"
//             label="Upload Images"
//             multiple
//             onChange={onChange}
//             onClick={handleResetFileInput}
//           />

//           {/* Preview new images */}
//           {imagesPreview.length > 0 && (
//             <div>
//               <p>New Images Preview</p>
//               <div className="flex flex-wrap gap-3">
//                 {imagesPreview.map((img, index) => (
//                   <div key={index} className="relative">
//                     <Image
//                       isZoomed
//                       src={img}
//                       alt={`Preview ${index}`}
//                       width={150}
//                       height={100}
//                     />
//                     <Button
//                       size="sm"
//                       color="danger"
//                       className="absolute top-0 right-0"
//                       onClick={() => removeImagePreview(img)}
//                     >
//                       &times;
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Show already uploaded images */}
//           {uploadedImages.length > 0 && (
//             <div>
//               <p>Uploaded Images</p>
//               <div className="flex flex-wrap gap-3">
//                 {uploadedImages.map((img) => (
//                   <div key={img.public_id} className="relative">
//                     <Image
//                       isZoomed
//                       src={img.url}
//                       alt={img.url}
//                       width={150}
//                       height={100}
//                     />
//                     <Button
//                       size="sm"
//                       color="danger"
//                       className="absolute top-0 right-0"
//                       onClick={() => handleImageDelete(img.public_id)}
//                       disabled={isDeleteLoading || isLoading}
//                     >
//                       &times;
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </CardBody>
//         <Divider />
//         <CardFooter className="flex justify-end gap-3">
//           <Link href="/">
//             <Button color="danger" variant="flat">
//               Cancel
//             </Button>
//           </Link>
//           <Button
//             type="submit"
//             color="primary"
//             disabled={isLoading || isDeleteLoading}
//           >
//             {isLoading ? <Spinner color="primary" /> : "Update Room"}
//           </Button>
//         </CardFooter>
//       </Card>
//     </form>
//   );
// };

// export default UpdateRoom;

"use client";

import React, { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Input,
  Button,
  Textarea,
  Spinner,
} from "@heroui/react";
import { IRoom } from "@/backend/models/room";
import { useRouter } from "next/navigation";
import { useUpdateRoomMutation } from "@/redux/api/roomApi";
import toast from "react-hot-toast";
import { revalidateTag } from "@/helpers/revalidate";

interface Props {
  data: {
    room: IRoom;
  };
}

const selectStyles =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

type ImageObject = {
  public_id: string;
  url: string;
};

const UpdateRoom = ({ data }: Props) => {
  const room = data?.room;

  const [roomDetails, setRoomDetails] = useState({
    name: room?.name || "",
    price: room?.pricePerNight || 0,
    description: room?.description || "",
    address: room?.address || "",
    category: room?.category || "",
    guestCapacity: room?.guestCapacity || 1,
    numOfBeds: room?.numOfBeds || 1,
    internet: room?.isInternet || false,
    breakfast: room?.isBreakfast || false,
    airConditioned: room?.isAirConditioned || false,
    petsAllowed: room?.isPetsAllowed || false,
    roomCleaning: room?.isRoomCleaning || false,
  });

  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  // Fix here: map IImage[] to string[] (image URLs)
  const [oldImages, setOldImages] = useState<ImageObject[]>(room?.images || []);

  const [updateRoom, { isLoading, error, isSuccess }] = useUpdateRoomMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }
    if (isSuccess) {
      revalidateTag("RoomDetails");
      router.refresh();
      toast.success("Room Updated");
    }
  }, [error, isSuccess, router]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const roomData = {
      name: roomDetails.name,
      pricePerNight: roomDetails.price,
      description: roomDetails.description,
      address: roomDetails.address,
      category: roomDetails.category,
      guestCapacity: Number(roomDetails.guestCapacity),
      numOfBeds: Number(roomDetails.numOfBeds),
      isInternet: roomDetails.internet,
      isBreakfast: roomDetails.breakfast,
      isAirConditioned: roomDetails.airConditioned,
      isPetsAllowed: roomDetails.petsAllowed,
      isRoomCleaning: roomDetails.roomCleaning,
      images: [...oldImages, ...images.map((img) => img)],
    };

    updateRoom({ id: room._id, body: roomData });
  };

  // Fix here: refine type guard for checkbox
  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setRoomDetails({
        ...roomDetails,
        [target.name]: target.checked,
      });
    } else {
      setRoomDetails({
        ...roomDetails,
        [target.name]: target.value,
      });
    }
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      const base64Images = await Promise.all(
        filesArray.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          });
        })
      );
      setImages(base64Images);
    }
  };

  const roomFeatures: { name: string; value: keyof typeof roomDetails }[] = [
    { name: "Internet", value: "internet" },
    { name: "Breakfast", value: "breakfast" },
    { name: "Air Conditioned", value: "airConditioned" },
    { name: "Pets Allowed", value: "petsAllowed" },
    { name: "Room Cleaning", value: "roomCleaning" },
  ];

  return (
    <div className="flex justify-center items-center py-10 px-4">
      <form onSubmit={submitHandler} className="w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader className="flex items-center gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="/images/logo.png"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Urban Deca Tower</p>
              <p className="text-sm text-gray-500">Update Room Details</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="grid md:grid-cols-2 grid-cols-1 gap-6">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                label="Name"
                name="name"
                onChange={onChange}
                value={roomDetails.name}
                isRequired
              />
              <Input
                type="text"
                label="Price"
                name="price"
                onChange={onChange}
                value={roomDetails.price.toString()}
                isRequired
              />
              <Input
                type="text"
                label="Address"
                name="address"
                onChange={onChange}
                value={roomDetails.address}
                isRequired
              />
            </div>
            <div className="flex flex-col gap-4">
              <select
                className={selectStyles}
                name="category"
                value={roomDetails.category}
                onChange={onChange}
              >
                {["King", "Single", "Twins"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select
                className={selectStyles}
                name="guestCapacity"
                value={roomDetails.guestCapacity}
                onChange={onChange}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <select
                name="numOfBeds"
                value={roomDetails.numOfBeds}
                onChange={onChange}
                className={selectStyles}
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Input
                type="file"
                label="Upload Room Images"
                name="image"
                onChange={onImageChange}
                className="mb-4"
                accept="image/*"
                multiple
              />

              {/* <div className="flex gap-4 flex-wrap mb-4">
                {oldImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img.url}
                    alt={`room-img-${index}`}
                    width={100}
                    height={100}
                    radius="sm"
                    className="object-cover"
                  />
                ))}
                {images.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`new-img-${index}`}
                    width={100}
                    height={100}
                    radius="sm"
                    className="object-cover"
                  />
                ))}
              </div> */}
              <div className="flex gap-4 flex-wrap mb-4">
                {oldImages.map((img, index) => (
                  <div
                    key={img.public_id}
                    className="relative group w-[100px] h-[100px]"
                  >
                    <Image
                      src={img.url}
                      alt={`room-img-${index}`}
                      width={100}
                      height={100}
                      radius="sm"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setOldImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold 
               opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group w-[100px] h-[100px]"
                  >
                    <Image
                      src={img}
                      alt={`new-img-${index}`}
                      width={100}
                      height={100}
                      radius="sm"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImages((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold 
               opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-lg"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <Textarea
                label="Description"
                variant="bordered"
                placeholder="Enter your description"
                name="description"
                value={roomDetails.description}
                onChange={onChange}
                classNames={{
                  base: "w-full",
                  input: "resize-y min-h-[40px]",
                }}
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {roomFeatures.map((feature) => (
                <div className="flex items-center gap-2" key={feature.name}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={feature.name}
                    name={feature.value}
                    onChange={onChange}
                    checked={!!roomDetails[feature.value]}
                  />
                  <label
                    className="form-check-label text-gray-700 dark:text-gray-300"
                    htmlFor={feature.name}
                  >
                    {feature.name}
                  </label>
                </div>
              ))}
            </div>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-end">
            <Button
              color="danger"
              type="submit"
              isDisabled={isLoading}
            >
              {isLoading ? <Spinner color="default" size="sm" /> : "Update"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default UpdateRoom;
