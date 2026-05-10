import { NextResponse } from "next/server";
import { uploadFileToIrys, InsufficientFundsError } from "@/lib/storage/irys";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string" || !file.arrayBuffer) {
      return NextResponse.json(
        { error: "Nenhum arquivo válido enviado no corpo da requisição." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo excede o limite de 10MB." },
        { status: 413 }
      );
    }

    console.log(
      `[POST /api/upload] Recebido: ${file.name} (${file.size} bytes), tipo: ${file.type}`
    );

    // Converte File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload real via SDK Irys na Devnet
    const { url } = await uploadFileToIrys(buffer, file.type);

    console.log(`[POST /api/upload] Sucesso — URL: ${url}`);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error: any) {
    if (error instanceof InsufficientFundsError) {
      console.error("[POST /api/upload] Saldo insuficiente:", error.message);
      return NextResponse.json(
        {
          error:
            "Saldo insuficiente na tesouraria. Recarregue a conta Irys antes de continuar.",
          detail: error.message,
        },
        { status: 402 }
      );
    }

    console.error("[POST /api/upload Error]", error);
    return NextResponse.json(
      {
        error: `Erro interno no upload para o Arweave via Irys: ${error?.message || error}`,
      },
      { status: 500 }
    );
  }
}
