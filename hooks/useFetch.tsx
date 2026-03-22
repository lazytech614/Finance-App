import { useState } from "react"
import { toast } from "sonner"

const useFetch = (cb: Function) => {
    const [data, setData] = useState(undefined)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const fn = async(...args: any) => {
        setLoading(true)
        setError(null)
        try {
            const res = await cb(...args)
            setData(res)
            setError(null)
        } catch (error) {
            setError(error)
            toast.error((error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return {data, loading, error, fn, setData}
}

export default useFetch