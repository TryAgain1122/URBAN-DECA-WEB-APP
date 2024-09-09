"use client";

import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { IUser } from "@/backend/models/user";
import { useRouter } from "next/navigation";
import { useDeleteUserMutation } from "@/redux/api/userApi";
import toast from "react-hot-toast";

interface Props {
  data: {
    users: IUser[];
  };
}

const AllUsers = ({ data }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const users = data?.users;

  const router = useRouter();

  const [deleteUser, { error, isLoading, isSuccess }] = useDeleteUserMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      router.refresh();
      toast.success("User Deleted");
    }
  }, [error, isSuccess, router]);

  const setUsers = () => {
    const data: { columns: any[]; rows: any[] } = {
      columns: [
        { label: "ID", field: "id", sort: "asc" },
        { label: "Name", field: "name", sort: "asc" },
        { label: "Email", field: "email", sort: "asc" },
        { label: "Role", field: "role", sort: "asc" },
        { label: "Actions", field: "actions", sort: "asc" },
      ],
      rows: [],
    };

    users?.forEach((user) => {
      data?.rows.push({
        id: user._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        actions: (
          <div className="flex gap-4">
            <Link href={`/admin/users/${user._id}`} color="secondary">
              <i className="fa fa-pencil"></i>{" "}
            </Link>
            <Button isIconOnly onPress={onOpen} color="danger">
              <i className="fa fa-trash"></i>{" "}
            </Button>
            <Modal
              backdrop="opaque"
              isOpen={isOpen}
              onOpenChange={onOpenChange}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalBody>
                      <h1 className="mt-5">Are you sure do want to delete ?</h1>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        No
                      </Button>
                      <Button
                        color="secondary"
                        onPress={onClose}
                        onClick={() => deleteUserHandler(user._id as string)}
                      >
                        Yes
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        ),
      });
    });
    return data;
  };

  const deleteUserHandler = (id: string) => {
    deleteUser(id);
  };

  const userData = setUsers();

  return (
    <Table className="px-5 mt-10">
      <TableHeader>
        {userData.columns.map((column, index) => (
          <TableColumn key={index}>{column.label}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {userData.rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell>{row.actions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AllUsers;
