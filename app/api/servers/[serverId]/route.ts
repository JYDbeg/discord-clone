import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function PATCH(req:Request,{params}:{params:{serverId:string}}){
    try{
        const profile = await currentProfile();
        const {name,imageUrl} = await req.json();
        if(!profile){
            return new NextResponse("Unauthorized",{status:401});

        }
        if (!params){
            return new NextResponse("Server ID Missing",{status:400});
        }
        const server = await db.server.update({
            where:{
                id:params.serverId,
                profileId:profile.id
            }
            ,data:{
               name,
               imageUrl
            }

        });
        return NextResponse.json(server);
    }
    catch(err){
        console.log("[SERVER_ID]",err);
        return new NextResponse("Internal Error",{status:500});
    }
}