'use client'

import { Button } from "@nextui-org/button";

interface CustomError extends Error {
    errMessage: string;
}

const Error = ({
    error, 
    reset
}: {
    error: CustomError;
    reset?: () => void
}) => {
  return (
    <div className="flex justify-center items-center h-[100vh]">
        <div className="text-center">
            <div className="text-4xl font-bold">{error?.errMessage}</div>
            <p className="text-3xl">
                <span className="text-red-600">Something went wrong!</span>
            </p>
            <p className="text-2xl font-bold mb-4">Sorry for inconvience</p>
            <Button color="primary" onClick={() => reset?.()}>Try Again</Button>
        </div>
    </div>
  )
}

export default Error