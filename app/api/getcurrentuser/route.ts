import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { decryptObjectValues } from "@/lib/dataSecurity";
import { ENCRYPTION_KEY } from "@/constants/env";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session) {
    const foundUser = await prisma.user.findUnique({
      where: {
        email: session?.user?.email!,
      },
      include: {
        usersManualCategories: {
          include: {
            assets: true,
          },
        },
      },
    });
    if (foundUser) {
      const encryptionKey =
        foundUser.id.slice(0, 4) + ENCRYPTION_KEY + foundUser.id.slice(-4);

      const response = {
        usersManualCategories: decryptObjectValues(
          foundUser.usersManualCategories,
          encryptionKey
        ) as typeof foundUser.usersManualCategories,
        id: foundUser?.id,
        name: foundUser?.name,
        username: foundUser?.username,
        email: foundUser?.email,
        emailVerified: foundUser?.emailVerified,
        whitelisted: foundUser.whitelisted,
        image: foundUser?.image,
      };

      return new Response(JSON.stringify(response));
    }
  }
}
