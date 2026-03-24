"use client"

import { useEffect, useRef } from "react";
import { Input } from "../ui/input"
import useFetch from "@/hooks/useFetch";
import { scanRecipt } from "@/actions/transaction";
import { Button } from "../ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const ReciptScanner = ({onScanComplete}: any) => {

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const {
        loading: scanReciptLoading,
        fn: scanReciptFn,
        data: scanReciptData,
        error
    } = useFetch(scanRecipt)

    const handleReciptScan = async (file: any) => {
        if(file && file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB")
            return
        }

        await scanReciptFn(file)
    }

    useEffect(() => {
        if(!scanReciptLoading && scanReciptData) {
            onScanComplete(scanReciptData)
            toast.success("Recipt Scanned Successfully")
        }
    }, [scanReciptData, scanReciptLoading])

    useEffect(() => {
        if(error) {
            toast.error((error as Error).message || "Something went wrong")
        }
    }, [error])
 
  return (
    <div>
        <Input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
                const file = e.target.files?.[0]
                if(file) handleReciptScan(file)
            }}
        />
        <Button 
            className="w-full h-10 bg-linear-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity cursor-pointer text-white hover:text-white" 
            disabled={scanReciptLoading}
            type="button"
            variant={"outline"}
            onClick={() => fileInputRef.current?.click()}
        >
            {scanReciptLoading ? (
                <>
                    <Loader2 className="mr-2 animate-spin"/>
                    <span>Scanning Recipt...</span>
                </>
            ) : (
                <>
                    <Camera className="mr-2"/>
                    <span>Scan Recipt With AI</span>
                </>
            )}
        </Button>
    </div>
  )
}
