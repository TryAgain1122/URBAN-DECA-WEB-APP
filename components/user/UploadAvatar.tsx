'use client'

import React, { FormEvent, useEffect, useState } from 'react'
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
import { useLazyUpdateSessionQuery, useUploadAvatarMutation } from '@/redux/api/userApi';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useRouter } from 'next/navigation';
import { setUser } from '@/redux/features/userSlice';
import toast from 'react-hot-toast';

const UploadAvatar = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [uploadAvatar, {isLoading, isSuccess, error}] = useUploadAvatarMutation()

    const [updateSession, { data }] = useLazyUpdateSessionQuery()

    if (data) dispatch(setUser(data?.user))
    
    const [avatar, setAvatar] = useState("")
    const [avatarPreview, setAvatarPreview] = useState(
      "/images/default_avatar.jpg"
    );

    const { user } = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (user?.avatar) {
            setAvatarPreview(user?.avatar_url);
        }

        if (error && "data" in error) {
            const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
            toast.error(errorMessage);
        }

        if (isSuccess) {
            updateSession(undefined).then((res) => {
                if (res?.data?.user?.avatar_url) {
                    dispatch(setUser(res.data.user));
                    setAvatarPreview(res.data.user.avatar_url);
                }
                router.refresh();
                toast.success("Image Uploaded")
            });
        }
    }, [user, error, isSuccess, router, updateSession, dispatch])

    const submitHandler = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData = { avatar }

        uploadAvatar(userData);
    }

    const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const files = Array.from(e.target.files || [])

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setAvatar(reader.result as string) 
                setAvatarPreview(reader.result as string)
            }
        }

        reader.readAsDataURL(files[0])
    }
  return (
    <div className='pr-5'>
      <form onSubmit={submitHandler}>
        <Card className="w-full mx-auto mt-24">
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src={avatarPreview || "/images/default_avatar.jpg"}
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md">Urban Deca Tower</p>
              <p className="text-small text-default-500">Upload Avatar</p>
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
                  type="file"
                  label="Upload Image"
                  name='avatar'
                  accept='image/*'
                  id='customFile'
                  onChange={onChange}           
                />
              </>
            )}
          </CardBody>
          <Divider />
          <CardFooter className="w-full flex justify-end gap-3 px-5">
            <Link href="/">
              <Button color="danger" variant="flat">
                Close
              </Button>
            </Link>
            <Button variant="faded" type="submit" isDisabled={isLoading}>
              {isLoading ? <Spinner color='danger'/> : "Upload"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default UploadAvatar

// 'use client'

// import React, { FormEvent, useEffect, useState } from 'react'
// import {
//     Card,
//     CardHeader,
//     CardBody,
//     CardFooter,
//     Divider,
//     Image,
//     Input,
//     Button,
//     Link,
//     Skeleton,
//     Spinner,
//   } from "@nextui-org/react";
// import { useLazyUpdateSessionQuery, useUploadAvatarMutation } from '@/redux/api/userApi';
// import ButtonLoader from '@/components/ButtonLoader';
// import { useAppDispatch, useAppSelector } from '@/redux/hook';
// import { useRouter } from 'next/navigation';
// import { setUser } from '@/redux/features/userSlice';
// import toast from 'react-hot-toast';

// const UploadAvatar = () => {
//     const dispatch = useAppDispatch();
//     const router = useRouter();

//     const [uploadAvatar, {isLoading, isSuccess, error}] = useUploadAvatarMutation()

//     const [updateSession, { data }] = useLazyUpdateSessionQuery()

//     if (data) dispatch(setUser(data?.user))
    
//     const [avatar, setAvatar] = useState("")
//     const [avatarPreview, setAvatarPreview] = useState("/images/default_avatar.jpg");

//     const { user } = useAppSelector((state) => state.auth)

//     useEffect(() => {
//         if (user?.avatar) {
//             setAvatarPreview(user?.avatar?.url);
//         }

//         if (error && "data" in error) {
//             const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
//             toast.error(errorMessage);
//         }

//         if (isSuccess) {
//             //@ts-ignore
//             // updateSession();
//             // router.refresh();
//             // toast.success("Image Updated")
//             updateSession().then((res) => {
//               if (res?.data?.user?.avatar?.url) {
//                 dispatch(setUser(res.data.user));
//                 setAvatar(res.data.user.avatar.url);
//               }
//               router.refresh();
//               toast.success("Image Updated")
//             })
//         }
//     },[user, error, isSuccess, router, updateSession])

//     const submitHandler = (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();

//         const userData = { avatar }

//         uploadAvatar(userData);
//     }

//     const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//         const files = Array.from(e.target.files || [])

//         const reader = new FileReader();
//         reader.onload = () => {
//             if (reader.readyState === 2) {
//                 setAvatar(reader.result as string) 
//                 setAvatarPreview(reader.result as string)
//             }
//         }

//         reader.readAsDataURL(files[0])
//     }
//   return (
//     <div className='pr-5'>
//       <form onSubmit={submitHandler}>
//         <Card className="w-full mx-auto mt-24">
//           <CardHeader className="flex gap-3">
//             <Image
//               alt="nextui logo"
//               height={40}
//               radius="sm"
//               src={avatarPreview || "/images/default_avatar.jpg"}
//               width={40}
//             />
//             <div className="flex flex-col">
//               <p className="text-md">Urban Deca Tower</p>
//               <p className="text-small text-default-500">Upload Avatar</p>
//             </div>
//           </CardHeader>
//           <Divider />
//           <CardBody className="gap-4 px-5">
//             {isLoading ? (
//               <>
//                 <Skeleton className="rounded-lg">
//                   <div className="h-24 rounded-lg bg-default-300"></div>
//                 </Skeleton>
//               </>
//             ) : (
//               <>
//                 <Input
//                   type="file"
//                   label="Upload Image"
//                   name='avatar'
//                   accept='images/*'
//                   id='customFile'
//                   onChange={onChange}
                  
//                 />
//               </>
//             )}
//           </CardBody>
//           <Divider />
//           <CardFooter className="w-full flex justify-end gap-3 px-5">
//             <Link href="/">
//               <Button color="danger" variant="flat">
//                 Close
//               </Button>
//             </Link>
//             <Button variant="faded" type="submit" isDisabled={isLoading}>
//               {isLoading ? <Spinner color='danger'/> : "Upload"}
//             </Button>
//           </CardFooter>
//         </Card>
//       </form>
//     </div>
//   )
// }

// export default UploadAvatar