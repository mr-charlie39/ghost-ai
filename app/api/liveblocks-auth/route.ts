import { NextResponse } from "next/server";
import { getCurrentIdentity, checkProjectAccess } from "@/lib/project-access";
import {
  liveblocks,
  getUserColor,
  isLiveblocksConfigured,
  isRoomVerified,
  markRoomVerified,
} from "@/lib/liveblocks";

export async function POST(req: Request) {
  try {
    // 1. Require Clerk authentication (401 for unauthenticated requests)
    const identity = await getCurrentIdentity();
    if (!identity.userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication is required." },
        { status: 401 }
      );
    }

    // 2. Extract and validate room / project ID from request body
    const body = await req.json().catch(() => ({}));
    const room =
      typeof body?.room === "string"
        ? body.room.trim()
        : typeof body?.roomId === "string"
        ? body.roomId.trim()
        : "";

    if (!room) {
      return NextResponse.json(
        { error: "Bad Request", message: "Room ID is required." },
        { status: 400 }
      );
    }

    // 3. Verify project access using the database access helper (403 for unauthorized access)
    const { hasAccess } = await checkProjectAccess(
      room,
      identity.userId,
      identity.emails
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You do not have permission to access this project workspace.",
        },
        { status: 403 }
      );
    }

    // 4. Validate server-side Liveblocks configuration (500 for missing server configuration)
    if (!isLiveblocksConfigured()) {
      return NextResponse.json(
        {
          error: "CONFIG_MISSING",
          message:
            "LIVEBLOCKS_SECRET_KEY is not configured in .env.local. Obtain your key from https://liveblocks.io/dashboard/apikeys",
        },
        { status: 500 }
      );
    }

    // 5. Ensure the Liveblocks room exists (create only if not already verified in this process)
    if (!isRoomVerified(room)) {
      try {
        await liveblocks.getOrCreateRoom(room, {
          defaultAccesses: [],
          metadata: {
            projectId: room,
          },
        });
        markRoomVerified(room);
      } catch (roomError: unknown) {
        const errorMsg =
          roomError instanceof Error ? roomError.message : String(roomError);
        console.error("Liveblocks getOrCreateRoom rejected:", errorMsg);

        const isKeyInvalid =
          errorMsg.includes("Invalid secret key") ||
          errorMsg.includes("403") ||
          errorMsg.includes("Unauthorized");

        if (isKeyInvalid) {
          // 502 Bad Gateway / Integration Error for invalid external credentials
          return NextResponse.json(
            {
              error: "INVALID_CREDENTIALS",
              message:
                "The configured LIVEBLOCKS_SECRET_KEY is invalid. Please verify your credentials at https://liveblocks.io/dashboard/apikeys",
            },
            { status: 502 }
          );
        }

        return NextResponse.json(
          {
            error: "LIVEBLOCKS_SERVICE_ERROR",
            message: "Failed to connect to Liveblocks room service.",
          },
          { status: 502 }
        );
      }
    }

    // 6. Return a session token with user name, avatar, and generated cursor color
    const name = identity.name || identity.email || "Anonymous";
    const avatar = identity.avatarUrl || "";
    const color = getUserColor(identity.userId);

    const session = liveblocks.prepareSession(identity.userId, {
      userInfo: {
        name,
        avatar,
        color,
      },
    });

    session.allow(room, session.FULL_ACCESS);

    const { status, body: sessionBody } = await session.authorize();

    // Enforce strict response consistency: never return 200 if authorize failed
    if (status !== 200) {
      console.error(
        "Liveblocks session.authorize failed with status:",
        status,
        sessionBody
      );
      const isKeyInvalid =
        sessionBody.includes("INVALID_SECRET_KEY") ||
        sessionBody.includes("Invalid secret key") ||
        status === 403;

      if (isKeyInvalid) {
        return NextResponse.json(
          {
            error: "INVALID_CREDENTIALS",
            message:
              "The configured LIVEBLOCKS_SECRET_KEY is invalid. Please verify your credentials at https://liveblocks.io/dashboard/apikeys",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          error: "AUTHORIZATION_FAILED",
          message: "Liveblocks authorization failed.",
        },
        { status: 502 }
      );
    }

    return new Response(sessionBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("POST /api/liveblocks-auth unexpected error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred during authorization.",
      },
      { status: 500 }
    );
  }
}
