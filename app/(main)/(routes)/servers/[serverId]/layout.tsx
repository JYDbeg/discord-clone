import { currentProfile } from "@/lib/current-profile";
import { redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { redirect } from "next/navigation"; 
const ServerIdLayout = async ({children,params}:{children:React.ReactNode,params:{serverId:string}}) => {
    const profile = await currentProfile();
    if (!profile) {
        return redirectToSignIn();
    }
    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id,
                }
            }
        },
        include: {
            channels: {
                where: {
                    name: "general"
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })
    if(!server) {
        redirect("/");
    }
    return (<div className="h-full">
        <div className="hidden md:flex h-full w-60 z-20 flex-col inset-y-0 fixed"><ServerSidebar serverId ={params.serverId}/></div>
        <main className="h-full md:pl-60">{children}</main>
       
    </div>)

}
export default ServerIdLayout;