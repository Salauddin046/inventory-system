import sql from "@/lib/db";

/**
 * Generates next job card number in format JC-YY-NNNN
 * Example: JC-26-0001, JC-26-0002, ...
 * Resets to 0001 each year.
 *
 * MUST be called inside a transaction to avoid race conditions.
 */
export async function generateJobCardNumber(tx: any): Promise<string> {
  const year = new Date().getFullYear();
  const yy = String(year).slice(-2);

  // Atomic upsert + increment
  const result = await tx`
    INSERT INTO job_card_sequence (year, last_number)
    VALUES (${year}, 1)
    ON CONFLICT (year)
    DO UPDATE SET last_number = job_card_sequence.last_number + 1
    RETURNING last_number
  `;

  const nextNum = result[0].last_number;
  const padded = String(nextNum).padStart(4, "0");

  return `JC-${yy}-${padded}`;
}