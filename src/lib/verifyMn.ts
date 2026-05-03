export interface VerifySessionOptions {
  phone: string;
  text: string;
  callback: string;
  responseSms?: string;
}

export interface VerifySessionResponse {
  sessionId: string;
  phone: string;
  shortcode: string;
  text: string;
  smsUri: string;
  displayInstruction: string;
  expiresAt: string;
}

export interface VerifySessionStatus {
  sessionId: string;
  phone: string;
  sessionStatus: "PENDING" | "VERIFIED" | "EXPIRED";
  callbackStatus: "PENDING" | "SENT" | "FAILED";
  verifiedAt?: string;
  expiresAt: string;
}

const API_BASE = "https://api.verify.mn";

function getApiKey() {
  const key = process.env.VERIFY_MN_API_KEY;
  if (!key) {
    throw new Error("VERIFY_MN_API_KEY is not defined in environment variables");
  }
  return key;
}

export async function createVerifySession(opts: VerifySessionOptions): Promise<VerifySessionResponse> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getApiKey()}`
    },
    body: JSON.stringify(opts)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create verify.mn session: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function getVerifySessionStatus(sessionId: string): Promise<VerifySessionStatus> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to get verify.mn session status: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function verifyPhone(phone: string, text: string, callbackUrl: string): Promise<boolean> {
    // This function satisfies the literal requirement but in a stateless web app, 
    // verification usually happens via webhook/polling.
    // We will use createVerifySession and getVerifySessionStatus primarily.
    const session = await createVerifySession({ phone, text, callback: callbackUrl });
    const maxAttempts = 100; // 300s / 3s = 100
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const status = await getVerifySessionStatus(session.sessionId);
        if (status.sessionStatus === "VERIFIED") return true;
        if (status.sessionStatus === "EXPIRED") return false;
    }
    return false;
}
