import { Xumm } from "xumm";
import { NextResponse } from "next/server";

const xumm = new Xumm(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

export async function GET() {
  try {
    const pong = await xumm.ping();
    if (!pong || !xumm.payload) {
      return NextResponse.json({ error: "XUMM unavailable" }, { status: 500 });
    }

    const payload = await xumm.payload.create({
      txjson: { TransactionType: "SignIn" },
      custom_meta: {
        instruction: "Sign request from " + pong.application.name,
      },
    });

    if (!payload) {
      return NextResponse.json({ error: "Payload creation failed" }, { status: 500 });
    }

    return NextResponse.json({
      uuid: payload.uuid,
      next: payload.next.always,
      qr: payload.refs.qr_png,
      websocket: payload.refs.websocket_status,
    });
  } catch (err) {
    console.error("XUMM Login Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
