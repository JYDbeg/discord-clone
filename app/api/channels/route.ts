import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
export async function DELETE(req: Request, { params }: { params: { memberId: string } }) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get('serverId');
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!serverId) {
            return new NextResponse("Server ID Missing", { status: 400 });
        }
        if (!params.memberId) {
            return new NextResponse("Member ID Missing", { status: 400 });
        }
        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id

                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        });
        return NextResponse.json(server);
    }
    catch (err) {
        console.log("[MEMBER_ID_DELETE]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }


}
export async function POST(req: Request) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const { name, type } = await req.json();
        const serverId = searchParams.get('serverId');

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });

        }
        if (!serverId) {
            return new NextResponse("Server ID Missing", { status: 400 });
        }
        if (name === "general") {
            return new NextResponse("Name cannot be 'general'", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id
                        ,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            }
            , data: {
                channels: {
                    create: {
                        profileId: profile.id,
                        name,
                        type,
                    }
                }
            }

        });
        return NextResponse.json(server);
    }
    catch (err) {
        console.log("[SERVER_ID]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}