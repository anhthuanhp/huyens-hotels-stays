import { checkAvailability } from "../../lib/availability";

export async function POST(request: Request) {
  return checkAvailability(request);
}
