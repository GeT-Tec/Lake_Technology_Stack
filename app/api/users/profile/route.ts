import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "wallet is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet },
      include: { userProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      nickname: null, // Regra de Ouro: Nunca expor ou obter strings de nickname do banco de dados
      isCitizen: user.userProfile?.isCitizen ?? false,
      sbtImageUrl: user.userProfile?.sbtImageUrl ?? null, // URI/HASH do JSON de metadados no Arweave
      role: user.role,
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, sbtImageUrl, isCitizen } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }

    // Upsert User profile info - Garantindo que nickname seja sempre nulo no banco
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // If user does not exist, create them
      await prisma.user.create({
        data: {
          walletAddress,
          nickname: null,
        },
      });
    } else {
      await prisma.user.update({
        where: { walletAddress },
        data: { nickname: null },
      });
    }

    // Upsert UserProfile table
    const profile = await prisma.userProfile.findUnique({
      where: { walletAddress },
    });

    if (!profile) {
      await prisma.userProfile.create({
        data: {
          walletAddress,
          isCitizen: isCitizen || false,
          sbtImageUrl: sbtImageUrl || null,
          citizenshipMintDate: isCitizen ? new Date() : null,
        },
      });
    } else {
      await prisma.userProfile.update({
        where: { walletAddress },
        data: {
          isCitizen: isCitizen !== undefined ? isCitizen : profile.isCitizen,
          sbtImageUrl: sbtImageUrl !== undefined ? sbtImageUrl : profile.sbtImageUrl,
          citizenshipMintDate: isCitizen ? new Date() : profile.citizenshipMintDate,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
