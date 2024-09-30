"use client"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import Link from "next/link";
import { init,tx,id } from "@instantdb/react"

type Schema = {
    users: {
        id: string
        userId: string
        createdAt: number
    }
}

export default function Login(){
    const [username, setUsername] = useState<string|null>(null)
    const [password, setPassword] = useState<string|null>(null)

    const router = useRouter()
    const APP_ID = '5e07a141-e7d9-4273-9cba-877a820f73dd'
    const db = init<Schema>({ appId: APP_ID })

    // Move the useQuery hook to the top level
    const query = { users: { userId: username } };
    const { isLoading, error, data } = db.useQuery(query);

    const onLogin = async() =>{
        try{
            const response = await axios.post("/api/login", {
                user_id: username,
                password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }              
            })

            const result = response.data;

            if (result.message === "Login successful") {
                toast.success("Login successful!");

                if(!isLoading){
                    const userExists = data && data.users && data.users.length > 0;

                    if (!userExists) {
                        const writeUserDataToInstantDB = async (userId: string) => {
                            try {
                                await db.transact(
                                    tx.users[id()].update({
                                        userId: userId,
                                        createdAt: Date.now()
                                    })
                                )
                            } catch (error) {
                                console.error("Error writing user data to InstantDB:", error)
                            }
                        }

                        await writeUserDataToInstantDB(username as string)
                    }
                }

                router.push('/')
            } else {
                toast.error("Login Failed: " + result.message);
            }
        } catch(err) {
            console.error(err)
            toast.error("An error occurred during login");
        }
    }

    return(
        <div className="flex flex-col justify-center items-center h-screen gap-2">
            <ToastContainer/>
            <span className="mb-1 font-bold">
                Đăng nhập
            </span>
            <div className="w-full px-3 flex justify-center">
                <input onChange={(event)=>setUsername(event.target.value)} className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid  rounded-2xl bg-gray-100 text-sm" type="text" id=""placeholder="Tên người dùng, số điện thoại hoặc email" />
            </div>
            <div className="w-full px-3 flex justify-center">
                <input onChange={(event)=>setPassword(event.target.value)} className="md:w-[370px] w-full px-6 py-4 focus outline-none border border-gray-300 border-solid  rounded-2xl bg-gray-100 text-sm" type="password" id=""placeholder="Mật khẩu" />
            </div>
            <div className="w-full px-3 flex justify-center">
                <button onClick={onLogin} className="md:w-[370px] w-full px-6 py-4  rounded-2xl bg-black text-white font-bold text-sm">Đăng nhập</button>
            </div>
            <button className="text-gray-400 text-sm mt-2">Bạn quên mật khẩu ư?</button>
            <Link href={'/register'} className="w-full px-3 flex justify-center">
                <button className="md:w-[370px] w-full px-6 py-4  rounded-2xl border border-solid border-black font-bold text-sm">Tạo tài khoản</button>
            </Link>
        </div>
    )
}