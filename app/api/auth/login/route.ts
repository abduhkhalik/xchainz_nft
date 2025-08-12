/* eslint-disable @typescript-eslint/no-explicit-any */
import { Xumm } from "xumm";
import { NextRequest, NextResponse } from "next/server";
import { getDefinitions, verifySignature } from "verify-xrpl-signature";

// Dynamic network (adjust based on env)
const NETWORK = process.env.XRPL_NETWORK ?? "XRPL"; // or "XAHAU" if that's your intent

const request = async (url: string, body?: any) => {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Failed to fetch definitions: ${res.status}`);
  return res.json();
};

const xumm = new Xumm(process.env.XUMM_API_KEY!, process.env.XUMM_API_SECRET!);

// [GET] Generate QR + WebSocket
export async function GET() {
  try {
    const payload = await xumm.payload?.createAndSubscribe(
      {
        txjson: {
          TransactionType: "SignIn",
        },
      },
      (event) => event.data.signed !== undefined
    );

    if (
      !payload?.created?.refs?.qr_png ||
      !payload.created.uuid ||
      !payload.websocket?.url
    ) {
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 500 }
      );
    }

    const { qr_png } = payload.created.refs;
    const { uuid } = payload.created;
    const { url: websocket } = payload.websocket;

    return NextResponse.json({ qr: qr_png, uuid, websocket });
  } catch (err) {
    console.error("❌ QR generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate QR" },
      { status: 500 }
    );
  }
}

// [POST] Verify signature + return signedBy
export async function POST(req: NextRequest) {
  try {
    const { uuid } = await req.json();
    if (!uuid) {
      return NextResponse.json({ error: "Missing UUID" }, { status: 400 });
    }

    const payload = await xumm.payload?.get(uuid);

    if (!payload?.meta?.signed || !payload.response?.hex) {
      return NextResponse.json(
        { error: "Payload not signed or invalid" },
        { status: 400 }
      );
    }

    const txHex = payload.response.hex;
    const definitions = await getDefinitions(NETWORK, request);
    const result = verifySignature(txHex, undefined, definitions);

    if (!result.signatureValid) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      account: result.signedBy,
      signatureMultiSign: result.signatureMultiSign ?? false,
    });
  } catch (err) {
    console.error("❌ Signature verification error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
