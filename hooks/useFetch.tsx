import { useState } from "react"
import { toast } from "sonner"

const useFetch = <T,>(cb: (...args: any[]) => Promise<T>) => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fn = async (...args: any[]): Promise<T | void> => {
        setLoading(true)
        setError(null)
        try {
            const res = await cb(...args)
            setData(res)
            return res
        } catch (error) {
            setError(error as Error)
            toast.error((error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return { data, loading, error, fn, setData }
}

export default useFetch