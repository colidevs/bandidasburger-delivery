import type {NextRequest} from "next/server";

import {revalidatePath} from "next/cache";

export async function GET(request: NextRequest) {
  revalidatePath("/", "layout");

  return Response.json({
    Estado: "Actualizacion realizada con éxito",
  });
}
