import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

type AuthHandler<T = unknown> = (
  request: Request,
  token: string,
  context: T,
) => Promise<NextResponse>;

export function withAuth<T = unknown>(handler: AuthHandler<T>) {
  return async (request: Request, context: T): Promise<NextResponse> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ message: "Sessão inválida." }, { status: 401 });
    }

    return handler(request, token, context);
  };
}
